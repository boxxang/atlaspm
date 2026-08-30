'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { writtenActivities } from '@/data/activityIndex';
import { RISK_AUTHOR } from '@/data/riskSeeds';
import { useAppStore } from '@/store/useAppStore';
import {
  Avatar,
  IconActivities,
  IconDeliverables,
  IconLate,
  IconOverview,
  IconProfile,
  IconRisk,
  IconSearch,
  IconStages,
  IconSwitch,
  IconTeam,
  IconTimeline,
  IconUpdates,
} from './icons';
import { useProgramWork } from './useProgramWork';

/**
 * The left nav, as the prototype draws it.
 *
 * Three groups: PROGRAM is the shapes of the whole thing, WORK is the lists you
 * answer, PEOPLE is who answers them. The counts are as much the point as the
 * names — a TPM reads "Overdue 12" without opening it — and Risks wears its
 * count as a filled pill rather than a plain number, because it is the one that
 * should catch the eye first.
 *
 * Inside a stage the nav opens a short list of its neighbours, so moving one
 * stage along does not mean going back to the list.
 *
 * Overdue counts steps, and only steps: a step past its due date with nothing
 * handed over. A key deliverable past its date is Delayed, which is a different
 * word for a different thing and has its own place to be said.
 */
export function LeftNav({ projectId }: { projectId: string }) {
  const projectName = useAppStore((s) => s.projectName);
  const profile = useAppStore((s) => s.profile);
  const stages = useAppStore((s) => s.stages);
  const schedule = useAppStore((s) => s.schedule);
  const deliverables = useAppStore((s) => s.deliverables);
  const content = useAppStore((s) => s.content);
  const contacts = useAppStore((s) => s.contacts);
  const posts = useAppStore((s) => s.posts);
  const leaders = useAppStore((s) => s.leaders);
  const today = useAppStore((s) => s.today);
  const { overdue, risks } = useProgramWork();
  const pathname = usePathname();

  const base = `/p/${projectId}`;
  const allDeliv = Object.values(deliverables).flat();
  const done = allDeliv.filter((d) => d.done).length;
  const updates =
    posts.length +
    Object.values(content).reduce(
      (n, c) =>
        n +
        (['keyinfo', 'activities', 'risks'] as const).reduce(
          (m, k) => m + c[k].reduce((u, it) => u + it.updates.length, 0),
          0,
        ),
      0,
    );
  /* Counts what the Team page lists, which includes each stage's lead — a
     badge that disagrees with the page behind it is worse than no badge. */
  const people =
    Object.values(contacts).flat().length +
    Object.values(leaders).filter((l) => l?.name).length;

  /* Which stage is open, so its neighbours can be listed under Stages. */
  const inStage = pathname.match(/\/stage\/([^/?]+)/)?.[1] ?? null;
  const index = inStage ? stages.findIndex((s) => s.id === inStage) : -1;
  const neighbours = index >= 0 ? stages.slice(Math.max(0, index - 1), index + 3) : [];

  const barColour = (id: string) => {
    const span = schedule.stages[id];
    if (!span) return 'var(--st-future)';
    if (today > span.end) return 'var(--st-done)';
    if (today < span.start) return 'var(--st-future)';
    return risks.some((r) => r.stageId === id) ? 'var(--st-risk)' : 'var(--st-run)';
  };

  return (
    <nav id="side" aria-label="Program">
      {/* Where you are, in two lines: the app, and then the program — which is
          the one word on this screen that changes everything else on it, so it
          is the largest thing in the rail. The way out is its own row rather
          than a click on the program's own name, which read as "open this
          program" and did the opposite. */}
      <Link className="homerow" href="/" data-home>
        <span className="mark" style={{ width: 18, height: 18, fontSize: 9.5 }}>
          A
        </span>
        AtlasPM
        <span className="g" />
        <span className="c">All programs</span>
      </Link>

      <div className="brand" data-program-name>
        <span style={{ flexGrow: 1, minWidth: 0 }}>
          <span className="progname ell">{projectName}</span>
          <span className="progsub">
            {profile.label} · {stages.length} stages
          </span>
        </span>
        <IconSwitch />
      </div>

      <div className="search">
        <IconSearch />
        <span style={{ flexGrow: 1 }}>Search</span>
        <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>⌘K</span>
      </div>

      <div className="sec">Program</div>
      <NavItem here={pathname} href={`${base}/overview`} label="Overview" icon={<IconOverview />} />
      <NavItem here={pathname} href={`${base}/timeline`} label="Timeline" icon={<IconTimeline />} />
      <NavItem
        here={pathname}
        href={`${base}/stages`}
        label="Stages"
        icon={<IconStages />}
        extra={<span className="c">{stages.length}</span>}
      />
      {neighbours.length > 0 && (
        <div style={{ padding: '3px 0 3px 22px', display: 'flex', flexDirection: 'column' }}>
          {neighbours.map((s) => (
            <Link
              key={s.id}
              className={s.id === inStage ? 'substage on' : 'substage'}
              href={`${base}/stage/${s.id}/activity`}
              data-substage={s.id}
            >
              <span className="dot" style={{ background: barColour(s.id) }} />
              {s.stage} · {s.shortTitle}
            </Link>
          ))}
        </div>
      )}

      <div className="sec">Work</div>
      <NavItem
        here={pathname}
        href={`${base}/risks`}
        label="Risks"
        icon={<IconRisk />}
        extra={<span className="cr">{risks.length}</span>}
      />
      <NavItem
        here={pathname}
        href={`${base}/overdue`}
        label="Overdue"
        icon={<IconLate />}
        extra={
          <span className="c" style={{ color: 'var(--risk)', fontWeight: 600 }}>
            {overdue.length}
          </span>
        }
      />
      <NavItem
        here={pathname}
        href={`${base}/activities`}
        label="Activities"
        icon={<IconActivities />}
        extra={<span className="c">{writtenActivities.length}</span>}
      />
      <NavItem
        here={pathname}
        href={`${base}/deliverables`}
        label="Deliverables"
        icon={<IconDeliverables />}
        extra={
          <span className="c">
            {done}/{allDeliv.length}
          </span>
        }
      />
      <NavItem
        here={pathname}
        href={`${base}/updates`}
        label="Updates"
        icon={<IconUpdates />}
        extra={<span className="c">{updates}</span>}
      />

      <div className="sec">People</div>
      <NavItem
        here={pathname}
        href={`${base}/team`}
        label="Team"
        icon={<IconTeam />}
        extra={<span className="c">{people}</span>}
      />

      <div className="side-foot">
        <Link className="nav" style={{ fontSize: 12.5 }} href={`${base}/stages`}>
          <IconProfile />
          {profile.label}
          <span className="g" />
          <span className="c">edit</span>
        </Link>
        <div className="nav" style={{ fontSize: 12.5 }}>
          <Avatar name={RISK_AUTHOR} small />
          {RISK_AUTHOR.split(' ')[0]}
        </div>
      </div>
    </nav>
  );
}

/**
 * One entry. Defined here rather than inside LeftNav: a component created
 * during render is a new type on every render, and React throws the old
 * subtree away each time — which is invisible until something in it holds
 * state, and then baffling.
 */
function NavItem({
  here,
  href,
  label,
  icon,
  extra,
}: {
  here: string;
  href: string;
  label: string;
  icon: React.ReactNode;
  extra?: React.ReactNode;
}) {
  const on = isCurrent(here, href);
  return (
    <Link href={href} className={on ? 'nav on' : 'nav'} aria-current={on ? 'page' : undefined}>
      {icon}
      {label}
      <span className="g" />
      {extra}
    </Link>
  );
}

/**
 * A stage page is still "Stages" as far as the nav is concerned, so that entry
 * stays lit while you are inside one. Everything else matches exactly — prefix
 * matching there would light Deliverables from a route that merely starts the
 * same way.
 */
function isCurrent(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href.endsWith('/stages')) return pathname.startsWith(href.replace(/\/stages$/, '/stage/'));
  return false;
}
