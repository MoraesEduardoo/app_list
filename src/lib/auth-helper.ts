import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { adminAuth } from './firebase-admin.ts';

export interface AuthenticatedUser {
  uid: string;
  email: string;
  name?: string;
}

const SESSION_SECRET = process.env.SQL_PASSWORD || 'applist-cloud-session-secret-key-2026';

export function createSignedSessionToken(user: AuthenticatedUser): string {
  const payload = Buffer.from(
    JSON.stringify({
      uid: user.uid,
      email: user.email,
      name: user.name || user.email.split('@')[0],
      exp: Date.now() + 1000 * 60 * 60 * 24 * 14, // 14 dias
    })
  ).toString('base64url');

  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');

  return `s1.${payload}.${signature}`;
}

export function verifySignedSessionToken(token: string): AuthenticatedUser | null {
  if (!token.startsWith('s1.')) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [, payload, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');

  if (signature !== expectedSig) return null;

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!decoded.uid || !decoded.email || decoded.exp < Date.now()) {
      return null;
    }
    return {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
    };
  } catch {
    return null;
  }
}

export function hashPassword(password: string): string {
  return crypto
    .pbkdf2Sync(password, SESSION_SECRET, 10000, 32, 'sha256')
    .toString('hex');
}

export async function verifyRequestAuth(req: NextRequest): Promise<AuthenticatedUser | null> {
  const authHeader = req.headers.get('authorization');
  const cookieToken = req.cookies.get('applist_session')?.value;

  const rawToken =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split('Bearer ')[1]
      : cookieToken;

  if (!rawToken) {
    return null;
  }

  // 1. Verificar se é um token de sessão assinado do banco PostgreSQL
  if (rawToken.startsWith('s1.')) {
    return verifySignedSessionToken(rawToken);
  }

  // 2. Verificar se é um ID Token do Firebase Auth (Google OAuth)
  try {
    const decoded = await adminAuth.verifyIdToken(rawToken);
    return {
      uid: decoded.uid,
      email: decoded.email || `${decoded.uid}@user.local`,
      name: decoded.name,
    };
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}
