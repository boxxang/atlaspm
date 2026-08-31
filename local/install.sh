#!/usr/bin/env bash
#
# AtlasPM, installed on this machine and nowhere else.
#
# Clones the repository into its own directory, gives it its own database, and
# starts it on the loopback address. Nothing it stores leaves the machine:
# there are no outbound calls at runtime, the fonts are the system's, and
# attachments live in Postgres alongside everything else — which is also why a
# database dump is a complete backup.
#
# The checkout it makes is deliberately not the one you develop in. They would
# otherwise share a .env, and a `db push` aimed at one would land on the other.
#
#   ./install.sh [--dir ~/atlaspm] [--port 3210] [--db atlaspm] [--with-demo]
#
set -euo pipefail

DIR="$HOME/atlaspm"
PORT=3210
DB=atlaspm
REPO=https://github.com/boxxang/atlaspm.git
DEMO=0

while [ $# -gt 0 ]; do
  case "$1" in
    --dir)       DIR="${2/#\~/$HOME}"; shift 2 ;;
    --port)      PORT="$2"; shift 2 ;;
    --db)        DB="$2"; shift 2 ;;
    --with-demo) DEMO=1; shift ;;
    -h|--help)   sed -n '2,16p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "unknown option: $1" >&2; exit 1 ;;
  esac
done

say() { printf '\n\033[1m%s\033[0m\n' "$*"; }
die() { printf '\n\033[31m%s\033[0m\n' "$*" >&2; exit 1; }

say "1/7  Checking what is already here"
command -v node    >/dev/null || die "node not found.  brew install node"
command -v npm     >/dev/null || die "npm not found.  brew install node"
command -v psql    >/dev/null || die "psql not found.  brew install postgresql@17"
command -v createdb>/dev/null || die "createdb not found.  brew install postgresql@17"
psql -l >/dev/null 2>&1 || die "Postgres is not accepting connections.  brew services start postgresql@17"
echo "  node $(node -v) · $(psql --version)"

say "2/7  Fetching the app into $DIR"
if [ -d "$DIR/.git" ]; then
  git -C "$DIR" pull --ff-only
else
  [ -e "$DIR" ] && die "$DIR exists and is not a git checkout. Move it or pass --dir."
  git clone "$REPO" "$DIR"
fi
cd "$DIR"

say "3/7  Installing dependencies, and switching Next's telemetry off"
npm ci
npx --yes next telemetry disable

say "4/7  Creating the database"
if psql -lqt | cut -d'|' -f1 | grep -qw "$DB"; then
  echo "  $DB already exists — leaving its contents alone"
else
  createdb "$DB"
  echo "  created $DB"
fi
# The role name matters: a Homebrew Postgres has one login role, named after
# the OS user, and no `postgres`. Leaving the user out of the URL is what
# P1010 "denied access" looks like.
printf 'DATABASE_URL="postgresql://%s@localhost:5432/%s"\n' "$(whoami)" "$DB" > .env
chmod 600 .env

say "5/7  Applying the schema"
npx prisma db push
if [ "$DEMO" = 1 ]; then
  npx prisma db seed
else
  echo "  no demo data — the programs list starts empty, use New program"
fi

say "6/7  Building"
npm run build

say "7/7  Installing the background jobs"
mkdir -p "$HOME/Library/LaunchAgents" "$HOME/atlaspm-backups"
NPM_BIN="$(command -v npm)"
BREW_BIN_DIR="$(dirname "$(command -v node)")"

cat > "$HOME/Library/LaunchAgents/com.atlaspm.server.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.atlaspm.server</string>
  <key>ProgramArguments</key>
  <array>
    <string>$NPM_BIN</string><string>start</string><string>--</string>
    <!-- loopback only: this machine can reach it, the network cannot -->
    <string>-H</string><string>127.0.0.1</string>
    <string>-p</string><string>$PORT</string>
  </array>
  <key>WorkingDirectory</key><string>$DIR</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key><string>$BREW_BIN_DIR:/usr/bin:/bin:/usr/sbin:/sbin</string>
    <key>NODE_ENV</key><string>production</string>
  </dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>$HOME/atlaspm-backups/server.log</string>
  <key>StandardErrorPath</key><string>$HOME/atlaspm-backups/server.log</string>
</dict></plist>
PLIST

cat > "$HOME/Library/LaunchAgents/com.atlaspm.backup.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.atlaspm.backup</string>
  <key>ProgramArguments</key>
  <array><string>$DIR/local/backup.sh</string><string>$DB</string></array>
  <key>EnvironmentVariables</key>
  <dict><key>PATH</key><string>$BREW_BIN_DIR:/usr/bin:/bin:/usr/sbin:/sbin</string></dict>
  <!-- 02:00 daily; if the machine was asleep launchd runs it on wake -->
  <key>StartCalendarInterval</key><dict><key>Hour</key><integer>2</integer><key>Minute</key><integer>0</integer></dict>
  <key>StandardOutPath</key><string>$HOME/atlaspm-backups/backup.log</string>
  <key>StandardErrorPath</key><string>$HOME/atlaspm-backups/backup.log</string>
</dict></plist>
PLIST

for L in com.atlaspm.server com.atlaspm.backup; do
  launchctl bootout "gui/$UID/$L" 2>/dev/null || true
  launchctl bootstrap "gui/$UID" "$HOME/Library/LaunchAgents/$L.plist"
done

"$DIR/local/backup.sh" "$DB" >/dev/null 2>&1 || true

printf '\n\033[1mDone.\033[0m  http://127.0.0.1:%s\n' "$PORT"
echo "  app        $DIR"
echo "  database   $DB  (postgresql://localhost:5432/$DB)"
echo "  backups    $HOME/atlaspm-backups  (daily 02:00, 30 kept)"
echo "  logs       $HOME/atlaspm-backups/server.log"
echo
echo "  stop / start:  launchctl bootout gui/$UID/com.atlaspm.server"
echo "                 launchctl bootstrap gui/$UID ~/Library/LaunchAgents/com.atlaspm.server.plist"
echo "  remove:        $DIR/local/uninstall.sh"
