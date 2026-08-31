# Running AtlasPM on your own machine

The deployed copy is a demo. This is the one you put real work in: it runs on
your machine, stores everything in a Postgres database on your machine, and
never talks to anything else.

That last claim is worth stating precisely, because it is the reason to bother.
The app makes no outbound calls at runtime — no `fetch`, no analytics, no error
reporting. Its fonts are the operating system's rather than a CDN's.
Attachments are stored as bytes in Postgres rather than uploaded anywhere. The
one thing that did phone home was Next.js build telemetry, and the installer
turns it off. Pull the network cable and everything still works.

## Install

    git clone https://github.com/boxxang/atlaspm.git /tmp/atlaspm-installer
    /tmp/atlaspm-installer/local/install.sh

It needs Node and Postgres, and says so plainly if either is missing:

    brew install node postgresql@17 && brew services start postgresql@17

Then open **http://127.0.0.1:3210**.

Options, if the defaults do not suit:

    --dir ~/atlaspm     where to install       --db atlaspm    database name
    --port 3210         port to serve on       --with-demo     seed the demo program

`--with-demo` is off on purpose. Without it the programs list starts empty and
you make your own with **New program**; with it you get AtlasAX1, which is
useful for looking around and is not yours.

## What it sets up

**Its own checkout**, at `~/atlaspm` by default, separate from any copy you
develop in. They would otherwise share a `.env`, and a `prisma db push` meant
for one would land on the other.

**Its own database**, `atlaspm`, separate from `atlaspm_dev`.

**Port 3210**, not 3000, so `npm run dev` in a development copy does not
collide with it.

**Bound to 127.0.0.1.** This machine can reach it; the network cannot. That is
the right default because the app has no login — anyone who can reach the port
can read and change everything. If you ever want a colleague to see it, that is
a real piece of work, not a flag.

**Starts at login**, via a launch agent, and restarts if it dies.

**Backs up nightly at 02:00** to `~/atlaspm-backups`, keeping 30 days. If the
machine was asleep, launchd runs it on wake.

## Day to day

    launchctl bootout   gui/$UID/com.atlaspm.server          # stop
    launchctl bootstrap gui/$UID ~/Library/LaunchAgents/com.atlaspm.server.plist   # start
    tail -f ~/atlaspm-backups/server.log                     # what it is doing
    ~/atlaspm/local/backup.sh                                # back up right now

## Updating

    cd ~/atlaspm && git pull && npm ci && npm run build
    launchctl kickstart -k gui/$UID/com.atlaspm.server

`npm run build` runs `prisma db push` first, so a schema change applies itself.
If the update drops a column or table that holds rows, the build stops rather
than destroying data — that is deliberate. Move the data first, then build.

## Restoring

A dump is the entire backup, attachments included.

    launchctl bootout gui/$UID/com.atlaspm.server
    dropdb atlaspm && createdb atlaspm
    gunzip -c ~/atlaspm-backups/atlaspm-2026-08-31_0200.sql.gz | psql atlaspm
    launchctl bootstrap gui/$UID ~/Library/LaunchAgents/com.atlaspm.server.plist

## Removing it

    ~/atlaspm/local/uninstall.sh

Stops it and removes the launch agents. It leaves the database, the backups and
the checkout alone — undoing an installation should not throw away the work.
Those go by hand, deliberately:

    dropdb atlaspm && rm -rf ~/atlaspm-backups ~/atlaspm

## Two limits worth knowing before you rely on it

**Attachments go in the database**, capped at 5 MB each and 10 per post. That
is what makes one dump a complete backup, and it also means a habit of
attaching large files grows the database and every backup of it.

**There is no login.** Loopback binding is the whole of the access control.
