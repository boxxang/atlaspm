/**
 * /data/ucieAdv64/types.ts — what each UCIe stage module, write-up module and
 * glossary is written in. The same shapes the CPO template's modules use, so
 * the two compose, render and are tested the same way.
 */
export type {
  CpoStageModule as UcieStageModule,
  CpoStageContent as UcieStageContent,
  CpoSteps as UcieSteps,
  CpoWriteUps as UcieWriteUps,
  CpoGlossary as UcieGlossary,
} from '../cpoSwitch/types';
