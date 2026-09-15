/**
 * /lib/stageNotes.ts — the key-info notes a new program starts with, placed
 * on its stages.
 *
 * The notes are written in /data/stageNotes.ts against the built-in stage
 * they are about. A program's stage is matched by its base, not its key, so a
 * template that renamed Physical Design still gets the note on the stage that
 * is physical design; a program without that stage gets nothing.
 *
 * Each note is stored the way the key-info editor stores one: a document for
 * its body, and its title and body as plain text for the list and the filter.
 *
 * Pure: no DOM, no database, no clock — the creation time is passed in.
 */
import { STAGE_NOTES, type NoteBlock } from '@/data/stageNotes';
import { docBullets, docHeading, docParagraph, docTable, noteText, type NoteDoc, type NoteNode } from './noteDoc';

export interface StageNoteRow {
  id: string;
  projectId: string;
  kind: 'note';
  text: string;
  doc: string;
  author: string;
  createdAt: Date;
  stageId: string;
}

const block = (b: NoteBlock): NoteNode =>
  'p' in b
    ? docParagraph(b.p)
    : 'h' in b
      ? docHeading(3, b.h)
      : 'bullets' in b
        ? docBullets(b.bullets)
        : docTable(b.table.head, b.table.rows);

export function stageNotesFor(
  stages: readonly { key: string; baseKey: string | null }[],
  projectId: string,
  author: string,
  now: Date,
): StageNoteRow[] {
  return STAGE_NOTES.flatMap((note) => {
    const stage = stages.find((s) => (s.baseKey ?? s.key) === note.baseKey);
    if (!stage) return [];
    const doc: NoteDoc = { type: 'doc', content: note.blocks.map(block) };
    return [
      {
        id: `${projectId}:note:${note.key}`,
        projectId,
        kind: 'note' as const,
        text: noteText(note.title, doc),
        doc: JSON.stringify(doc),
        author,
        createdAt: now,
        stageId: stage.key,
      },
    ];
  });
}
