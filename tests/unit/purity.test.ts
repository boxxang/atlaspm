import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * /src/lib and /src/data may not touch the DOM, and data must never import UI
 * (CLAUDE.md: "UI renders data; data never imports UI").
 *
 * /src/lib holds server-side modules too (db, queries) — those are DOM-free by
 * the same rule, which is what this guards. displaySettings.ts names DOM ids as
 * strings: data about the UI, not a DOM call, so only real global access is
 * rejected.
 */
const ROOT = resolve(import.meta.dirname, '../..');
const PURE_DIRS = ['src/lib', 'src/data'];

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const files = PURE_DIRS.flatMap((d) => walk(join(ROOT, d)));

const DOM_GLOBALS = [
  'document',
  'window',
  'navigator',
  'localStorage',
  'sessionStorage',
  'requestAnimationFrame',
  'getComputedStyle',
  'HTMLElement',
];

describe('pure modules', () => {
  it('finds the modules to check', () => {
    expect(files.length).toBeGreaterThan(5);
    expect(files.every((f) => f.endsWith('.ts'))).toBe(true);
  });

  it.each(files.map((f) => [f.slice(ROOT.length + 1), f]))('%s is DOM-free', (_rel, file) => {
    const src = readFileSync(file, 'utf8');
    for (const g of DOM_GLOBALS) {
      /* No space before the accessor: real DOM code is `document.body`, never
         `document (PRD)` — which is prose a deliverable title may well contain. */
      expect(src).not.toMatch(new RegExp(`(^|[^.\\w'"\`])${g}[.\\[(]`, 'm'));
    }
  });

  it.each(files.map((f) => [f.slice(ROOT.length + 1), f]))(
    '%s imports no UI',
    (_rel, file) => {
      const src = readFileSync(file, 'utf8');
      expect(src).not.toMatch(/from\s+['"][^'"]*\.(tsx|css)['"]/);
      expect(src).not.toMatch(/from\s+['"](@\/components|@\/app|react|next)/);
      expect(src).not.toMatch(/^\s*['"]use (client|server)['"]/m);
    },
  );

  it('keeps data from importing lib state — only schedule math', () => {
    for (const file of files.filter((f) => f.includes('/src/data/'))) {
      const imports = [...readFileSync(file, 'utf8').matchAll(/from\s+['"]([^'"]+)['"]/g)]
        .map((m) => m[1])
        .filter((p) => p.startsWith('@/lib'));
      expect(imports.every((p) => p === '@/lib/schedule')).toBe(true);
    }
  });
});
