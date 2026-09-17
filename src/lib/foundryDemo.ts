/**
 * /lib/foundryDemo.ts — AtlasFX1 and its template, as rows: the first scenario
 * the scenario builder reads. See /lib/scenario.ts.
 */
import { FX1_SCENARIO } from '@/data/foundryDemo';
import { buildScenario, type ScenarioDemo, type ScenarioInput } from './scenario';

export type { ScenarioDemo as FoundryDemo, ScenarioInput as FoundryDemoInput } from './scenario';

export const buildFoundryDemo = (input: ScenarioInput): ScenarioDemo => buildScenario(FX1_SCENARIO, input);
