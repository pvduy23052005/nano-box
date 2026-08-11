export type FileCategory = 'image' | 'audio' | 'document' | 'video' | 'other';

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

export function detectFileCategory(mimetype?: string, filename?: string): FileCategory {
  const mime = mimetype?.toLowerCase() || '';
  const ext = filename ? filename.split('.').pop()?.toLowerCase() : '';

  if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'heic', 'heif', 'ico', 'bmp'].includes(ext || '')) {
    return 'image';
  }

  if (mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'wma'].includes(ext || '')) {
    return 'audio';
  }

  if (mime.startsWith('video/') || ['mp4', 'webm', 'mov', 'mkv', 'avi', 'wmv', 'flv'].includes(ext || '')) {
    return 'video';
  }

  if (
    DOCUMENT_MIMES.includes(mime) ||
    ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'zip', 'rar', '7z', 'tar', 'gz', 'json', 'md'].includes(ext || '')
  ) {
    return 'document';
  }

  return 'other';
}

