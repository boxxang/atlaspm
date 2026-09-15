'use client';

import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import { useLayoutEffect, useRef } from 'react';
import type { NoteDoc } from '@/lib/noteDoc';
import { noteExtensions } from './noteExtensions';

/**
 * Writing a key-info note's body: text, headings, lists and tables.
 *
 * Tiptap is the one library in the app that draws UI of its own, and it is
 * here because a table is something a PM pastes from a spreadsheet and then
 * fixes a cell of — which a textarea cannot be made to do. It is loaded only
 * when a note is being written; see KeyInfoTab.
 *
 * ⌘↵ saves and Escape cancels, as they did on the textarea this replaced.
 */
export default function NoteRichEditor({
  initial,
  onChange,
  onSubmit,
  onCancel,
}: {
  initial: NoteDoc;
  onChange: (doc: NoteDoc) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  /* the editor is made once; the handlers it calls are the latest ones,
     brought up to date after each render rather than during it */
  const handlers = useRef({ onChange, onSubmit, onCancel });
  useLayoutEffect(() => {
    handlers.current = { onChange, onSubmit, onCancel };
  });

  const editor = useEditor({
    extensions: noteExtensions,
    content: initial,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'notedoc notedoc-edit',
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': 'Note',
        'data-note-editor': '',
      },
      handleKeyDown: (_view, e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
          handlers.current.onSubmit();
          return true;
        }
        if (e.key === 'Escape') {
          handlers.current.onCancel();
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: e }) => handlers.current.onChange(e.getJSON() as NoteDoc),
  });

  const on = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            bold: e.isActive('bold'),
            italic: e.isActive('italic'),
            heading: e.isActive('heading'),
            bullets: e.isActive('bulletList'),
            numbers: e.isActive('orderedList'),
            table: e.isActive('table'),
          }
        : null,
  });

  const tool = (hook: string, label: string, text: string, run: () => void, active = false) => (
    <button
      type="button"
      className={active ? 'btn sm on' : 'btn sm'}
      data-notetool={hook}
      aria-label={label}
      aria-pressed={active}
      title={label}
      /* keep the selection where it is while the button is pressed */
      onMouseDown={(e) => e.preventDefault()}
      onClick={run}
    >
      {text}
    </button>
  );
  const chain = () => editor!.chain().focus();

  return (
    <div className="noterich">
      <div className="notetools" role="toolbar" aria-label="Formatting">
        {tool('bold', 'Bold', 'B', () => chain().toggleBold().run(), on?.bold)}
        {tool('italic', 'Italic', 'I', () => chain().toggleItalic().run(), on?.italic)}
        {tool('heading', 'Heading', 'H', () => chain().toggleHeading({ level: 3 }).run(), on?.heading)}
        <span className="sep" />
        {tool('bullets', 'Bullet list', '• List', () => chain().toggleBulletList().run(), on?.bullets)}
        {tool('numbers', 'Numbered list', '1. List', () => chain().toggleOrderedList().run(), on?.numbers)}
        <span className="sep" />
        {tool('table', 'Insert table', '⊞ Table', () => chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run())}
        {on?.table && (
          <>
            {tool('addRow', 'Add row below', '+ Row', () => chain().addRowAfter().run())}
            {tool('addColumn', 'Add column right', '+ Column', () => chain().addColumnAfter().run())}
            {tool('deleteRow', 'Delete row', '− Row', () => chain().deleteRow().run())}
            {tool('deleteColumn', 'Delete column', '− Column', () => chain().deleteColumn().run())}
            {tool('deleteTable', 'Delete table', 'Delete table', () => chain().deleteTable().run())}
          </>
        )}
      </div>
      <div className="notedoc-scroll">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
