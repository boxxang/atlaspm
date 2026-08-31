#!/usr/bin/env bash
#
# Update the installed copy.
#
# The order matters more than the commands do. A backup is taken before
# anything moves, because `prisma db push` has no reverse: once a column is
# gone the only way back is the dump. Then the new build is made while the old
# one is still serving, and the server is only restarted if that build
# succeeded — so a broken update leaves you running the version that worked.
#
#   ./update.sh [--dir ~/atlaspm] [--db atlaspm] [--no-backup]
#
set -euo pipefail

# Everything runs inside main(). Bash reads a script in chunks as it executes,
# and step 2 rewrites this very file — without the function, a pull that
# changed the line count would make bash resume at the wrong byte. A function
# is parsed whole before it runs, so the version that started is the version
# that finishes.
main() {

DIR="$HOME/atlaspm"
DB=atlaspm
BACKUP=1
LABEL=com.atlaspm.server

while [ $# -gt 0 ]; do
  case "$1" in
    --dir)       DIR="${2/#\~/$HOME}"; shift 2 ;;
    --db)        DB="$2"; shift 2 ;;
    --no-backup) BACKUP=0; shift ;;
    -h|--help)   sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "unknown option: $1" >&2; exit 1 ;;
  esac
done

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

say() { printf '\n\033[1m%s\033[0m\n' "$*"; }
die() { printf '\n\033[31m%s\033[0m\n' "$*" >&2; exit 1; }

[ -d "$DIR/.git" ] || die "$DIR is not an installed checkout. Pass --dir."
cd "$DIR"

PORT="$(/usr/libexec/PlistBuddy -c 'Print :ProgramArguments' \
  "$HOME/Library/LaunchAgents/$LABEL.plist" 2>/dev/null | grep -A1 '\-p' | tail -1 | tr -d ' ' || true)"
PORT="${PORT:-3210}"

say "1/5  Backing up first — db push cannot be undone"
if [ "$BACKUP" = 1 ]; then
  "$HERE/backup.sh" "$DB" | sed 's/^/  /'
else
  echo "  skipped (--no-backup)"
fi

WAS="$(git rev-parse HEAD)"
say "2/5  Fetching"

# An installed checkout lives on main. Anything else is either a deliberate pin
# or an accident, and the two want different answers — so say which it is
# rather than quietly moving it.
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$BRANCH" = HEAD ]; then
  die "This checkout is on a detached HEAD at $(git rev-parse --short HEAD), not on a branch.
If you pinned it there on purpose, leave it. Otherwise:
  cd $DIR && git checkout main"
elif [ "$BRANCH" != main ]; then
  die "This checkout is on '$BRANCH', not main. Updating it would pull that branch.
  cd $DIR && git checkout main"
fi

git pull --ff-only || die "pull failed — $DIR has commits that are not on origin/main.
Nothing here should have local commits; check with:
  cd $DIR && git log --oneline origin/main..HEAD"
NOW="$(git rev-parse HEAD)"
if [ "$WAS" = "$NOW" ]; then
  echo "  already up to date ($(git rev-parse --short HEAD))"
  exit 0
fi
echo "  $(git rev-parse --short "$WAS") -> $(git rev-parse --short "$NOW")"
git --no-pager log --oneline "$WAS..$NOW" | head -10 | sed 's/^/    /'

say "3/5  Installing dependencies"
npm ci

# The build applies the schema and compiles. It runs while the old server is
# still up: if it fails, nothing has been restarted and the machine is still
# serving the version that worked.
say "4/5  Building — this applies the schema too"
if ! npm run build; then
  git checkout -q "$WAS"
  npm ci >/dev/null
  die "Build failed. Rolled the checkout back to $(git rev-parse --short "$WAS"); the running server was not touched.

If it stopped on a data-loss warning, that is db push refusing to drop something
that holds rows. Move the data first, by hand, then run this again."
fi

say "5/5  Restarting"
launchctl kickstart -k "gui/$UID/$LABEL" 2>/dev/null || \
  launchctl bootstrap "gui/$UID" "$HOME/Library/LaunchAgents/$LABEL.plist"

for i in $(seq 1 30); do
  # -s without -S: a refused connection is the expected state while it boots,
  # not something to print thirty times.
  if curl -fs -o /dev/null --max-time 3 "http://127.0.0.1:$PORT/" 2>/dev/null; then
    printf '\n\033[1mUpdated.\033[0m  http://127.0.0.1:%s  is answering on %s\n' "$PORT" "$(git rev-parse --short HEAD)"
    exit 0
  fi
  sleep 1
done

die "Updated to $(git rev-parse --short HEAD), but http://127.0.0.1:$PORT is not answering.

  tail -50 $HOME/atlaspm-backups/server.log

To go back to what worked:
  cd $DIR && git checkout $(git rev-parse --short "$WAS") && npm ci && npm run build
  launchctl kickstart -k gui/$UID/$LABEL
If the schema moved, restore the dump this run just took from $HOME/atlaspm-backups."

}

main "$@"
