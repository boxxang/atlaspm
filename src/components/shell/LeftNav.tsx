'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { writtenActivities } from '@/data/activityIndex';
import { useAppStore } from '@/store/useAppStore';
import { useProgramWork } from './useProgramWork';

/**
 * The left nav: where the programme is, in three groups.
 *
 * PROGRAM is the shapes of the whole thing, WORK is the lists you answer, and
 * PEOPLE is who answers them. The counts are as much the point as the names —
 * a TPM reads "Overdue 12" without opening it.
 *
 * Overdue counts steps, and only steps: a step past its due date with nothing
 * handed over. A key deliverable past its date is Delayed, which is a different
 * word for a different thing and has its own place to be said — counting both
 * under one word made the same figure mean two things on two screens.
 *
 * Risks and Overdue read the resolver the boards read, so a badge and its page
 * cannot disagree about the number.
 */

interface NavEntry {
  href: string;
  label: string;
  count?: string;
  tone?: 'risk';
}

interface NavGroup {
  title: string;
  items: NavEntry[];
}

function useNavGroups(projectId: string): NavGroup[] {
  const stages = useAppStore((s) => s.stages);
  const deliverables = useAppStore((s) => s.deliverables);
  const content = useAppStore((s) => s.content);
  const contacts = useAppStore((s) => s.contacts);
  const leaders = useAppStore((s) => s.leaders);
  const { overdue, risks } = useProgramWork();

  return useMemo(() => {
    const base = `/p/${projectId}`;
    const allDeliv = Object.values(deliverables).flat();
    const done = allDeliv.filter((d) => d.done).length;
    const updates = Object.values(content).reduce(
      (n, c) =>
        n +
        (['keyinfo', 'activities', 'risks'] as const).reduce(
          (m, k) => m + c[k].reduce((u, it) => u + it.updates.length, 0),
          0,
        ),
      0,
    );
    /* A stage's leader is a person too, and the Team tab lists them alongside
       the contacts — so the count has to, or the nav and the page disagree. */
    const people = Object.values(contacts).flat().length + Object.keys(leaders).length;

    return [
      {
        title: 'Program',
        items: [
          { href: `${base}/overview`, label: 'Overview' },
          { href: `${base}/timeline`, label: 'Timeline' },
          { href: `${base}/stages`, label: 'Stages', count: String(stages.length) },
        ],
      },
      {
        title: 'Work',
        items: [
          {
            href: `${base}/risks`,
            label: 'Risks',
            count: String(risks.length),
            tone: risks.length ? 'risk' : undefined,
          },
          {
            href: `${base}/overdue`,
            label: 'Overdue',
            count: String(overdue.length),
            tone: overdue.length ? 'risk' : undefined,
          },
          {
            href: `${base}/activities`,
            label: 'Activities',
            count: String(writtenActivities.length),
          },
          {
            href: `${base}/deliverables`,
            label: 'Deliverables',
            count: `${done}/${allDeliv.length}`,
          },
          { href: `${base}/updates`, label: 'Updates', count: String(updates) },
        ],
      },
      {
        title: 'People',
        items: [{ href: `${base}/team`, label: 'Team', count: String(people) }],
      },
    ];
  }, [projectId, stages, deliverables, content, contacts, leaders, overdue, risks]);
}

export function LeftNav({ projectId }: { projectId: string }) {
  const projectName = useAppStore((s) => s.projectName);
  const profile = useAppStore((s) => s.profile);
  const groups = useNavGroups(projectId);
  const pathname = usePathname();

  return (
    <nav className="pnav" aria-label="Program">
      <Link href="/" className="pnav-head" title="All programs">
        <span className="pnav-mark" aria-hidden="true">
          {projectName.slice(0, 1).toUpperCase()}
        </span>
        <span className="pnav-name">{projectName}</span>
      </Link>

      {groups.map((g) => (
        <div className="pnav-group" key={g.title}>
          <h2 className="pnav-cap">{g.title}</h2>
          <ul>
            {g.items.map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className="pnav-item"
                  aria-current={isCurrent(pathname, it.href) ? 'page' : undefined}
                >
                  <span className="pnav-label">{it.label}</span>
                  {it.count !== undefined && (
                    <span className={it.tone === 'risk' ? 'pnav-n risk' : 'pnav-n'}>
                      {it.count}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="pnav-foot">
        <span className="pnav-profile" title={profile.label}>
          {profile.label}
        </span>
      </div>
    </nav>
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
