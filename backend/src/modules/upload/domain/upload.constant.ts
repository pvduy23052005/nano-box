import { FileCategory, UploadFolder } from './upload.type';

export { UploadFolder };
export const ALLOWED_UPLOAD_FOLDERS: readonly string[] =
  Object.values(UploadFolder);

export const MAX_FILE_SIZE = 25 * 1024 * 1024;

export const DOCUMENT_MIMES: readonly string[] = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'application/json',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'application/x-tar',
  'application/gzip',
];

export const MIME_TYPE_MAP: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  bmp: 'image/bmp',
  avif: 'image/avif',
  heic: 'image/heic',
  heif: 'image/heif',
  tiff: 'image/tiff',
  tif: 'image/tiff',

  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  flac: 'audio/flac',
  wma: 'audio/x-ms-wma',

  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  mkv: 'video/x-matroska',
  avi: 'video/x-msvideo',
  wmv: 'video/x-ms-wmv',
  flv: 'video/x-flv',

  pdf: 'application/pdf',
  txt: 'text/plain; charset=utf-8',
  css: 'text/css; charset=utf-8',
  json: 'application/json',
  csv: 'text/csv; charset=utf-8',
  xml: 'application/xml',
  md: 'text/markdown; charset=utf-8',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  zip: 'application/zip',
  rar: 'application/x-rar-compressed',
  '7z': 'application/x-7z-compressed',
  tar: 'application/x-tar',
  gz: 'application/gzip',
};

export const DISALLOWED_MIME_TYPES: readonly string[] = [
  'text/html',
  'text/javascript',
  'application/javascript',
  'application/x-javascript',
];

export const SAFE_INLINE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/bmp',
  'image/x-icon',
  'image/heic',
  'image/heif',
  'image/tiff',

  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/mp4',
  'audio/aac',
  'audio/flac',
  'audio/x-ms-wma',

  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-matroska',
  'video/x-msvideo',
  'video/x-ms-wmv',
  'video/x-flv',
]);

export const RASTER_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/bmp',
  'image/x-icon',
  'image/heic',
  'image/heif',
  'image/tiff',
]);

export function isRasterImage(mimeType: string): boolean {
  const baseMime = mimeType.split(';')[0].trim().toLowerCase();
  return RASTER_IMAGE_MIME_TYPES.has(baseMime);
}

export function resolveMimeType(
  filename?: string,
  fallbackMime?: string,
): string {
  if (
    fallbackMime &&
    DISALLOWED_MIME_TYPES.some((disallowed) =>
      fallbackMime.toLowerCase().startsWith(disallowed),
    )
  ) {
    return 'application/octet-stream';
  }

  if (filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext && MIME_TYPE_MAP[ext]) {
      return MIME_TYPE_MAP[ext];
    }
  }

  if (fallbackMime && fallbackMime !== 'application/octet-stream') {
    return fallbackMime;
  }

  return 'application/octet-stream';
}

export function resolveContentDisposition(
  filename: string,
  mimeType: string,
): string {
  const baseMime = mimeType.split(';')[0].trim().toLowerCase();
  const isSafeInline = SAFE_INLINE_MIME_TYPES.has(baseMime);
  const dispositionType = isSafeInline ? 'inline' : 'attachment';
  const encodedFilename = encodeURIComponent(filename);
  return `${dispositionType}; filename="${encodedFilename}"`;
}

export function detectFileCategory(
  mimetype?: string,
  filename?: string,
): FileCategory {
  const mime = mimetype?.toLowerCase() || '';
  const ext = filename ? filename.split('.').pop()?.toLowerCase() : '';

  if (
    mime.startsWith('image/') ||
    [
      'jpg',
      'jpeg',
      'png',
      'gif',
      'webp',
      'svg',
      'heic',
      'heif',
      'ico',
      'bmp',
      'avif',
      'tiff',
      'tif',
    ].includes(ext || '')
  ) {
    return 'image';
  }

  if (
    mime.startsWith('audio/') ||
    ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'wma'].includes(ext || '')
  ) {
    return 'audio';
  }

  if (
    mime.startsWith('video/') ||
    ['mp4', 'webm', 'mov', 'mkv', 'avi', 'wmv', 'flv'].includes(ext || '')
  ) {
    return 'video';
  }

  if (
    DOCUMENT_MIMES.includes(mime) ||
    [
      'pdf',
      'doc',
      'docx',
      'xls',
      'xlsx',
      'ppt',
      'pptx',
      'txt',
      'csv',
      'zip',
      'rar',
      '7z',
      'tar',
      'gz',
      'json',
      'md',
    ].includes(ext || '')
  ) {
    return 'document';
  }

  return 'other';
}

export function isValidImageMagicBytes(buffer?: Buffer): boolean {
  if (!buffer || buffer.length < 4) {
    return false;
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true;
  }

  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return true;
  }

  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return true;
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return true;
  }

  if (buffer[0] === 0x42 && buffer[1] === 0x4d) {
    return true;
  }

  if (
    buffer.length >= 8 &&
    buffer.subarray(4, 8).toString('ascii') === 'ftyp'
  ) {
    return true;
  }

  if (
    (buffer[0] === 0x49 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x2a &&
      buffer[3] === 0x00) ||
    (buffer[0] === 0x4d &&
      buffer[1] === 0x4d &&
      buffer[2] === 0x00 &&
      buffer[3] === 0x2a)
  ) {
    return true;
  }

  if (
    buffer[0] === 0x00 &&
    buffer[1] === 0x00 &&
    buffer[2] === 0x01 &&
    buffer[3] === 0x00
  ) {
    return true;
  }

  const sample = buffer.subarray(0, 256).toString('utf8').trim().toLowerCase();
  if (
    sample.startsWith('<svg') ||
    (sample.startsWith('<?xml') && sample.includes('<svg'))
  ) {
    return true;
  }

  return false;
}
