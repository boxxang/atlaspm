/**
 * /lib/activityRefs.ts — the activity IDs a write-up names in its prose.
 *
 * The write-ups cross-reference each other in running text ("PPA targets from
 * DEF-03", "<code>DEF-02</code> defines the KPI targets"), and the reader wants
 * to follow that the way the Connections rail is followed. So the string is
 * parsed once into markup, text and IDs, and the page decides what a link is:
 * an ID nobody has written up is not one.
 *
 * The strings carry only <b> and <code>; anything else is authoring noise and
 * survives as the text it looks like rather than being thrown away.
 *
 * Pure: no DOM.
 */

/** The tags the write-ups are authored with. */
const TAGS = ['b', 'code'] as const;
export type RichTag = (typeof TAGS)[number];

export type RichNode =
  | { kind: 'text'; text: string }
  | { kind: 'ref'; id: string }
  | { kind: 'tag'; tag: RichTag; children: RichNode[] };

/**
 * DEF-01, PKGD-11 — the row IDs of /lib/rowIds.ts. Two digits, all caps, so a
 * deliverable (DEF-D1) and a part number (PCIe-16) are both left alone.
 */
const REF = /\b[A-Z]{2,5}-\d{2}\b/g;

const isTag = (name: string): name is RichTag => (TAGS as readonly string[]).includes(name);

/** Only the five the authoring document uses; an unknown entity stays literal. */
const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  '#39': "'",
};

const decode = (s: string) => s.replace(/&(#39|amp|lt|gt|quot);/g, (m, k) => ENTITIES[k] ?? m);

/** Text with its IDs lifted out; adjacent text is never split for its own sake. */
function textNodes(raw: string): RichNode[] {
  const out: RichNode[] = [];
  let last = 0;
  for (const m of raw.matchAll(REF)) {
    if (m.index > last) out.push({ kind: 'text', text: decode(raw.slice(last, m.index)) });
    out.push({ kind: 'ref', id: m[0] });
    last = m.index + m[0].length;
  }
  if (last < raw.length) out.push({ kind: 'text', text: decode(raw.slice(last)) });
  return out;
}

/** Runs of text are accumulated and flushed, so "a" + "b" arrives as one node. */
function flush(buf: string, into: RichNode[]): string {
  if (buf) into.push(...textNodes(buf));
  return '';
}

/**
 * One pass, a stack of open tags. A tag that is never closed keeps its
 * children; a closing tag with nothing open is text, as is a tag we do not
 * know — the sentence is what matters, not the markup.
 */
export function parseRich(html: string): RichNode[] {
  const root: RichNode[] = [];
  const stack: { tag: RichTag; children: RichNode[] }[] = [];
  const top = () => (stack.length ? stack[stack.length - 1].children : root);

  let buf = '';
  let i = 0;
  while (i < html.length) {
    const lt = html.indexOf('<', i);
    if (lt < 0) {
      buf += html.slice(i);
      break;
    }
    buf += html.slice(i, lt);
    const gt = html.indexOf('>', lt);
    if (gt < 0) {
      buf += html.slice(lt);
      break;
    }
    const inner = html.slice(lt + 1, gt);
    const closing = inner.startsWith('/');
    const name = (closing ? inner.slice(1) : inner).trim().toLowerCase();

    if (!isTag(name)) {
      /* not ours — the angle brackets were only ever characters */
      buf += html.slice(lt, gt + 1);
      i = gt + 1;
      continue;
    }
    buf = flush(buf, top());
    if (closing) {
      const openAt = stack.map((s) => s.tag).lastIndexOf(name);
      if (openAt >= 0) {
        /* close it and everything opened after it, innermost first */
        while (stack.length > openAt) {
          const done = stack.pop()!;
          (stack.length ? stack[stack.length - 1].children : root).push({
            kind: 'tag',
            tag: done.tag,
            children: done.children,
          });
        }
      }
      /* a close with nothing open is dropped: there is no text in it to lose */
    } else {
      stack.push({ tag: name, children: [] });
    }
    i = gt + 1;
  }
  buf = flush(buf, top());

  while (stack.length) {
    const done = stack.pop()!;
    (stack.length ? stack[stack.length - 1].children : root).push({
      kind: 'tag',
      tag: done.tag,
      children: done.children,
    });
  }
  return root;
}
