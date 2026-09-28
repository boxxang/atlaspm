import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BUILTIN_PROFILES } from '@/data/builtins';
import { BUILTIN_FLOWCHARTS } from '@/data/builtinFlowcharts';

/** Every built-in template opens a flowchart, and the page it opens is there to serve. */
describe('built-in template flowcharts', () => {
  it('has one for each built-in, served from public/', () => {
    for (const p of BUILTIN_PROFILES) {
      const href = BUILTIN_FLOWCHARTS[p.id];
      expect(href, p.id).toMatch(/^\/flowcharts\/[a-z0-9-]+\.html$/);
      expect(existsSync(`public${href}`), href).toBe(true);
    }
  });
});
