'use client';

import { useRef, useState } from 'react';
import type { AttachmentRef } from '@/data/types';
import { attachmentUrl, formatBytes, isInlineImage } from '@/lib/attachments';

/** Images preview inline; everything else is a download chip. */
export function AttachmentList({
  files,
  onRemove,
}: {
  files: AttachmentRef[];
  onRemove?: (id: string) => void;
}) {
  if (!files.length) return null;
  return (
    <ul className="att-list">
      {files.map((f) => (
        <li className="att" key={f.id} data-attachment={f.id}>
          <a
            className={`att-link${isInlineImage(f.mimeType) ? ' img' : ''}`}
            href={attachmentUrl(f.id)}
            target="_blank"
            rel="noopener noreferrer"
            title={`${f.filename} — ${formatBytes(f.size)}`}
          >
            {isInlineImage(f.mimeType) ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={attachmentUrl(f.id)} alt={f.filename} loading="lazy" />
            ) : (
              <span className="att-doc" aria-hidden="true">
                ↓
              </span>
            )}
            <span className="att-name">{f.filename}</span>
            <span className="att-size">{formatBytes(f.size)}</span>
          </a>
          {onRemove && (
            <button
              className="att-del"
              data-att-del={f.id}
              aria-label={`Remove ${f.filename}`}
              onClick={() => onRemove(f.id)}
            >
              ✕
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Adds files to whatever is being written. */
export function AttachmentPicker({
  onPick,
  label = 'Attach files',
  disabled,
}: {
  onPick: (files: File[]) => void | Promise<void>;
  label?: string;
  disabled?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  return (
    <>
      <button
        className="att-add"
        data-attach
        type="button"
        disabled={disabled || busy}
        onClick={() => input.current?.click()}
      >
        <ClipIcon />
        {busy ? 'Uploading…' : label}
      </button>
      <input
        ref={input}
        className="att-input"
        type="file"
        multiple
        hidden
        onChange={async (e) => {
          const files = [...(e.target.files ?? [])];
          e.target.value = ''; // let the same file be picked again
          if (!files.length) return;
          setBusy(true);
          try {
            await onPick(files);
          } finally {
            setBusy(false);
          }
        }}
      />
    </>
  );
}

export function AttachmentProblems({ problems }: { problems: string[] }) {
  if (!problems.length) return null;
  return (
    <ul className="att-problems" role="status">
      {problems.map((p) => (
        <li key={p}>{p}</li>
      ))}
    </ul>
  );
}

/**
 * A clip beside a title: this carries files. It says how many, so a record
 * with three attachments is not read as a record with one.
 */
export function ClipBadge({ count, ...rest }: { count: number } & React.ComponentProps<'span'>) {
  if (!count) return null;
  return (
    <span className="clip-badge" data-clip={count} aria-hidden="true" {...rest}>
      <ClipIcon />
      {count > 1 && <span className="n">{count}</span>}
    </span>
  );
}

export function ClipIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 11.5 11.7 19.8a4.6 4.6 0 0 1-6.5-6.5l8.4-8.4a3 3 0 0 1 4.3 4.3l-8.4 8.4a1.5 1.5 0 0 1-2.1-2.1l7.7-7.7" />
    </svg>
  );
}
