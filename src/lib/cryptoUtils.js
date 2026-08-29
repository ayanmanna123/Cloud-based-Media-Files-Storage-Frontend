/**
 * Web Crypto API utilities for Client-Side AES-256-GCM End-to-End Encryption
 */

// Helper to convert Uint8Array / ArrayBuffer to Base64 string
export function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper to convert Base64 string to Uint8Array
export function base64ToBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Derives a 256-bit AES-GCM CryptoKey from a user passphrase or secret using PBKDF2
 * @param {string} passphrase - User secret passphrase
 * @param {string} [saltStr='cloud_media_storage_salt'] - Salt string
 * @returns {Promise<CryptoKey>}
 */
export async function deriveEncryptionKey(passphrase, saltStr = 'cloud_media_storage_salt_v1') {
  const encoder = new TextEncoder();
  const passphraseBuffer = encoder.encode(passphrase || 'default_storage_secret');
  const saltBuffer = encoder.encode(saltStr);

  const baseKey = await crypto.subtle.importKey(
    'raw',
    passphraseBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts an ArrayBuffer payload using AES-256-GCM
 * @param {ArrayBuffer} arrayBuffer - Raw file data ArrayBuffer
 * @param {CryptoKey} key - CryptoKey from deriveEncryptionKey
 * @returns {Promise<{ encryptedBuffer: ArrayBuffer, ivBase64: string }>}
 */
export async function encryptFileBuffer(arrayBuffer, key) {
  // Generate random 12-byte initialization vector (standard for AES-GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    arrayBuffer
  );

  return {
    encryptedBuffer,
    ivBase64: bufferToBase64(iv)
  };
}

/**
 * Decrypts an encrypted ArrayBuffer payload using AES-256-GCM
 * @param {ArrayBuffer} encryptedBuffer - Ciphertext ArrayBuffer
 * @param {CryptoKey} key - CryptoKey from deriveEncryptionKey
 * @param {string} ivBase64 - Base64 encoded Initialization Vector
 * @returns {Promise<ArrayBuffer>} Decrypted raw ArrayBuffer
 */
export async function decryptFileBuffer(encryptedBuffer, key, ivBase64) {
  if (!ivBase64) {
    throw new Error('Missing initialization vector (IV) for encrypted file');
  }
  const iv = base64ToBuffer(ivBase64);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    encryptedBuffer
  );

  return decryptedBuffer;
}

/**
 * Decrypts file buffer attempting candidate keys (file owner ID, user ID, secret code, default secret)
 */
export async function decryptFileWithFallbackKeys(arrayBuffer, user, ivBase64, fileMeta = null) {
  if (!ivBase64) {
    throw new Error('Missing initialization vector (IV) for encrypted file');
  }

  const passphrases = Array.from(new Set([
    fileMeta?.ownerId,
    fileMeta?.owner_id,
    user?.id,
    user?.secretCode,
    'default_storage_secret'
  ])).filter(Boolean);

  let lastError = null;
  for (const passphrase of passphrases) {
    try {
      const key = await deriveEncryptionKey(passphrase);
      const decrypted = await decryptFileBuffer(arrayBuffer, key, ivBase64);
      if (decrypted) return decrypted;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('OperationError: Decryption key mismatch or corrupted payload');
}
