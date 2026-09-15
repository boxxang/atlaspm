/**
 * What a key-info note's document may contain, shared by the editor that
 * writes one and the renderer that shows one — they have to agree, or a note
 * could be written with something it cannot be shown with.
 *
 * Paragraphs, two heading levels, bold, italic, bullet and numbered lists, and
 * tables. Links, code and the rest are left out: a note is where a PM writes
 * down a number and the reason behind it, and a paste that brings more than
 * that is kept to what a note can hold.
 */
import { TableKit } from '@tiptap/extension-table';
import StarterKit from '@tiptap/starter-kit';

export const noteExtensions = [
  StarterKit.configure({
    heading: { levels: [3, 4] },
    blockquote: false,
    code: false,
    codeBlock: false,
    horizontalRule: false,
    link: false,
    strike: false,
    underline: false,
  }),
  TableKit.configure({ table: { resizable: false } }),
];
