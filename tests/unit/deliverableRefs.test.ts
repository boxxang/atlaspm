import { describe, expect, it } from 'vitest';
import { deliverableRefs } from '@/lib/deliverableRefs';

const CATALOGUE = {
  'TECH-D2': 'Process option / flavor sheet agreed with foundry',
  'TECH-D3': 'Wafer, mask and NRE cost sheet',
  'DEF-D5': 'Program charter, staffing and budget plan',
  'PD-D6': 'Interim physical DRC / LVS clean',
};
/* which stage a reference's prefix belongs to */
const STAGE_OF = { TECH: 'tech', DEF: 'define', PD: 'physicalDesign' };

describe('tagging a key deliverable with its reference', () => {
  it('matches an exact title', () => {
    const refs = deliverableRefs(
      [{ id: 'a', title: 'Wafer, mask and NRE cost sheet', stageId: 'tech' }],
      CATALOGUE,
      STAGE_OF,
    );
    expect(refs.get('a')).toBe('TECH-D3');
  });

  /* The two seed lists spell this differently. Folding the orthography is what
     stops the row reading as untagged. */
  it('matches across British and American spelling', () => {
    const refs = deliverableRefs(
      [{ id: 'a', title: 'Process option / flavour sheet agreed with foundry', stageId: 'tech' }],
      CATALOGUE,
      STAGE_OF,
    );
    expect(refs.get('a')).toBe('TECH-D2');
  });

  it('falls back to word overlap when the wording drifted', () => {
    const refs = deliverableRefs(
      [{ id: 'a', title: 'Program charter, staffing and budget plan (v2)', stageId: 'define' }],
      CATALOGUE,
      STAGE_OF,
    );
    expect(refs.get('a')).toBe('DEF-D5');
  });

  /* The stage is the guard rail. A loose match inside the wrong stage reads as
     a fact, and it is not one. */
  it('will not reach into another stage for a loose match', () => {
    const refs = deliverableRefs(
      [{ id: 'a', title: 'Program charter, staffing and budget plan (v2)', stageId: 'tech' }],
      CATALOGUE,
      STAGE_OF,
    );
    expect(refs.has('a')).toBe(false);
  });

  it('gives each tag to at most one row', () => {
    const refs = deliverableRefs(
      [
        { id: 'a', title: 'Wafer, mask and NRE cost sheet', stageId: 'tech' },
        { id: 'b', title: 'Wafer, mask and NRE cost sheet', stageId: 'tech' },
      ],
      CATALOGUE,
      STAGE_OF,
    );
    expect(refs.get('a')).toBe('TECH-D3');
    expect(refs.has('b')).toBe(false);
  });

  it('leaves a row nothing in the catalogue answers untagged', () => {
    const refs = deliverableRefs(
      [{ id: 'a', title: 'Chase the substrate quote', stageId: 'tech' }],
      CATALOGUE,
      STAGE_OF,
    );
    expect(refs.has('a')).toBe(false);
  });
});
