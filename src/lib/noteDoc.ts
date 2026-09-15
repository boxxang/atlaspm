/**
 * /lib/noteDoc.ts — a key-info note's body as a document.
 *
 * The key-info editor writes Tiptap's JSON: a `doc` of paragraphs, headings,
 * lists and tables. This module is everything about that shape that does not
 * need an editor — building one, reading one back safely, and saying it as
 * plain text, because the note list, its filter and the Updates feed all read
 * a note's text rather than its document.
 *
 * A table says itself a row to a line with its cells separated by bars, so a
 * search for a number in a cell still finds the note.
 *
 * Pure: no DOM, no editor.
 */

export interface NoteMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface NoteNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: NoteNode[];
  text?: string;
  marks?: NoteMark[];
}

export interface NoteDoc {
  type: 'doc';
  content: NoteNode[];
}

/** Past this a stored document is refused rather than rendered. */
export const MAX_NOTE_DOC_CHARS = 200_000;

const textNode = (text: string): NoteNode => ({ type: 'text', text });

export const docParagraph = (text: string): NoteNode =>
  text ? { type: 'paragraph', content: [textNode(text)] } : { type: 'paragraph' };

export const docHeading = (level: number, text: string): NoteNode => ({
  type: 'heading',
  attrs: { level },
  ...(text ? { content: [textNode(text)] } : {}),
});

export const docBullets = (items: readonly string[]): NoteNode => ({
  type: 'bulletList',
  content: items.map((item) => ({ type: 'listItem', content: [docParagraph(item)] })),
});

const tableRow = (cells: readonly string[], type: 'tableHeader' | 'tableCell'): NoteNode => ({
  type: 'tableRow',
  content: cells.map((cell) => ({ type, content: [docParagraph(cell)] })),
});

/** A table with a header row. */
export const docTable = (head: readonly string[], rows: readonly (readonly string[])[]): NoteNode => ({
  type: 'table',
  content: [tableRow(head, 'tableHeader'), ...rows.map((r) => tableRow(r, 'tableCell'))],
});

const inline = (n: NoteNode): string =>
  n.type === 'text' ? (n.text ?? '') : n.type === 'hardBreak' ? '\n' : (n.content ?? []).map(inline).join('');

const itemLines = (item: NoteNode, prefix: string): string[] => {
  const inner = (item.content ?? []).flatMap(lines);
  return inner.length ? [prefix + inner[0], ...inner.slice(1).map((l) => `  ${l}`)] : [prefix.trimEnd()];
};

function lines(n: NoteNode): string[] {
  switch (n.type) {
    case 'paragraph':
    case 'heading':
      return [inline(n)];
    case 'bulletList':
      return (n.content ?? []).flatMap((item) => itemLines(item, '- '));
    case 'orderedList': {
      const start = Number(n.attrs?.start ?? 1) || 1;
      return (n.content ?? []).flatMap((item, i) => itemLines(item, `${start + i}. `));
    }
    case 'table':
      return (n.content ?? []).map((row) =>
        (row.content ?? []).map((cell) => (cell.content ?? []).flatMap(lines).join(' ')).join(' | '),
      );
    case 'blockquote':
      return (n.content ?? []).flatMap(lines).map((l) => `> ${l}`);
    case 'codeBlock':
      return inline(n).split('\n');
    case 'horizontalRule':
      return ['---'];
    default:
      return n.content ? n.content.flatMap(lines) : n.text ? [n.text] : [];
  }
}

/** The document as plain text, a block to a line. */
export const docText = (doc: NoteDoc): string => doc.content.flatMap(lines).join('\n');

/** A note written before notes had documents, as one: a paragraph a line. */
export const textToDoc = (text: string): NoteDoc => ({
  type: 'doc',
  content: text ? text.split('\n').map(docParagraph) : [{ type: 'paragraph' }],
});

/** What a note's `text` holds: its title, then its body as text. */
export const noteText = (title: string, doc: NoteDoc): string => {
  const body = docText(doc).trim();
  return body ? `${title.trim()}\n${body}` : title.trim();
};

const isNode = (v: unknown): v is NoteNode => {
  if (!v || typeof v !== 'object') return false;
  const n = v as Record<string, unknown>;
  if (typeof n.type !== 'string') return false;
  if (n.text !== undefined && typeof n.text !== 'string') return false;
  if (n.content !== undefined && !(Array.isArray(n.content) && n.content.every(isNode))) return false;
  return true;
};

/** A stored document read back, or null for anything that is not one. */
export function parseNoteDoc(raw: string | null | undefined): NoteDoc | null {
  if (!raw || raw.length > MAX_NOTE_DOC_CHARS) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!value || typeof value !== 'object') return null;
  const d = value as Record<string, unknown>;
  if (d.type !== 'doc' || !Array.isArray(d.content) || !d.content.every(isNode)) return null;
  return d as unknown as NoteDoc;
}
