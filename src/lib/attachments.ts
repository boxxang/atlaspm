/**
 * /lib/attachments.ts — what may be attached, and how it may be served back.
 * Pure: no DOM, no database.
 */

/** Bytes live in a database column, so the ceiling is deliberately modest. */
export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
export const MAX_ATTACHMENTS_PER_POST = 10;

/**
 * Only these render inline. Everything else is served as a download, because
 * inline user-uploaded content is an XSS vector — SVG in particular can carry
 * script, so it is deliberately absent from this list despite being an image.
 */
const INLINE_TYPES = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp']);

export const isInlineImage = (mimeType: string) => INLINE_TYPES.has(mimeType.toLowerCase());

export interface AttachmentMeta {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}

export const attachmentUrl = (id: string) => `/api/attachments/${id}`;

/** "842 KB", "1.4 MB" — sized for a chip next to a filename. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  /* one decimal, but not a bare ".0" — "5 MB" reads better than "5.0 MB" */
  const shown = mb < 10 ? mb.toFixed(1).replace(/\.0$/, '') : String(Math.round(mb));
  return `${shown} MB`;
}

/** Keeps a path or a control character out of Content-Disposition. */
export function safeFilename(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? 'file';
  const cleaned = base.replace(/[\u0000-\u001f"\\]/g, '').trim();
  return cleaned.slice(0, 120) || 'file';
}

export type RejectionReason = 'too-large' | 'too-many' | 'empty';

export function rejectFile(
  file: { size: number },
  alreadyAttached: number,
): RejectionReason | null {
  if (file.size === 0) return 'empty';
  if (file.size > MAX_ATTACHMENT_BYTES) return 'too-large';
  if (alreadyAttached >= MAX_ATTACHMENTS_PER_POST) return 'too-many';
  return null;
}

export const rejectionMessage = (reason: RejectionReason, filename: string): string =>
  reason === 'too-large'
    ? `${filename} is over ${formatBytes(MAX_ATTACHMENT_BYTES)} and was not attached.`
    : reason === 'too-many'
      ? `Only ${MAX_ATTACHMENTS_PER_POST} files per post — ${filename} was not attached.`
      : `${filename} is empty and was not attached.`;
