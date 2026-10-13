import { describe, expect, it } from 'vitest';
import { ALL_MILESTONES, ALL_STAGE_CONTENT } from '@/data/builtins';
import { UCIE_ITEMS, UCIE_OWNERS, UCIE_SKELETON } from '@/data/ucieAdv64/skeleton';

/**
 * The UCIe Advanced 64G Die-to-Die PHY IP template: an IP program from
 * concept to general availability, staged by lifecycle, with the adapter,
 * logical PHY, electrical PHY, channel, test chip and release workstreams
 * running as parallel activities inside the stages.
 */
const OWN_KEYS = new Set(UCIE_SKELETON.map((s) => s.key));
const OTHER_PREFIXES = new Set(ALL_STAGE_CONTENT.filter((s) => !OWN_KEYS.has(s.id)).map((s) => s.shortTitle));
const OTHER_MILESTONES = new Set(ALL_MILESTONES.filter((m) => !OWN_KEYS.has(m.anchor.stage)).map((m) => m.id));

describe('UCIe skeleton', () => {
  it('names each stage, prefix, gate and activity once, and no other template’s', () => {
    const keys = UCIE_SKELETON.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
    const prefixes = UCIE_SKELETON.map((s) => s.prefix);
    expect(new Set(prefixes).size).toBe(prefixes.length);
    for (const s of UCIE_SKELETON) {
      expect(s.prefix, s.key).toMatch(/^[A-Z][A-Z0-9]{1,4}$/);
      expect(OTHER_PREFIXES.has(s.prefix), `${s.prefix} is another template’s`).toBe(false);
      expect(OTHER_MILESTONES.has(s.gate.id), `${s.gate.id} is another template’s`).toBe(false);
      expect(s.activities.length, `${s.key} activities`).toBeGreaterThanOrEqual(4);
      expect(s.activities.length, `${s.key} activities`).toBeLessThanOrEqual(12);
      s.activities.forEach((a, i) => {
        expect(a.ref, s.key).toBe(`${s.prefix}-${String(i + 1).padStart(2, '0')}`);
        expect(UCIE_OWNERS as readonly string[], a.ref).toContain(a.owner);
        expect(UCIE_ITEMS as readonly string[], a.ref).toContain(a.item);
        expect(a.w[0], a.ref).toBeGreaterThanOrEqual(0);
        expect(a.w[1], a.ref).toBeGreaterThan(a.w[0]);
        expect(a.w[1], `${a.ref} runs past its stage`).toBeLessThanOrEqual(s.dur);
      });
    }
    expect(new Set(UCIE_SKELETON.map((s) => s.gate.id)).size).toBe(UCIE_SKELETON.length);
    const total = UCIE_SKELETON.reduce((t, s) => t + s.activities.length, 0);
    expect(total).toBeGreaterThanOrEqual(180);
    expect(total).toBeLessThanOrEqual(230);
  });
});
