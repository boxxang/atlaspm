'use client';

import { renderToReactElement } from '@tiptap/static-renderer/pm/react';
import type { NoteDoc } from '@/lib/noteDoc';
import { noteExtensions } from './noteExtensions';

/**
 * A key-info note's document, read.
 *
 * Rendered to React elements from the stored JSON rather than to an HTML
 * string, so nothing a paste brought in is ever handed to the browser as
 * markup. A wide table scrolls sideways inside the note instead of widening
 * the page.
 */
export default function NoteDocView({ doc }: { doc: NoteDoc }) {
  return (
    <div className="notedoc-scroll">
      <div className="notedoc" data-note-doc>
        {renderToReactElement({ content: doc, extensions: noteExtensions })}
      </div>
    </div>
  );
}
