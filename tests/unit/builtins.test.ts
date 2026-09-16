import { describe, expect, it } from 'vitest';
import {
  ALL_ACTIVITIES,
  ALL_ACTIVITY_TITLES,
  ALL_MILESTONES,
  ALL_STAGE_CONTENT,
  BUILTIN_PROFILES,
  stageContent,
} from '@/data/builtins';
import { activitySteps } from '@/data/activitySteps';
import { journeyData } from '@/data/journey';
import { BUILTIN_PROFILE, milestoneDefs } from '@/data/scheduleProfiles';
import { THREE_DIC_ACTIVITIES, THREE_DIC_PROFILE, THREE_DIC_STAGE_KEYS } from '@/data/threeDic';

/**
 * The templates the app ships and the content they resolve against.
 *
 * Two of them now, so "the built-in profile" and "the activity library" are no
 * longer the same thing as "the SoC one". Everything a programme reads goes
 * through here, and a stage or an activity either template names has to be
 * findable — a programme whose stage shows nothing is a blank screen nobody
 * can explain.
 */
describe('the templates that ship', () => {
  it('are the SoC one and the 3DIC one, each built in and offered', () => {
    expect(BUILTIN_PROFILES.map((p) => p.id)).toEqual(['typicalSoC', 'threeDic']);
    for (const p of BUILTIN_PROFILES) {
      expect(p.builtin, p.id).toBe(true);
      expect(p.template, p.id).toBe(true);
      expect(p.stages.length, p.id).toBeGreaterThan(0);
    }
    /* ids are how a programme names the template it was started from */
    expect(new Set(BUILTIN_PROFILES.map((p) => p.id)).size).toBe(BUILTIN_PROFILES.length);
    expect(new Set(BUILTIN_PROFILES.map((p) => p.label)).size).toBe(BUILTIN_PROFILES.length);
  });

  it('can show every stage either of them runs', () => {
    for (const p of BUILTIN_PROFILES) {
      for (const st of p.stages) {
        expect(stageContent(st.baseKey), `${p.id}/${st.key}`).toBeTruthy();
      }
    }
    expect(stageContent(null)).toBeUndefined();
    expect(stageContent('nothing-of-the-sort')).toBeUndefined();
  });

  it('holds every activity of both, titled, with no reference claimed twice', () => {
    expect(Object.keys(ALL_ACTIVITIES)).toHaveLength(
      Object.keys(activitySteps).length + Object.keys(THREE_DIC_ACTIVITIES).length,
    );
    for (const ref of Object.keys(ALL_ACTIVITIES)) {
      expect(ALL_ACTIVITY_TITLES[ref], `${ref} has no title`).toBeTruthy();
    }
    /* the SoC library is unchanged by the merge */
    for (const [ref, a] of Object.entries(activitySteps)) expect(ALL_ACTIVITIES[ref]).toBe(a);
  });

  it('runs every activity in a stage the template that owns it runs', () => {
    const socKeys = new Set(BUILTIN_PROFILE.stages.map((s) => s.key));
    const dicKeys = new Set(THREE_DIC_PROFILE.stages.map((s) => s.key));
    for (const [ref, a] of Object.entries(ALL_ACTIVITIES)) {
      expect(socKeys.has(a.st) || dicKeys.has(a.st), `${ref} runs in ${a.st}`).toBe(true);
    }
    /* and the stack activities only in the stack stages */
    for (const [ref, a] of Object.entries(THREE_DIC_ACTIVITIES)) {
      expect(THREE_DIC_STAGE_KEYS, ref).toContain(a.st);
    }
  });

  it('carries both templates’ checkpoints, each anchored to a stage that exists', () => {
    expect(ALL_MILESTONES.length).toBe(milestoneDefs.length + ALL_MILESTONES.length - milestoneDefs.length);
    const known = new Set(ALL_STAGE_CONTENT.map((s) => s.id));
    for (const m of ALL_MILESTONES) expect(known, m.id).toContain(m.anchor.stage);
    expect(new Set(ALL_MILESTONES.map((m) => m.id)).size).toBe(ALL_MILESTONES.length);
  });

  it('keeps the stage content of both, without losing journey’s', () => {
    expect(ALL_STAGE_CONTENT.length).toBe(journeyData.length + THREE_DIC_STAGE_KEYS.length);
    for (const s of journeyData) expect(stageContent(s.id)).toBe(s);
  });
});
