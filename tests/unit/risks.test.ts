import { describe, expect, it } from 'vitest';
import { isRiskOpen, openRisks, risksByStage, stageIsRisky, type RiskCandidate } from '@/lib/risks';

const d = (iso: string) => new Date(`${iso}T00:00:00`);

const post = (over: Partial<RiskCandidate> = {}): RiskCandidate => ({
  id: 'p1',
  kind: 'risk',
  text: 'PDK 2.1 slipped a month',
  author: 'Sangwook Park',
  createdAt: d('2025-03-01'),
  editedAt: null,
  doneAt: null,
  parentId: null,
  activityRef: 'DEF-01',
  stepN: 2,
  ...over,
});

/** A reply under a risk: how a risk is answered, and how it is closed. */
const reply = (parentId: string, at: string, over: Partial<RiskCandidate> = {}): RiskCandidate =>
  post({ id: `r-${at}`, kind: 'reply', parentId, createdAt: d(at), activityRef: null, stepN: null, ...over });

const STAGE_OF = { 'DEF-01': 'def', 'ARCH-01': 'arch' };

describe('isRiskOpen', () => {
  it('is open until somebody closes it', () => {
    expect(isRiskOpen(post())).toBe(true);
    expect(isRiskOpen(post({ doneAt: d('2025-04-01') }))).toBe(false);
  });

  /* A step being handed over used to close the risk on it. It no longer does:
     the work finishing is not the same as the risk being answered, and saying
     how it was answered is the point of closing one. */
  it('stays open when the step it is flagged on is handed over', () => {
    expect(isRiskOpen(post())).toBe(true);
  });

  it('stays open when it names no step', () => {
    expect(isRiskOpen(post({ stepN: null }))).toBe(true);
  });

  it('is not a risk unless the post says it is', () => {
    expect(isRiskOpen(post({ kind: 'update' }))).toBe(false);
    expect(isRiskOpen(post({ kind: 'handover' }))).toBe(false);
  });

  it('is not a risk with no activity to belong to', () => {
    expect(isRiskOpen(post({ activityRef: null }))).toBe(false);
  });
});

describe('openRisks', () => {
  it('shapes a post as a risk row, newest word first', () => {
    const rows = openRisks(
      [
        post({ id: 'a', createdAt: d('2025-03-01') }),
        post({ id: 'b', activityRef: 'ARCH-01', stepN: 1, createdAt: d('2025-04-01') }),
      ],
      STAGE_OF,
    );
    expect(rows.map((r) => r.postId)).toEqual(['b', 'a']);
    expect(rows[0].id).toBe('sr:b');
    expect(rows[0].stageId).toBe('arch');
    expect(rows[1].owner).toBe('Sangwook Park');
  });

  it('dates a risk by its last edit, not by when it was first said', () => {
    const [r] = openRisks([post({ editedAt: d('2025-05-02') })], STAGE_OF);
    expect(r.updatedAt).toEqual(d('2025-05-02'));
  });

  /* "Nothing said in twelve days" is what orders the list, so an answer in the
     thread counts as something said — it did not before, and a risk somebody
     replied to this morning sorted as though it had been ignored all month. */
  it('dates a risk by the last word in its thread, replies included', () => {
    const [r] = openRisks([post({ id: 'a' }), reply('a', '2025-05-20')], STAGE_OF);
    expect(r.updatedAt).toEqual(d('2025-05-20'));
  });

  it('keeps the latest word when several people answer', () => {
    const [r] = openRisks(
      [post({ id: 'a' }), reply('a', '2025-05-20'), reply('a', '2025-04-02')],
      STAGE_OF,
    );
    expect(r.updatedAt).toEqual(d('2025-05-20'));
  });

  it('leaves out a risk whose activity is not on the programme', () => {
    expect(openRisks([post({ activityRef: 'GONE-99' })], STAGE_OF)).toEqual([]);
  });

  it('drops a risk once it has been closed', () => {
    expect(openRisks([post({ doneAt: d('2025-06-01') })], STAGE_OF)).toEqual([]);
  });
});

describe('a stage carries the risks flagged on its own steps', () => {
  const rows = openRisks([post({ id: 'a' }), post({ id: 'b', activityRef: 'ARCH-01' })], STAGE_OF);

  it('splits them by stage', () => {
    expect(risksByStage(rows, 'def').map((r) => r.postId)).toEqual(['a']);
  });

  it('is red while it holds one, and not otherwise', () => {
    expect(stageIsRisky(rows, 'def')).toBe(true);
    expect(stageIsRisky(rows, 'rtl')).toBe(false);
  });
});
