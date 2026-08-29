import { describe, expect, it } from 'vitest';
import { guessActivity } from '@/lib/guessActivity';

const ACTS = [
  { ref: 'DEF-01', title: 'Customer and Market Requirements Definition' },
  { ref: 'PD-02', title: 'Floorplan, Macro Placement, and Partition Definition' },
  { ref: 'PD-09', title: 'Multi-Corner Multi-Mode Timing Closure' },
];

describe('guessing which activity a board entry is about', () => {
  it('matches somebody’s own wording of a template activity', () => {
    expect(guessActivity('Market & customer requirements analysis', ACTS)).toBe('DEF-01');
  });

  it('matches on the significant words, not the joining ones', () => {
    expect(guessActivity('Multi-corner timing closure', ACTS)).toBe('PD-09');
  });

  it('says nothing rather than guessing at an entry it does not recognise', () => {
    expect(guessActivity('Chase the packaging vendor about the substrate quote', ACTS)).toBeNull();
  });

  /* One word in common is a coincidence, not a match — "Definition" appears in
     two of these titles and would otherwise link both. */
  it('needs more than a single shared word', () => {
    expect(guessActivity('Definition', ACTS)).toBeNull();
    expect(guessActivity('The definition', ACTS)).toBeNull();
  });

  it('has nothing to say when the stage has no activities', () => {
    expect(guessActivity('Floorplan and partition definition', [])).toBeNull();
  });
});
