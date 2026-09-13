'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { attachmentUrl, formatBytes } from '@/lib/attachments';
import { FILE_CATEGORIES, FILE_CATEGORY_LABEL, type FileCategory, type Meeting, type MeetingFile } from '@/lib/meetings/types';
import { fmtDate } from '@/lib/schedule';
import { useMeetingStore } from '@/store/meetingStore';
import { IconFile, IconPlus } from '../shell/icons';
import { Empty } from './atoms';
import { blankFile } from './blank';

type Owner = { meetingId?: string; decisionId?: string; actionItemId?: string };

const belongs = (f: MeetingFile, o: Owner) =>
  (o.meetingId != null && f.meetingId === o.meetingId) ||
  (o.decisionId != null && f.decisionId === o.decisionId) ||
  (o.actionItemId != null && f.actionItemId === o.actionItemId);

/**
 * Files and links on one owner — a meeting, a decision, an action item.
 *
 * A link is a title and an address. An upload is a row too, titled with the
 * file's name, with the bytes hanging off it the way every other attachment in
 * the app does, served by the same route.
 */
export function FilesList({
  owner,
  defaultCategory = 'attachment',
  title,
}: {
  owner: Owner;
  defaultCategory?: FileCategory;
  title?: string;
}) {
  const projectId = useMeetingStore((s) => s.projectId);
  const all = useMeetingStore((s) => s.files);
  const saveFile = useMeetingStore((s) => s.saveFile);
  const deleteFile = useMeetingStore((s) => s.deleteFile);
  const attachToFile = useMeetingStore((s) => s.attachToFile);
  const files = all.filter((f) => belongs(f, owner));
  const [category, setCategory] = useState<FileCategory>(defaultCategory);
  const [linkTitle, setLinkTitle] = useState('');
  const [url, setUrl] = useState('');
  const [problems, setProblems] = useState<string[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const validUrl = /^https?:\/\/\S+$/i.test(url.trim());

  return (
    <div data-files={Object.values(owner)[0]} style={{ width: '100%' }}>
      {title && (
        <div className="cap" style={{ marginBottom: 8, display: 'flex', gap: 7, alignItems: 'center' }}>
          {title}
          <span className="pill" style={{ fontSize: 10.5 }}>
            {files.length}
          </span>
        </div>
      )}

      {files.length === 0 ? (
        <p className="mono-note" style={{ marginBottom: 8 }}>
          Nothing attached or linked yet.
        </p>
      ) : (
        files.map((f) => (
          <div className="att" key={f.id} data-file={f.id}>
            <span className="ic">
              <IconFile />
            </span>
            <span style={{ flexGrow: 1, minWidth: 0 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span className="pill" style={{ fontSize: 10 }}>
                  {FILE_CATEGORY_LABEL[f.category]}
                </span>
                {f.url ? (
                  <a className="ell" href={f.url} target="_blank" rel="noreferrer noopener" style={{ fontSize: 12.5, fontWeight: 500 }}>
                    {f.title}
                  </a>
                ) : f.attachments[0] ? (
                  <a className="ell" href={attachmentUrl(f.attachments[0].id)} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, fontWeight: 500 }}>
                    {f.title}
                  </a>
                ) : (
                  <span className="ell" style={{ fontSize: 12.5, fontWeight: 500 }}>
                    {f.title}
                  </span>
                )}
              </span>
              <span className="num" style={{ fontSize: 11, color: 'var(--ink-4)', display: 'block', marginTop: 2 }}>
                {f.url ? 'Link' : f.attachments.length ? `File · ${formatBytes(f.attachments[0].size)}` : 'Uploading…'} ·{' '}
                {f.createdBy} · {fmtDate(f.createdAt)}
              </span>
            </span>
            <button type="button" className="x" title="Remove" aria-label={`Remove ${f.title}`} onClick={() => deleteFile(f.id)}>
              ✕
            </button>
          </div>
        ))
      )}

      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center', marginTop: 10 }}>
        <select className="lnkin" style={{ flexGrow: 0 }} aria-label="Kind of file" value={category} onChange={(e) => setCategory(e.target.value as FileCategory)}>
          {FILE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {FILE_CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>
        <input className="lnkin" style={{ flexGrow: 1, minWidth: 140 }} aria-label="Link title" placeholder="Title" value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} />
        <input className="lnkin" style={{ flexGrow: 2, minWidth: 180 }} aria-label="Link address" placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} />
        <button
          type="button"
          className="btn sm"
          disabled={!validUrl}
          title={validUrl ? undefined : 'An address starting with http:// or https://'}
          data-add-link
          onClick={() => {
            saveFile(blankFile(projectId, owner, category, linkTitle.trim() || url.trim(), url.trim()));
            setLinkTitle('');
            setUrl('');
          }}
        >
          <IconPlus />
          Add link
        </button>
        <button type="button" className="btn sm" data-upload onClick={() => input.current?.click()}>
          <IconPlus />
          Upload file
        </button>
        <input
          ref={input}
          type="file"
          multiple
          className="visually-hidden"
          aria-label="Upload a file"
          onChange={async (e) => {
            const picked = [...(e.target.files ?? [])];
            e.target.value = '';
            const out: string[] = [];
            for (const file of picked) {
              const row = blankFile(projectId, owner, category, file.name);
              saveFile(row);
              out.push(...(await attachToFile(row.id, [file])));
            }
            setProblems(out);
          }}
        />
      </div>
      {problems.map((p) => (
        <p className="mono-note late" key={p}>
          {p}
        </p>
      ))}
    </div>
  );
}

/** A meeting's files, and the evidence filed on its decisions and actions. */
export function FilesTab({ meeting, projectId }: { meeting: Meeting; projectId: string }) {
  const files = useMeetingStore((s) => s.files);
  const decisions = useMeetingStore((s) => s.decisions);
  const actions = useMeetingStore((s) => s.actions);
  const mine = new Set(decisions.filter((d) => d.meetingId === meeting.id).map((d) => d.id));
  const raised = new Set(actions.filter((a) => a.meetingId === meeting.id).map((a) => a.id));
  const evidence = files.filter((f) => (f.decisionId && mine.has(f.decisionId)) || (f.actionItemId && raised.has(f.actionItemId)));
  const base = `/p/${projectId}/meetings/${meeting.id}`;

  return (
    <div className="mt-page" data-files-tab>
      <div className="card" style={{ padding: '14px 18px' }}>
        <FilesList
          owner={{ meetingId: meeting.id }}
          title="Presentations, reports, analysis and links"
        />
      </div>
      <div className="card" style={{ marginTop: 16, overflow: 'hidden' }}>
        <div className="card-hd">
          <b style={{ fontSize: 13.5 }}>Evidence filed on this meeting&rsquo;s decisions and actions</b>
          <span className="pill">{evidence.length}</span>
        </div>
        {evidence.length === 0 ? (
          <Empty>Supporting evidence for a decision and completion evidence for an action are added on the decision or the action itself.</Empty>
        ) : (
          evidence.map((f) => {
            const d = decisions.find((x) => x.id === f.decisionId);
            const a = actions.find((x) => x.id === f.actionItemId);
            return (
              <div key={f.id} className="mt-mini" style={{ padding: '9px 16px' }}>
                <span style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="pill" style={{ fontSize: 10 }}>
                    {FILE_CATEGORY_LABEL[f.category]}
                  </span>
                  <a href={f.url || (f.attachments[0] ? attachmentUrl(f.attachments[0].id) : undefined)} target="_blank" rel="noreferrer noopener">
                    {f.title}
                  </a>
                </span>
                <span className="mt-meta">
                  {d && (
                    <>
                      Decision: <Link href={`${base}?tab=decisions`}>{d.title}</Link>
                    </>
                  )}
                  {a && (
                    <>
                      Action: <Link href={`${base}?tab=actions`}>{a.description}</Link>
                    </>
                  )}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
