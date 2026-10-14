import {
  DOCUMENT_MIMES,
  MIME_TYPE_MAP,
  resolveMimeType,
  resolveContentDisposition,
  SAFE_INLINE_MIME_TYPES,
} from '../upload.constant';

describe('upload.constant security & content disposition', () => {
  describe('MIME restrictions', () => {
    it('should not allow text/html in DOCUMENT_MIMES', () => {
      expect(DOCUMENT_MIMES).not.toContain('text/html');
    });

    it('should not map html, htm, js in MIME_TYPE_MAP', () => {
      expect(MIME_TYPE_MAP['html']).toBeUndefined();
      expect(MIME_TYPE_MAP['htm']).toBeUndefined();
      expect(MIME_TYPE_MAP['js']).toBeUndefined();
    });

    it('should not resolve html, htm, js to executable text/html or text/javascript', () => {
      expect(resolveMimeType('index.html')).toBe('application/octet-stream');
      expect(resolveMimeType('page.htm')).toBe('application/octet-stream');
      expect(resolveMimeType('payload.js')).toBe('application/octet-stream');
    });

    it('should sanitize dangerous fallback MIME types', () => {
      expect(resolveMimeType('file.unknown', 'text/html')).toBe(
        'application/octet-stream',
      );
      expect(resolveMimeType('file.unknown', 'text/javascript')).toBe(
        'application/octet-stream',
      );
      expect(resolveMimeType('file.unknown', 'application/javascript')).toBe(
        'application/octet-stream',
      );
      expect(resolveMimeType('file.unknown', 'text/html; charset=utf-8')).toBe(
        'application/octet-stream',
      );
    });

    it('should still resolve safe mime types correctly', () => {
      expect(resolveMimeType('photo.png')).toBe('image/png');
      expect(resolveMimeType('song.mp3')).toBe('audio/mpeg');
      expect(resolveMimeType('video.mp4')).toBe('video/mp4');
      expect(resolveMimeType('document.pdf')).toBe('application/pdf');
    });
  });

  describe('resolveContentDisposition', () => {
    it('should return inline for safe raster images', () => {
      expect(resolveContentDisposition('avatar.jpg', 'image/jpeg')).toBe(
        'inline; filename="avatar.jpg"',
      );
      expect(resolveContentDisposition('banner.png', 'image/png')).toBe(
        'inline; filename="banner.png"',
      );
      expect(resolveContentDisposition('sticker.webp', 'image/webp')).toBe(
        'inline; filename="sticker.webp"',
      );
      expect(resolveContentDisposition('anim.gif', 'image/gif')).toBe(
        'inline; filename="anim.gif"',
      );
    });

    it('should return inline for audio and video files', () => {
      expect(resolveContentDisposition('track.mp3', 'audio/mpeg')).toBe(
        'inline; filename="track.mp3"',
      );
      expect(resolveContentDisposition('clip.mp4', 'video/mp4')).toBe(
        'inline; filename="clip.mp4"',
      );
    });

    it('should force attachment for image/svg+xml to prevent Stored XSS', () => {
      expect(resolveContentDisposition('malicious.svg', 'image/svg+xml')).toBe(
        'attachment; filename="malicious.svg"',
      );
      expect(SAFE_INLINE_MIME_TYPES.has('image/svg+xml')).toBe(false);
    });

    it('should force attachment for documents, scripts, and unknown binaries', () => {
      expect(resolveContentDisposition('archive.zip', 'application/zip')).toBe(
        'attachment; filename="archive.zip"',
      );
      expect(resolveContentDisposition('manual.pdf', 'application/pdf')).toBe(
        'attachment; filename="manual.pdf"',
      );
      expect(
        resolveContentDisposition('data.bin', 'application/octet-stream'),
      ).toBe('attachment; filename="data.bin"');
      expect(resolveContentDisposition('xss.html', 'text/html')).toBe(
        'attachment; filename="xss.html"',
      );
    });

    it('should encode filenames properly', () => {
      expect(
        resolveContentDisposition('tài liệu mới.pdf', 'application/pdf'),
      ).toBe(
        'attachment; filename="t%C3%A0i%20li%E1%BB%87u%20m%E1%BB%9Bi.pdf"',
      );
    });
  });
});
