/**
 * Cryptographic helper for secure client-side password hashing.
 * Uses standard Web Crypto API SHA-256 with a dedicated application salt.
 */
const SALT = 'KAA_SUPPORT_ERP_SALT_2026_SECURE';

export async function hashPassword(password: string): Promise<string> {
  if (!password) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(password + SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPasswordHash(password: string, expectedHash: string): Promise<boolean> {
  if (!password || !expectedHash) return false;
  const computedHash = await hashPassword(password);
  return computedHash === expectedHash;
}
