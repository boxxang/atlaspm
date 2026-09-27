import { notFound } from 'next/navigation';
import { SignoffBoard } from '@/components/shell/SignoffBoard';
import { signoffDefinition } from '@/lib/signoffDefinition';
import { signoffInApp } from '@/data/deliverableTemplates';
import type { AttachmentMeta } from '@/lib/attachments';
import { prisma } from '@/lib/db';

/**
 * /p/:id/signoff/:ref — a gate deliverable confirmed item by item, in the app.
 *
 * The same checklist the sign-off workbook carries, built from the same
 * definition, so a gate can be run here or in Excel and list the same items.
 * The definition is read here because it comes from the write-ups, which stay
 * on the server; what the owners and the stage lead have recorded is one JSON
 * document per deliverable.
 */
export const dynamic = 'force-dynamic';

export default async function Signoff({ params }: PageProps<'/p/[projectId]/signoff/[ref]'>) {
  const { projectId, ref: raw } = await params;
  const ref = decodeURIComponent(raw).toUpperCase();
  if (!signoffInApp(ref)) notFound();
  const def = signoffDefinition(ref);
  if (!def) notFound();
  const [stored, files] = await Promise.all([
    prisma.deliverableSignoff.findUnique({
      where: { projectId_ref: { projectId, ref } },
      select: { payload: true },
    }),
    /* the evidence attached to its items — the metadata, never the bytes */
    prisma.attachment.findMany({
      where: { projectId, signoffRef: ref },
      select: { id: true, filename: true, mimeType: true, size: true, signoffItem: true },
      orderBy: { createdAt: 'asc' },
    }),
  ]);
  const evidence: Record<string, AttachmentMeta[]> = {};
  for (const f of files) {
    if (!f.signoffItem) continue;
    (evidence[f.signoffItem] ??= []).push({ id: f.id, filename: f.filename, mimeType: f.mimeType, size: f.size });
  }
  return <SignoffBoard projectId={projectId} def={def} initial={stored?.payload ?? null} initialFiles={evidence} />;
}
