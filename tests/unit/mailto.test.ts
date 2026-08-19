import { describe, expect, it } from 'vitest';
import { createProjectSeed } from '@/data/projectSeed';
import { scheduleProfiles } from '@/data/scheduleProfiles';
import { MAILTO_LIMIT, buildMailto, clip, joinSections, row, section } from '@/lib/mailto';
import { buildDirectory, resolveEmail, shortForm } from '@/lib/people';
import { addWeeks, computeSchedule, startOfDay } from '@/lib/schedule';

const parse = (href: string) => {
  const [head, query] = href.replace(/^mailto:/, '').split('?');
  const params = new URLSearchParams(query);
  return {
    to: head,
    subject: params.get('subject') ?? '',
    body: params.get('body') ?? '',
    cc: params.get('cc') ?? '',
  };
};

describe('mailto drafts', () => {
  it('puts recipients, subject and body where a mail client expects them', () => {
    const { href, truncated } = buildMailto({
      to: ['grace.park@example.com'],
      subject: '[AtlasAX1 · PD] Routing congestion',
      body: 'Owner  G. Park\nStatus Open',
    });
    expect(href.startsWith('mailto:grace.park@example.com?')).toBe(true);
    const m = parse(href);
    expect(m.subject).toBe('[AtlasAX1 · PD] Routing congestion');
    expect(m.body).toBe('Owner  G. Park\nStatus Open');
    expect(truncated).toBe(false);
  });

  it('keeps several recipients readable and adds cc only when present', () => {
    const a = parse(buildMailto({ to: ['a@x.com', 'b@x.com'], subject: 's', body: 'b' }).href);
    expect(a.to).toBe('a@x.com,b@x.com');
    expect(a.cc).toBe('');
    const b = parse(buildMailto({ to: ['a@x.com'], cc: ['c@x.com'], subject: 's', body: 'b' }).href);
    expect(b.cc).toBe('c@x.com');
  });

  it('opens with an empty To when nobody could be resolved', () => {
    const { href } = buildMailto({ to: [], subject: 'Summary', body: 'x' });
    expect(href.startsWith('mailto:?')).toBe(true);
  });

  it('encodes the characters that would break the URL', () => {
    const { href } = buildMailto({ subject: 'A & B?', body: 'line1\nline2 #3 100%' });
    expect(href).not.toMatch(/[\n]/);
    const m = parse(href);
    expect(m.subject).toBe('A & B?');
    expect(m.body).toBe('line1\nline2 #3 100%');
  });

  it('trims an over-long body to fit, and says so', () => {
    const { href, truncated } = buildMailto({
      to: ['x@y.com'],
      subject: 'Long one',
      body: 'word '.repeat(2000),
    });
    expect(truncated).toBe(true);
    expect(href.length).toBeLessThanOrEqual(MAILTO_LIMIT);
    expect(parse(href).body).toContain('truncated');
  });

  it('leaves a body that already fits completely alone', () => {
    const body = 'short body';
    const { href, truncated } = buildMailto({ subject: 's', body });
    expect(truncated).toBe(false);
    expect(parse(href).body).toBe(body);
  });
});

describe('body formatting helpers', () => {
  it('aligns label columns', () => {
    expect(row('Owner', 'G. Park')).toBe('Owner          G. Park');
    expect(row('Tapeout', '10/14/2026', 10)).toBe('Tapeout   10/14/2026');
  });

  it('drops empty sections instead of leaving bare headings', () => {
    expect(section('RISKS', [])).toBe('');
    expect(section('RISKS', ['  one'])).toBe('RISKS\n  one');
    expect(joinSections(['A', '', 'B'])).toBe('A\n\nB');
  });

  it('clips long text on a word boundary', () => {
    expect(clip('short', 20)).toBe('short');
    const out = clip('the quick brown fox jumps over the lazy dog', 20);
    expect(out.endsWith('…')).toBe(true);
    expect(out.length).toBeLessThanOrEqual(20);
    expect(out).not.toContain('jumpi');
  });
});

describe('resolving an owner to an address', () => {
  const NOW = new Date(2026, 7, 19, 9, 30);
  const schedule = computeSchedule(
    addWeeks(startOfDay(NOW), -30),
    scheduleProfiles.typicalSoC,
    {},
  );
  const seed = createProjectSeed({ schedule, now: NOW });
  const dir = buildDirectory(seed.leaders, seed.contacts);

  it('builds the short form the app writes when saving a leader', () => {
    expect(shortForm('Grace Park')).toBe('G. Park');
    expect(shortForm('Marco Bianchi')).toBe('M. Bianchi');
    expect(shortForm('Seojin Ha')).toBe('S. Ha');
    expect(shortForm('Cher')).toBe('Cher');
  });

  it('finds a stage leader by either their name or their short form', () => {
    expect(resolveEmail(dir, 'Grace Park')).toBe('grace.park@example.com');
    expect(resolveEmail(dir, 'G. Park')).toBe('grace.park@example.com');
  });

  it('finds a contact from the short form stored on an item', () => {
    // items are seeded with owner "M. Bianchi"; the contact is "Marco Bianchi"
    expect(resolveEmail(dir, 'M. Bianchi')).toBe('marco.bianchi@example.com');
    expect(resolveEmail(dir, 'I. Berg')).toBe('ingrid.berg@example.com');
    expect(resolveEmail(dir, 'N. Coleman')).toBe('nate.coleman@example.com');
  });

  it('is case and spacing tolerant, and falls back to a surname', () => {
    expect(resolveEmail(dir, '  m. bianchi ')).toBe('marco.bianchi@example.com');
    expect(resolveEmail(dir, 'Marco  Bianchi')).toBe('marco.bianchi@example.com');
    expect(resolveEmail(dir, 'Bianchi')).toBe(null); // no given name, no surname key
    expect(resolveEmail(dir, 'M.  Bianchi')).toBe('marco.bianchi@example.com');
  });

  it('returns null rather than guessing when nobody matches', () => {
    expect(resolveEmail(dir, 'Nobody Here')).toBe(null);
    expect(resolveEmail(dir, '')).toBe(null);
  });

  it('resolves the great majority of the seed owners', () => {
    const owners = new Set(
      Object.values(seed.content).flatMap((c) =>
        [...c.keyinfo, ...c.activities, ...c.risks].map((i) => i.owner),
      ),
    );
    const resolved = [...owners].filter((o) => resolveEmail(dir, o));
    expect(owners.size).toBeGreaterThan(30);
    expect(resolved.length).toBe(owners.size);
  });
});
