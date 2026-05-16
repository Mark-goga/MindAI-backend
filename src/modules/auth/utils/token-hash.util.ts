import { createHash, timingSafeEqual } from 'node:crypto';

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function verifyTokenHash(token: string, tokenHash: string): boolean {
  const actualHash = Buffer.from(hashToken(token), 'hex');
  const expectedHash = Buffer.from(tokenHash, 'hex');
  if (actualHash.length !== expectedHash.length) {
    return false;
  }

  return timingSafeEqual(actualHash, expectedHash);
}
