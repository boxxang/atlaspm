/**
 * /data/scenario.ts — one seeded program, whole: the template it runs on, the
 * program started from it, and the record the PM has written since.
 *
 * The template carries the plan: stage baselines and activity windows as they
 * were agreed. A program whose schedule then moved carries what happened in
 * `actual` — stage overrides and its own activity windows — so the Templates
 * screen still shows the plan the program slipped against.
 */
import type {
  ScenarioDeliverable,
  ScenarioMeeting,
  ScenarioPerson,
  ScenarioPost,
  ScenarioSeries,
  ScenarioStep,
} from './scenarioTypes';

export type Windows = Readonly<Record<string, readonly [number, number]>>;
export type StageSpan = { startOffsetWeeks: number; durationWeeks: number };

export interface Scenario {
  program: {
    id: string;
    name: string;
    /** YYYY-MM-DD, local. */
    kickoff: string;
    costPerManMonth: number;
    /** The day the record is read at: steps planned before it in `doneStages` are done. */
    today: string;
    /** YYYY-MM-DD HH:MM, the moment "now" is for meetings still to come. */
    now: string;
    timeZone: string;
    /** People's addresses are name@emailDomain. */
    emailDomain: string;
    /** People's phone numbers count up from this line. */
    phoneStart: number;
  };
  template: {
    id: string;
    name: string;
    /** Built-in stages kept, by key, re-timed. */
    stages: readonly ({ key: string } & StageSpan)[];
    /** Activity windows re-timed in the template, [from, to] weeks from the stage start. */
    windows: Windows;
  };
  actual?: {
    /** Where the program's stages actually ran. */
    overrides: Readonly<Record<string, StageSpan>>;
    /** The program's own activity windows, where they differ from the template's. */
    windows: Windows;
  };
  /** Stages whose steps planned before `today` are simply done. */
  doneStages: readonly string[];
  leaders: Readonly<Record<string, ScenarioPerson>>;
  contacts: Readonly<Record<string, readonly ScenarioPerson[]>>;
  steps: readonly ScenarioStep[];
  deliverables: readonly ScenarioDeliverable[];
  posts: readonly ScenarioPost[];
  series: readonly ScenarioSeries[];
  meetings: readonly ScenarioMeeting[];
}
