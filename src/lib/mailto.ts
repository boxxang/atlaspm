/**
 * /lib/mailto.ts — composing a draft in the user's mail client.
 *
 * A web page cannot open Outlook specifically; `mailto:` hands the draft to
 * whatever the OS has registered, which on a corporate desktop is Outlook. The
 * draft opens unsent, so the TPM edits recipients and wording before sending.
 *
 * Pure: no DOM, no clock of its own.
 */

/**
 * Practical ceiling for a mailto URL. Outlook truncates around 2 KB and older
 * Windows shells refuse longer ones outright, so bodies are trimmed to fit
 * rather than silently losing their tail.
 */
export const MAILTO_LIMIT = 1900;

export interface MailDraft {
  to?: string[];
  cc?: string[];
  subject: string;
  body: string;
}

export interface BuiltMail {
  href: string;
  /** True when the body had to be cut to fit the URL limit. */
  truncated: boolean;
}

const TRUNCATION_NOTE = '\n\n[… truncated — open the item in AtlasPM for the full record]';

/** RFC 6068: everything after `mailto:` is percent-encoded, spaces included. */
export function buildMailto({ to = [], cc = [], subject, body }: MailDraft): BuiltMail {
  const recipients = to.filter(Boolean).join(',');
  const params: string[] = [`subject=${encodeURIComponent(subject)}`];
  if (cc.filter(Boolean).length) params.push(`cc=${encodeURIComponent(cc.filter(Boolean).join(','))}`);

  const head = `mailto:${encodeURIComponent(recipients).replace(/%40/g, '@').replace(/%2C/g, ',')}?${params.join('&')}&body=`;
  const room = MAILTO_LIMIT - head.length;

  let text = body;
  let truncated = false;
  if (encodeURIComponent(text).length > room) {
    truncated = true;
    /* Encoding is variable width, so walk the plain text down until it fits. */
    const note = encodeURIComponent(TRUNCATION_NOTE).length;
    let hi = text.length;
    let lo = 0;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (encodeURIComponent(text.slice(0, mid)).length + note <= room) lo = mid;
      else hi = mid - 1;
    }
    text = text.slice(0, lo).replace(/\s+$/, '') + TRUNCATION_NOTE;
  }
  return { href: head + encodeURIComponent(text), truncated };
}

/** Left-aligned label column, so the draft still reads well in a plain-text mail. */
export const row = (label: string, value: string, width = 15) =>
  `${label.padEnd(width)}${value}`;

export const section = (title: string, lines: string[]) =>
  lines.length ? `${title}\n${lines.join('\n')}` : '';

export const joinSections = (blocks: string[]) => blocks.filter(Boolean).join('\n\n');

/** Keep one update readable in a mail body without dumping an essay. */
export const clip = (text: string, max = 220) =>
  text.length <= max ? text : text.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
