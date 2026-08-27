/**
 * Helper utilities for building media and thumbnail URLs across ImageKit and Telegram storage providers.
 */

export function getFileMediaUrl(file) {
  if (!file) return '';
  if (file.url) return file.url;
  if (file.signedUrl) return file.signedUrl;

  const storageKey = file.storageKey || file.storage_key || '';
  if (storageKey.startsWith('tg:')) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${apiUrl}/api/files/${file.id}/view`;
  }

  const endpoint = (import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || '').replace(/\/$/, '');
  const rawKey = storageKey.replace(/^\//, '');
  return `${endpoint}/${rawKey}`;
}

export function getFileThumbnailUrl(file) {
  if (!file) return '';
  if (file.signedUrl) return file.signedUrl;

  const storageKey = file.storageKey || file.storage_key || '';
  if (storageKey.startsWith('tg:')) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${apiUrl}/api/files/${file.id}/view`;
  }

  const endpoint = (import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || '').replace(/\/$/, '');
  const rawKey = storageKey.replace(/^\//, '');
  const isImage = (file.name || '').match(/\.(jpg|jpeg|png|gif|webp)$/i);

  if (isImage) {
    return `${endpoint}/${rawKey}?tr=w-600,h-800,c-at_max,bg-FFFFFF`;
  }
  return `${endpoint}/${rawKey}/ik-thumbnail.jpg?tr=w-600,h-800,c-at_max,bg-FFFFFF`;
}
