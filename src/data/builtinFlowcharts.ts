/**
 * /data/builtinFlowcharts.ts — the flowchart each built-in template opens.
 *
 * A built-in template's stages, drawn as one programme-wide flow: which stage
 * feeds which, by lifecycle band and start week. Static pages served from
 * public/flowcharts; keyed by profile id. Client-safe: a list of paths.
 */
export const BUILTIN_FLOWCHARTS: Readonly<Record<string, string>> = {
  typicalSoC: '/flowcharts/typical-soc.html',
  threeDic: '/flowcharts/3dic.html',
  embeddedSoc: '/flowcharts/embedded-soc.html',
};

export const flowchartOf = (profileId: string): string | undefined => BUILTIN_FLOWCHARTS[profileId];
