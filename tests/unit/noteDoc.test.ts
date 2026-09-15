import { describe, expect, it } from 'vitest';
import {
  docBullets,
  docHeading,
  docParagraph,
  docTable,
  docText,
  MAX_NOTE_DOC_CHARS,
  noteText,
  parseNoteDoc,
  textToDoc,
  type NoteDoc,
} from '@/lib/noteDoc';

/**
 * A key-info note's body as a document: paragraphs, headings, lists and
 * tables. The list, the filter and the Updates feed still read a note's plain
 * text, so every document has to say itself as text too — a table included.
 */
const doc = (...content: NoteDoc['content']): NoteDoc => ({ type: 'doc', content });

describe('docText', () => {
  it('reads paragraphs, headings and lists the way they would be typed', () => {
    const d = doc(
      docHeading(3, 'Where timing stands'),
      docParagraph('17 paths after round 6.'),
      docBullets(['12 CPU core', '3 PCIe PIPE']),
      { type: 'orderedList', content: docBullets(['Classify', 'Fix']).content },
    );
    expect(docText(d)).toBe('Where timing stands\n17 paths after round 6.\n- 12 CPU core\n- 3 PCIe PIPE\n1. Classify\n2. Fix');
  });

  it('writes a table a row to a line, its cells separated by bars', () => {
    const d = doc(docTable(['Criterion', 'N0', 'FFN'], [['RTL', 'early', 'frozen']]));
    expect(docText(d)).toBe('Criterion | N0 | FFN\nRTL | early | frozen');
  });

  it('keeps an empty paragraph as the blank line it was', () => {
    expect(docText(doc(docParagraph('a'), docParagraph(''), docParagraph('b')))).toBe('a\n\nb');
  });
});

describe('textToDoc', () => {
  it('turns a plain note into one paragraph a line, and back without loss', () => {
    const text = 'First line\n\n- a dash stays text\nlast';
    const d = textToDoc(text);
    expect(d.content).toHaveLength(4);
    expect(d.content.every((n) => n.type === 'paragraph')).toBe(true);
    expect(docText(d)).toBe(text);
  });

  it('gives an empty note one empty paragraph, which is what an editor opens on', () => {
    expect(textToDoc('')).toEqual({ type: 'doc', content: [{ type: 'paragraph' }] });
  });
});

describe('parseNoteDoc', () => {
  it('reads back a stored document', () => {
    const d = doc(docParagraph('hello'));
    expect(parseNoteDoc(JSON.stringify(d))).toEqual(d);
  });

  it('refuses what is not a document rather than rendering it', () => {
    expect(parseNoteDoc(null)).toBeNull();
    expect(parseNoteDoc('')).toBeNull();
    expect(parseNoteDoc('not json')).toBeNull();
    expect(parseNoteDoc(JSON.stringify({ type: 'paragraph' }))).toBeNull();
    expect(parseNoteDoc(JSON.stringify({ type: 'doc', content: 'x' }))).toBeNull();
    expect(parseNoteDoc(JSON.stringify(doc(docParagraph('x'.repeat(MAX_NOTE_DOC_CHARS)))))).toBeNull();
  });
});

describe('noteText', () => {
  it('is the title, then the body as text — which is what the list and the filter read', () => {
    expect(noteText('  Split MTO  ', doc(docParagraph('FEOL 10/05')))).toBe('Split MTO\nFEOL 10/05');
  });

  it('is only the title when the body says nothing', () => {
    expect(noteText('Split MTO', doc(docParagraph('')))).toBe('Split MTO');
  });
});
