# AtlasPM — feature walkthrough script

What the app does, said out loud. Written for a screen share.

Six sections. The full tour is about twelve minutes; §1–§4 alone is six and
covers everything most people need to see. Each section ends with a
**Skip to** line so you can cut without losing the thread.

Not committed to the repository.

---

## Before you start

Open **https://atlaspm-sigma.vercel.app** and let it settle on the programme
detail view. Don't start on the programme list — start where the work is.

One sentence to open with, whatever else you cut:

> Everything you're about to see is derived from one kickoff date and a set of
> stage offsets. There is exactly one place a date is decided in this app.

---

## 1 · The chart — 90 seconds

> This is the whole programme on one date axis. Twenty-three workstreams.
>
> The important thing about a chip schedule is that it isn't a sequence — it's
> concurrency. Verification is still running while physical design is on its
> second turn. Package design has been going for a year before the masks are cut.
> So the bars overlap, because that's what's true.

**Point at the window.**

> You're seeing eleven of the twenty-three. It opens on the stage that today
> falls inside, with five either side. A twenty-three row chart is a list, not a
> view — you scroll for the rest.

**Point at the diamonds.**

> Those are the fifteen checkpoints a TPM is held to — arch freeze, RTL freeze,
> tapeout, first silicon, mass production. Each one sits on the bar of the stage
> that carries it, with its date in it. Filled means it's behind us, hollow means
> it's ahead.
>
> There are more gates than this in a real programme. DFT architecture,
> co-verification signoff — but those belong to the stage that owns them, not to
> the programme's checkpoint list. Fifteen is what a programme review actually
> walks through.

**Point at the blue line.**

> Today. It runs the full height of the chart and it's captioned on the calendar,
> so you can see which month it falls in rather than taking the label's word.

**Point at a red bar.**

> Red means that stage carries an open risk. Grey means the bar is behind us.
> Risk wins over past, because an open risk on a finished stage is exactly the
> thing you don't want to lose.

**Hover a bar.** Tooltip gives dates and duration.
**Move the pointer down out of the chart.**

> It folds to just the open stage and zooms to that stage's own scale. It's
> reference once you've picked a stage, not navigation. There's a pin if you want
> it to stay.

**Skip to §3 if they're product-minded** — §2 is the schedule mechanics.

---

## 2 · Editing the schedule — 90 seconds

**Click a bar to open a stage. Point at the dates row.**

> Start date, duration in weeks, end date. Any of the three is editable, and the
> other two follow.

**Change the duration.**

> Notice what didn't happen: nothing was saved. A stage date ripples through
> every later stage and every checkpoint, so it's staged first. The saved
> schedule stays on the chart underneath as a dashed outline, and this bar tells
> you exactly what moves and by how many days.
>
> Apply, or discard. Once you apply, the programme is flagged as manually edited,
> and there's a reset in settings that puts the baseline back.

**Point at the toolbar.**

> Kick-off, MTO, mass production. Those aren't a second copy of the schedule —
> they're read from it. Change the kickoff and they all move, along with every
> bar and every diamond.

**Point at Edit template.**

> The stages themselves are data, not code. You can add one, reorder them, rename
> them, change the offsets.
>
> Here's the part I'd point out: if two programmes share a template and you edit
> the stages, it forks a private copy for the one you're on. Nobody else gets
> rescheduled because you added a stage. And you can't delete a stage that carries
> a checkpoint — it tells you which one and refuses.

**Skip to §4 if they're short on time** — §3 is the detail work.

---

## 3 · The stage — 3 minutes

**Scroll to the open stage.**

> Every stage has the same anatomy. What it is, who leads it, its dates, and then
> two tables: what engineering is doing, and what the stage owes.

**Point at the engineering table.**

> Every activity has a reference — RTL-01 through RTL-10 — so a review can cite
> a line. It carries the turnaround time and the man-months, and those roll up
> into the effort figure on the bar and the cost on the dashboard.
>
> Columns drag to resize. There's a wrap toggle on every table if the titles are
> long.

**Press the chart icon.**

> Same stage, as a schedule. Ten activities as bars, and the seven deliverables
> as diamonds sitting on the bar of the activity that produces them.
>
> That last part is the point. What a stage timeline is asked isn't "when is this
> due" — it's "what has to finish before this can exist". The specification opens
> the stage, the RTL implementation starts under its tail rather than after it,
> the register map comes early because the headers it generates are what the RTL
> includes, and trial synthesis closes the stage against freeze.
>
> Every one of those dates is stated by the stage, not guessed. All twenty-three
> stages have a plan.

