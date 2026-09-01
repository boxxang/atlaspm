# AtlasPM — spoken script

Written to be said out loud, not read off. Keep the sentences short; land the
numbers; stop talking when the point is made.

Not committed to the repository. Delete it or `git add` it as you prefer.

---

## 1 · The 30-second version

> AtlasPM is a program-management tool for semiconductor development. A chip
> programme runs about twenty-three workstreams at the same time, against gates
> that don't move — tapeout, first silicon, mass production. This holds that
> schedule and the evidence behind it.
>
> It started as a single-file HTML prototype, about three thousand lines. I
> ported it to a real application — Next.js, TypeScript, Postgres — without
> losing a behaviour, and then spent twenty rounds of revision on it. There are
> four hundred and twenty-eight automated checks. It's deployed, you can open it.

**If they only ask one more thing, it will be one of these:**

- *"What was hard?"* → go to §3
- *"How do I know it works?"* → go to §4
- *"Why does it exist?"* → go to §2

---

## 2 · Why it exists (the domain, 45 seconds)

> The thing people get wrong about a chip schedule is that it isn't a sequence.
> Verification is still running while physical design is on its second turn.
> The package test vehicle has been in a lab for a year by the time the masks
> get cut. So a Gantt chart that draws one bar after another is drawing a
> fiction.
>
> The main view draws concurrency instead: every stage on one date axis, with
> the checkpoints as diamonds on the bar of the stage that carries them. And
> every date is derived from one kickoff plus a set of offsets. There is exactly
> one place a date is decided, so there is nowhere for two dates to disagree.

**If asked "do you have domain background?"** — answer honestly, then:

> The domain came out of research and it's modelled carefully — RTL freeze,
> FFN, MTO with the FEOL/BEOL split, DFT sitting between synthesis and physical
> design. What I'd want to be judged on is whether the *model* holds up, and
> that's the part I can defend line by line.

---

## 3 · What was actually hard (pick one, 60–90 seconds)

Pick the one that fits who you're talking to. Don't do all four.

### (a) For a product-minded interviewer — the checkbox

> Deliverables had a checkbox. You clicked it, it went green, progress went up.
>
> That's a lie. A tick says somebody asserted a thing was done. What the
> programme actually needs is the artefact — the signed report, the released
> database. So I took the control away. The tick isn't clickable now; it follows
> whether a file has been filed, along with the development history that produced
> it. File a record with nothing attached and the deliverable stays open.
>
> That changed the data model, the progress calculation, the dashboard and about
> fifteen tests. It's the change I'd defend hardest, because it's the difference
> between a tracker and a record.

### (b) For an engineering interviewer — the flicker

> There was a flicker. The chart folds when your pointer leaves it downward, and
> it would strobe — fold, unfold, fold, unfold.
>
> The easy read is a debounce problem. It wasn't. Folding lifted the height cap
> on the row window in a single frame, while the rows themselves collapsed over
> the whole animation. So for a few frames the chart *grew*, hit its ceiling, and
> swallowed the pointer that had just left it — which fired an enter, which
> unfolded it, which moved it away, which fired a leave. A closed loop.
>
> I instrumented it and printed the loop at thirty-millisecond intervals rather
> than guessing. Two fixes: keep the cap on, and bind unfolding to real pointer
> movement instead of a boundary event, because browsers fire those again
> whenever layout puts something new under a pointer that never moved.

### (c) For a testing/quality conversation — the invisible bug

> My favourite bug looked completely fine on screen.
>
> Each deliverable is a diamond on the bar of the activity that produces it. I'd
> rendered the diamonds *inside* the bar element — so a percentage along the time
> axis silently became a percentage of that bar's width. Every marker landed
> wherever its own bar happened to start. It looked plausible. I'd have shipped it.
>
> The test I wrote alongside it measured the last artefact against the stage's
> gate line and found it thirty-six pixels out. That's the case for the assertions
> being about the domain — "the closing artefact is due the day the stage closes" —
> rather than about the DOM.

### (d) For an infrastructure conversation — one database engine

> I was going to run SQLite locally and Postgres in production. Everyone does it.
>
> It doesn't work with Prisma: the provider is fixed when the client is
> generated and can't be read from the environment, so the two can't share a
> schema. The options were maintaining two schemas, or accepting that my whole
> suite passed on an engine the app doesn't ship on.
>
> So it's Postgres everywhere. Cost me a `brew install`. All two hundred and
> fifty-seven end-to-end checks passed against it unchanged — which is itself the
> evidence the model was portable, because I'd kept engine-specific types out of
> the schema from the start.

---

## 4 · How I know it works (45 seconds)

> Two hundred and fifty-seven end-to-end tests in Playwright and a hundred and
> seventy-one unit tests. The end-to-end suite reseeds the database before every
> single test, which is why it runs single-worker — parallel workers would reseed
> out from under each other.
>
> The ones I care about are the ones that failed for real reasons. Adding a column
> to a board pushed a mail link into the middle of the row — a link inside a
> button, exactly where people click. Clicking the centre of an entry opened a
> mail client instead of the entry. Two suites caught it on a click that had
> worked for weeks.
>
> There's also a purity guard that fails the build if anything in the schedule
> engine or the seed data touches the DOM. That boundary is the reason the date
> logic is unit-testable at all.

---

## 5 · Questions to have an answer ready for

**"How long did this take?"**
> Forty commits. I'd rather walk you through the arc than the calendar — eight
> phases to port it, then twenty rounds of revision, and the revisions are where
> the product actually got decided.

*(Be straight about elapsed time and about tooling if asked directly. Don't
volunteer a number that invites the wrong inference; don't dodge a direct question.)*

**"What would you do next?"**
> Three things, in order. Multi-user — right now everyone shares one dataset, so
> it needs accounts and per-user permissions before it's real. Then the schedule
> baseline: today an edit ripples immediately, and a programme wants a frozen
> baseline it can be measured against. Then moving attachments to object storage —
> they're a database column today, which caps a file at five megabytes.

**"What's the weakest part?"**
> The seed data is fiction. The numbers are plausible and internally consistent —
> I validate every stage's plan, that no artefact is due before the work that
> makes it starts — but they're not from a real programme. A real one would
> reshape the effort model within a week of use.

**"Why not just use Jira / MS Project?"**
> Because neither of them knows what a tapeout is. A general tracker gives you
> tasks and dates. What this gives you is that a stage's last artefact is due the
> day the stage closes, that a checkpoint belongs to the stage that carries it,
> and that editing a template forks it instead of rescheduling everybody. The
> domain is the product.

---

## 6 · If you're sharing your screen

Order that works, about four minutes:

1. **Main view.** "Twenty-three stages, eleven on screen — today's stage with
   five either side." Hover a bar; hover a diamond.
2. **Open a stage.** Point at the top: kick-off, MTO, MP. "Those follow the
   schedule; they aren't a second copy of it."
3. **The stage timeline.** Open RTL, press the chart icon. "Each artefact sits on
   the bar of the work that makes it." Point at trial synthesis closing on freeze.
4. **A delivery record.** Click a deliverable title. "The tick follows the file,
   not the other way round."
5. **Dashboard.** "Everything here is derived — nothing on this screen is stored."

Don't demo editing unless they ask. It's a shared demo dataset and it's slower
than talking.
