#!/usr/bin/env bash
#
# Stops AtlasPM and removes the background jobs.
#
# The database and the backups are left alone — this undoes the installation,
# not the work. Removing those is a separate, deliberate act:
#
#   dropdb atlaspm && rm -rf ~/atlaspm-backups
#
set -euo pipefail

for L in com.atlaspm.server com.atlaspm.backup; do
  launchctl bootout "gui/$UID/$L" 2>/dev/null && echo "stopped $L" || echo "$L was not running"
  rm -f "$HOME/Library/LaunchAgents/$L.plist"
done

echo
echo "Removed the launch agents. Left in place:"
echo "  the database   (dropdb atlaspm)"
echo "  the backups    ($HOME/atlaspm-backups)"
echo "  the checkout   (rm -rf the directory you installed into)"
