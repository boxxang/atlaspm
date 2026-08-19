import { describe, expect, it } from 'vitest';
import {
  MAX_ATTACHMENTS_PER_POST,
  MAX_ATTACHMENT_BYTES,
  attachmentUrl,
  formatBytes,
  isInlineImage,
  rejectFile,
  rejectionMessage,
  safeFilename,
} from '@/lib/attachments';

describe('what renders inline', () => {
  it('allows the raster image types', () => {
    for (const t of ['image/png', 'image/jpeg', 'image/gif', 'image/webp']) {
      expect(isInlineImage(t)).toBe(true);
    }
    expect(isInlineImage('IMAGE/PNG')).toBe(true);
  });

  it('refuses SVG, which can carry script, and everything non-image', () => {
    expect(isInlineImage('image/svg+xml')).toBe(false);
    expect(isInlineImage('text/html')).toBe(false);
    expect(isInlineImage('application/pdf')).toBe(false);
    expect(isInlineImage('')).toBe(false);
  });
});

describe('filenames', () => {
  it('keeps a path out of the download header', () => {
    expect(safeFilename('../../etc/passwd')).toBe('passwd');
    expect(safeFilename('C:\\Users\\me\\spec.pdf')).toBe('spec.pdf');
    expect(safeFilename('plain.txt')).toBe('plain.txt');
  });

  it('strips quotes and control characters that would break the header', () => {
    expect(safeFilename('we"ird\u0000.txt')).toBe('weird.txt');
    expect(safeFilename('   ')).toBe('file');
    expect(safeFilename('x'.repeat(300)).length).toBe(120);
  });
});

describe('accepting a file', () => {
  it('takes an ordinary file', () => {
    expect(rejectFile({ size: 1024 }, 0)).toBe(null);
    expect(rejectFile({ size: MAX_ATTACHMENT_BYTES }, 0)).toBe(null);
  });

  it('refuses empty, oversized, and one too many', () => {
    expect(rejectFile({ size: 0 }, 0)).toBe('empty');
    expect(rejectFile({ size: MAX_ATTACHMENT_BYTES + 1 }, 0)).toBe('too-large');
    expect(rejectFile({ size: 10 }, MAX_ATTACHMENTS_PER_POST)).toBe('too-many');
  });

  it('says why, naming the file', () => {
    expect(rejectionMessage('too-large', 'die.gds')).toContain('die.gds');
    expect(rejectionMessage('too-large', 'die.gds')).toContain('5 MB');
    expect(rejectionMessage('too-many', 'x.png')).toContain(String(MAX_ATTACHMENTS_PER_POST));
    expect(rejectionMessage('empty', 'x.png')).toContain('empty');
  });
});

describe('display helpers', () => {
  it('sizes a file for a chip', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2 KB');
    expect(formatBytes(1024 * 1024 * 1.44)).toBe('1.4 MB');
    expect(formatBytes(1024 * 1024 * 12)).toBe('12 MB');
  });

  it('addresses the serving route', () => {
    expect(attachmentUrl('abc')).toBe('/api/attachments/abc');
  });
});
