import { describe, expect, it } from 'vitest';
import { deliverableRefs } from '@/lib/deliverableRefs';

const CATALOGUE = {
  'TECH-D2': 'Process option / flavor sheet agreed with foundry',
  'TECH-D5': 'Wafer, mask and NRE cost sheet',
  'DEF-D5': 'Program charter, staffing and budget plan',
  'PD-D5': 'Interim physical DRC / LVS clean',
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
    expect(refs.get('a')).toBe('TECH-D5');
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
    expect(refs.get('a')).toBe('TECH-D5');
    expect(refs.has('b')).toBe(false);
  });

  /* A derived template keeps the SoC wording under its own prefix, so one
     title answers to two references. Whichever the catalogue lists last used
     to win, and an SoC programme's RTL freeze package read ERTL-D7. */
  it('lets the row’s stage choose between references that share a title', () => {
    const shared = { 'RTL-D7': 'RTL Freeze package', 'ERTL-D7': 'RTL Freeze package' };
    const soc = deliverableRefs(
      [{ id: 'a', title: 'RTL Freeze package', stageId: 'rtl' }],
      shared,
      { RTL: 'rtl' },
    );
    expect(soc.get('a')).toBe('RTL-D7');
    const embedded = deliverableRefs(
      [{ id: 'a', title: 'RTL Freeze package', stageId: 'rtlEmb' }],
      shared,
      { ERTL: 'rtlEmb' },
    );
    expect(embedded.get('a')).toBe('ERTL-D7');
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
