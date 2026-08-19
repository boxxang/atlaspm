import { isInlineImage, safeFilename } from '@/lib/attachments';
import { prisma } from '@/lib/db';

/**
 * Serves an attachment back.
 *
 * User-uploaded content is only rendered inline for a short list of raster
 * image types; everything else downloads. SVG is excluded on purpose — it can
 * carry script, so serving it inline from our own origin would be an XSS hole.
 * nosniff stops the browser second-guessing the declared type, and the CSP
 * sandbox neutralises anything that does get rendered.
 */
export async function GET(_req: Request, ctx: RouteContext<'/api/attachments/[id]'>) {
  const { id } = await ctx.params;
  const file = await prisma.attachment.findUnique({ where: { id } });
  if (!file) return new Response('Not found', { status: 404 });

  const inline = isInlineImage(file.mimeType);
  const name = safeFilename(file.filename);

  return new Response(new Uint8Array(file.data), {
    headers: {
      'Content-Type': inline ? file.mimeType : 'application/octet-stream',
      'Content-Length': String(file.size),
      'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename="${name}"`,
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
      'Cache-Control': 'private, max-age=31536000, immutable',
    },
  });
}
