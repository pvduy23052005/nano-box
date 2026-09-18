export type FileCategory = 'image' | 'audio' | 'document' | 'video' | 'other';

export enum UploadFolder {
  UPLOADS = 'uploads',
  TEMP = 'temp',
  AVATARS = 'avatars',
}

export const ALLOWED_UPLOAD_FOLDERS: readonly string[] = Object.values(UploadFolder);

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export const DOCUMENT_MIMES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'text/html',
  'application/json',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'application/x-tar',
  'application/gzip',
];

export const MIME_TYPE_MAP: Record<string, string> = {
  // Images
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

  // Audio
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  flac: 'audio/flac',
  wma: 'audio/x-ms-wma',

  // Video
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  mkv: 'video/x-matroska',
  avi: 'video/x-msvideo',
  wmv: 'video/x-ms-wmv',
  flv: 'video/x-flv',

  // Documents / Text
  pdf: 'application/pdf',
  txt: 'text/plain; charset=utf-8',
  html: 'text/html; charset=utf-8',
  htm: 'text/html; charset=utf-8',
  css: 'text/css; charset=utf-8',
  js: 'text/javascript; charset=utf-8',
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

export function resolveMimeType(
  filename?: string,
  fallbackMime?: string,
): string {
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
