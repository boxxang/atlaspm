/**
 * /lib/stageNotes.ts — the key-info notes a new program starts with, placed
 * on its stages.
 *
 * The notes are written in /data/stageNotes.ts against the built-in stage
 * they are about. A program's stage is matched by its base, not its key, so a
 * template that renamed Physical Design still gets the note on the stage that
 * is physical design; a program without that stage gets nothing.
 *
 * Pure: no DOM, no database, no clock — the creation time is passed in.
 */
import { STAGE_NOTES } from '@/data/stageNotes';

export interface StageNoteRow {
  id: string;
  projectId: string;
  kind: 'note';
  text: string;
  author: string;
  createdAt: Date;
  stageId: string;
}

export function stageNotesFor(
  stages: readonly { key: string; baseKey: string | null }[],
  projectId: string,
  author: string,
  now: Date,
): StageNoteRow[] {
  return STAGE_NOTES.flatMap((note) => {
    const stage = stages.find((s) => (s.baseKey ?? s.key) === note.baseKey);
    return stage
      ? [
          {
            id: `${projectId}:note:${note.key}`,
            projectId,
            kind: 'note' as const,
            text: note.text,
            author,
            createdAt: now,
            stageId: stage.key,
          },
        ]
      : [];
  });
}