**Point at the deliverables table. Click a title.**

> This is the piece I'd most want a programme manager to react to.
>
> These used to be checkboxes. Click, green, progress goes up. But a tick only
> says somebody asserted a thing was done — the artefact *is* the thing. So the
> tick isn't a control any more. This is the delivery record: the development
> history, and the file.
>
> File it with an artefact and the deliverable is complete and stamped. File it
> with nothing attached and it stays open. Take the artefact away later and it
> re-opens.

**Point at the clip on a completed row.**

> Once something's filed, that clip opens the artefact straight from the page —
> you don't open the record to get at the file.

**Point at the three boards.**

> Activity, key information, risk. Each one takes the newest entries with the
> latest status update underneath, and Show more opens the full board.
>
> An activity says which deliverable it's work towards — so the board can be
> filtered to one. "What's being done about PD-D3" is the question a review
> actually opens with, and a board of every task can't answer it.

**Open a board with Show more.**

> Opened, it leads with that reference as its first column, and filters there too.
> On the page there isn't room for a column that would be the title's.
>
> Entries take attachments, status updates take attachments, and anything
> carrying a file says so with a clip beside its title — so nobody opens six
> entries looking for where the evidence was filed.

**Point at Potential Risks on the risk board.**

> A PM checklist per stage — risks worth carrying whether or not this programme
> has hit them. Track one and it goes onto the risk board.

**Point at an envelope.**

> Any entry, or a whole activity list, composes an email to the owners. It's a
> mailto, so it opens in whatever they already use.

---

## 4 · The dashboard — 90 seconds

**Switch to Dashboard.**

> Same programme, read rather than edited.
>
> Four numbers: programme progress, tapeout with a countdown, open risks, overdue
> activities. Risks and overdue are links — they open a board across all
> twenty-three stages, so you can work the list without knowing which stage each
> one came from.

**Point down the page.**

> Upcoming milestones with their countdowns. What's in flight today. The most
> recent status updates from anywhere in the programme. And the full schedule,
> every stage, with the checkpoint labels written out.
>
> Effort and estimated cost roll up from those engineering tables — change a
> man-month figure on a stage and this moves.
>
> Every figure on this screen is derived. Nothing here is stored, so there's
> nothing to fall out of step.

**Point at the envelope by the title.**

> That composes the programme summary as an email — progress, the three dates,
> open risks by stage, what's in flight, upcoming milestones, recent updates.

---

## 5 · Programmes and settings — 60 seconds

**Click Programs.**

> One instance holds many programmes. Each card gives you progress, the stage
> it's in today, kickoff and tapeout, open risks, overdue, effort and estimated
> cost — enough to triage without opening anything.
>
> New programmes start from a template. They get the stages, the standard
> deliverables and their dates, and nothing else — no boards, no leaders. Those
> are the programme's to fill in.

**Open the settings gear.**

> Text size, icon size, bar thickness, checkpoint size, milestone text, row
> height. Scoped separately for the main view and the dashboard, because they're
> read at different distances, and stored per browser rather than per programme.

---

## 6 · Closing — 20 seconds

Pick one, don't do all three:

> **If they're a user:** every date on every screen came from one kickoff and a
> set of offsets. Change one thing and everything that depends on it moves —
> after showing you what it's about to move.

> **If they're an engineer:** two hundred and fifty-seven end-to-end tests and a
> hundred and seventy-one unit tests, all against Postgres, the same engine it
> deploys on.

> **If they're a manager:** the model is the product. A general tracker gives you
> tasks and dates. This knows that a stage's last artefact is due the day the
> stage closes, that a checkpoint belongs to the stage that carries it, and that
> a deliverable isn't done until the file exists.

---

## Things to avoid saying

- **"Simple"** or **"just"** about anything. The concurrency model is the
  hard-won part; don't undersell it.
- **"It automatically..."** — say what it does and when. "Change the kickoff and
  every bar moves" beats "dates are automatic".
- Don't demo deleting anything. It's a shared demo dataset and the next person
  sees what you left.
- Don't apologise for the seed data. If they ask, it's fiction — plausible,
  internally consistent, validated, but not from a real programme.
