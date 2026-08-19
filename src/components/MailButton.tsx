'use client';

import { useMemo } from 'react';
import { buildMailto, type MailDraft } from '@/lib/mailto';

/**
 * A real mailto link, so the browser hands the draft to whatever mail client
 * the OS has registered — Outlook on a corporate desktop. The draft opens
 * unsent: the app writes the boring part, a person checks the recipients and
 * the wording and sends it.
 *
 * An anchor rather than a button on purpose — right-click, middle-click and
 * keyboard activation all behave the way people expect from a mail link.
 */
export function MailButton({
  draft,
  title,
  className = 'mail-btn',
  label,
  noRecipientHint,
}: {
  draft: MailDraft;
  title: string;
  className?: string;
  label?: string;
  /** Appended to the tooltip when no address could be resolved. */
  noRecipientHint?: string;
}) {
  const { href, truncated } = useMemo(() => buildMailto(draft), [draft]);
  const empty = !draft.to?.length;
  const hint = [
    title,
    empty && noRecipientHint ? `— ${noRecipientHint}` : '',
    truncated ? '— trimmed to fit the mail client' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <a
      className={className}
      data-mail
      data-no-recipient={empty || undefined}
      data-truncated={truncated || undefined}
      href={href}
      title={hint}
      aria-label={hint}
      onClick={(e) => e.stopPropagation()}
    >
      <EnvelopeIcon />
      {label && <span className="mail-label">{label}</span>}
    </a>
  );
}

export function EnvelopeIcon() {
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
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="M3 6.5 12 13l9-6.5" />
    </svg>
  );
}
