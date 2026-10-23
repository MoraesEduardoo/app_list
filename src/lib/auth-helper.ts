import { NextRequest } from 'next/server';
import { adminAuth } from './firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';

export async function verifyRequestAuth(req: NextRequest): Promise<DecodedIdToken | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded;
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return null;
  }
}
