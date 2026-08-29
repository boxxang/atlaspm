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
  activityRef: 'DEF-01',
  stepN: 2,
  ...over,
});

const STAGE_OF = { 'DEF-01': 'def', 'ARCH-01': 'arch' };

describe('isRiskOpen', () => {
  it('is open while the step it is flagged on is open', () => {
    expect(isRiskOpen(post(), new Set())).toBe(true);
  });

  it('is answered once that step is handed over', () => {
    expect(isRiskOpen(post(), new Set(['DEF-01:2']))).toBe(false);
  });

  it('is unmoved by a different step of the same activity being done', () => {
    expect(isRiskOpen(post(), new Set(['DEF-01:1']))).toBe(true);
  });

  it('stays open when it names no step, because nothing can close it', () => {
    expect(isRiskOpen(post({ stepN: null }), new Set(['DEF-01:2']))).toBe(true);
  });

  it('is not a risk unless the post says it is', () => {
    expect(isRiskOpen(post({ kind: 'update' }), new Set())).toBe(false);
    expect(isRiskOpen(post({ kind: 'handover' }), new Set())).toBe(false);
  });

  it('is not a risk with no activity to belong to', () => {
    expect(isRiskOpen(post({ activityRef: null }), new Set())).toBe(false);
  });
});

describe('openRisks', () => {
  it('shapes a post as a risk row, newest word first', () => {
    const rows = openRisks(
      [
        post({ id: 'a', createdAt: d('2025-03-01') }),
        post({ id: 'b', activityRef: 'ARCH-01', stepN: 1, createdAt: d('2025-04-01') }),
      ],
      new Set(),
      STAGE_OF,
    );
    expect(rows.map((r) => r.postId)).toEqual(['b', 'a']);
    expect(rows[0].id).toBe('sr:b');
    expect(rows[0].stageId).toBe('arch');
    expect(rows[1].owner).toBe('Sangwook Park');
  });

  it('dates a risk by its last edit, not by when it was first said', () => {
    const [r] = openRisks([post({ editedAt: d('2025-05-02') })], new Set(), STAGE_OF);
    expect(r.updatedAt).toEqual(d('2025-05-02'));
  });

  it('leaves out a risk whose activity is not on the programme', () => {
    expect(openRisks([post({ activityRef: 'GONE-99' })], new Set(), STAGE_OF)).toEqual([]);
  });

  it('drops a risk the moment its step is handed over', () => {
    expect(openRisks([post()], new Set(['DEF-01:2']), STAGE_OF)).toEqual([]);
  });
});

describe('a stage carries the risks flagged on its own steps', () => {
  const rows = openRisks(
    [post({ id: 'a' }), post({ id: 'b', activityRef: 'ARCH-01' })],
    new Set(),
    STAGE_OF,
  );

  it('splits them by stage', () => {
    expect(risksByStage(rows, 'def').map((r) => r.postId)).toEqual(['a']);
  });

  it('is red while it holds one, and not otherwise', () => {
    expect(stageIsRisky(rows, 'def')).toBe(true);
    expect(stageIsRisky(rows, 'rtl')).toBe(false);
  });
});
