import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  findUserByEmail,
  createEmailUser,
} from '../../../src/db/queries.ts';
import {
  createSignedSessionToken,
  hashPassword,
  verifyRequestAuth,
} from '../../../src/lib/auth-helper.ts';

export async function GET(req: NextRequest) {
  const user = await verifyRequestAuth(req);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action === 'signup' ? 'signup' : 'login';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Informe um endereço de e-mail válido.' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres.' },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);
    const existing = await findUserByEmail(email);

    if (action === 'signup') {
      if (existing) {
        return NextResponse.json(
          { error: 'Este e-mail já está cadastrado. Faça login na sua conta.' },
          { status: 409 }
        );
      }

      const uid = `usr_${crypto.randomUUID()}`;
      const created = await createEmailUser(
        uid,
        email,
        passwordHash,
        name || email.split('@')[0]
      );

      const userPayload = {
        uid: created.uid,
        email: created.email,
        name: created.displayName || email.split('@')[0],
      };

      const token = createSignedSessionToken(userPayload);
      const res = NextResponse.json({ user: userPayload, token }, { status: 201 });
      res.cookies.set('applist_session', token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 14,
      });
      return res;
    }

    // Login
    if (!existing || !existing.passwordHash || existing.passwordHash !== passwordHash) {
      return NextResponse.json(
        { error: 'E-mail ou senha incorretos.' },
        { status: 401 }
      );
    }

    const userPayload = {
      uid: existing.uid,
      email: existing.email,
      name: existing.displayName || existing.email.split('@')[0],
    };

    const token = createSignedSessionToken(userPayload);
    const res = NextResponse.json({ user: userPayload, token }, { status: 200 });
    res.cookies.set('applist_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 14,
    });
    return res;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao processar autenticação.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete('applist_session');
  return res;
}
