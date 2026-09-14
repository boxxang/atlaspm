import { describe, expect, it } from 'vitest';
import { RISK_AUTHOR } from '@/data/riskSeeds';
import { stageNotesFor } from '@/lib/stageNotes';

/**
 * The key-info notes a new program starts with. They are reference material
 * the PM reaches for on every program, so they arrive on the stage they are
 * about — and only on programs that run that stage.
 */
const NOW = new Date(2026, 8, 14, 10, 0);
const stage = (key: string, baseKey: string | null = key) => ({ key, baseKey });

describe('stageNotesFor', () => {
  it('puts the netlist maturity criteria on physical design', () => {
    const notes = stageNotesFor([stage('synthesis'), stage('physicalDesign'), stage('signoff')], 'p1', RISK_AUTHOR, NOW);
    expect(notes).toHaveLength(1);
    const [n] = notes;
    expect(n.stageId).toBe('physicalDesign');
    expect(n.kind).toBe('note');
    expect(n.text.split('\n')[0]).toBe('Netlist drop maturity criteria — N0 → N1 → N2 → FFN');
    for (const drop of ['N0 —', 'N1 —', 'N2 —', 'FFN —']) expect(n.text).toContain(`\n${drop}`);
  });

  it('is written by the PM, dated when the program was created, with an id of its own on each program', () => {
    const [a] = stageNotesFor([stage('physicalDesign')], 'p1', RISK_AUTHOR, NOW);
    const [b] = stageNotesFor([stage('physicalDesign')], 'p2', RISK_AUTHOR, NOW);
    expect(a.author).toBe(RISK_AUTHOR);
    expect(a.createdAt).toEqual(NOW);
    expect(a.id).toBe('p1:note:netlist-maturity');
    expect(b.id).toBe('p2:note:netlist-maturity');
    expect(a.projectId).toBe('p1');
  });

  it('finds the stage by what it is, not by what the template calls it', () => {
    const [n] = stageNotesFor([stage('backend', 'physicalDesign')], 'p1', RISK_AUTHOR, NOW);
    expect(n.stageId).toBe('backend');
  });

  it('gives a program that does not run physical design no note', () => {
    expect(stageNotesFor([stage('tapeout'), stage('shipping', null)], 'p1', RISK_AUTHOR, NOW)).toEqual([]);
  });
});
