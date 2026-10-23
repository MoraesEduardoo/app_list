import { NextRequest, NextResponse } from 'next/server';
import { verifyRequestAuth } from '../../../src/lib/auth-helper.ts';
import { createItemForUser } from '../../../src/db/queries.ts';

export async function POST(req: NextRequest) {
  const user = await verifyRequestAuth(req);
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const categoryId = Number(body.categoryId);
    const title = typeof body.title === 'string' ? body.title.trim() : '';

    if (Number.isNaN(categoryId) || !title) {
      return NextResponse.json(
        { error: 'Categoria e título do item são obrigatórios.' },
        { status: 400 }
      );
    }

    const item = await createItemForUser(user.uid, categoryId, title);
    return NextResponse.json({ item }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao criar item';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
