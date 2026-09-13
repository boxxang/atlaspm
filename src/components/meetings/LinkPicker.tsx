'use client';

import { useMemo, useState } from 'react';
import { linkKey, viewLink, type LinkContext } from '@/lib/meetings/links';
import { LINK_TYPE_LABEL, LINK_TYPES, type LinkRef, type LinkType } from '@/lib/meetings/types';
import { IconTick } from '../shell/icons';
import type { LinkOption } from './useLinkContext';

/** How many matches to draw before asking for a narrower search. */
const SHOWN = 40;

/**
 * Pick what a meeting, an agenda item, a decision or an action is about.
 *
 * Built from the New program dialog's stage picker — a bordered list of rows,
 * each one a checkbox as a whole — with a search box on top, because the plan
 * has 23 stages, 259 activities and 1,664 steps and nobody scrolls for a step.
 * An empty search lists everything but steps; typing searches all of it.
 */
export function LinkPicker({
  value,
  onChange,
  options,
  ctx,
  projectId,
  types = LINK_TYPES,
  label = 'Related items',
}: {
  value: readonly LinkRef[];
  onChange: (links: LinkRef[]) => void;
  options: readonly LinkOption[];
  ctx: LinkContext;
  projectId: string;
  types?: readonly LinkType[];
  label?: string;
}) {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<LinkType | 'all'>('all');
  const chosen = new Set(value.map(linkKey));
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

  const { hits, total } = useMemo(() => {
    const pool = options.filter((o) => types.includes(o.group) && (group === 'all' || o.group === group));
    const matched = words.length
      ? pool.filter((o) => words.every((w) => o.haystack.includes(w)))
      : pool.filter((o) => o.group !== 'step' || group === 'step');
    return { hits: matched.slice(0, SHOWN), total: matched.length };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, types, group, query]);

  const toggle = (l: LinkRef) =>
    onChange(chosen.has(linkKey(l)) ? value.filter((x) => linkKey(x) !== linkKey(l)) : [...value, l]);

  return (
    <div className="mt-picker" data-link-picker={label}>
      {value.length > 0 ? (
        <div className="mt-links" data-picked>
          {value.map((l) => {
            const v = viewLink(l, projectId, ctx);
            return (
              <span key={linkKey(l)} className={v.missing ? 'mt-link gone' : 'mt-link'} title={v.text}>
                <b>{v.tag}</b>
                <span className="ell">{v.text}</span>
                <button type="button" className="x" aria-label={`Unlink ${v.tag}`} onClick={() => toggle(l)}>
                  ✕
                </button>
              </span>
            );
          })}
        </div>
      ) : (
        <span className="mono-note">Nothing linked yet.</span>
      )}

      <input
        className="lnkin"
        style={{ width: '100%' }}
        placeholder={`Search ${types.map((t) => LINK_TYPE_LABEL[t].toLowerCase() + 's').join(', ')}…`}
        aria-label={`Search ${label.toLowerCase()}`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {types.length > 1 && (
        <div className="chips" role="group" aria-label="Kind">
          {(['all', ...types] as const).map((g) => (
            <button
              key={g}
              type="button"
              className={group === g ? 'chip on' : 'chip'}
              onClick={() => setGroup(g)}
              data-link-group={g}
            >
              {g === 'all' ? 'All' : LINK_TYPE_LABEL[g]}
            </button>
          ))}
        </div>
      )}

      <div className="stagepick" role="listbox" aria-label={label} aria-multiselectable="true">
        {hits.length === 0 ? (
          <p className="mono-note" style={{ padding: '10px 14px' }}>
            {words.length ? 'Nothing on this program matches that.' : 'Type to search the steps.'}
          </p>
        ) : (
          hits.map((o) => {
            const on = chosen.has(linkKey(o.link));
            return (
              <button
                key={linkKey(o.link)}
                type="button"
                className="stagepick-row"
                role="option"
                aria-selected={on}
                data-pick-link={linkKey(o.link)}
                onClick={() => toggle(o.link)}
              >
                <span className={on ? 'cb on' : 'cb'} aria-hidden="true">
                  {on && <IconTick />}
                </span>
                <span className="pill" style={{ fontSize: 10.5, flexShrink: 0 }}>
                  {o.tag}
                </span>
                <span className="ell" style={{ fontSize: 12.5, color: on ? 'var(--ink)' : 'var(--ink-2)' }}>
                  {o.text}
                </span>
              </button>
            );
          })
        )}
      </div>
      {total > hits.length && (
        <span className="mono-note">
          Showing {hits.length} of {total} — type more to narrow it.
        </span>
      )}
    </div>
  );
}
