import { NextRequest, NextResponse } from 'next/server';
import { verifyRequestAuth } from '../../../src/lib/auth-helper.ts';
import {
  getOrCreateUser,
  getUserCategoriesWithItems,
  createCategoryForUser,
  seedInitialCategoriesIfEmpty,
} from '../../../src/db/queries.ts';

export async function GET(req: NextRequest) {
  const user = await verifyRequestAuth(req);
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado: Token ausente ou inválido' }, { status: 401 });
  }

  try {
    await getOrCreateUser(user.uid, user.email || `${user.uid}@user.local`, user.name);
    await seedInitialCategoriesIfEmpty(user.uid);
    const data = await getUserCategoriesWithItems(user.uid);
    return NextResponse.json({ categories: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar categorias';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await verifyRequestAuth(req);
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado: Token ausente ou inválido' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const color = typeof body.color === 'string' ? body.color : 'indigo';
    const icon = typeof body.icon === 'string' ? body.icon : 'folder';

    if (!name) {
      return NextResponse.json({ error: 'O nome da categoria é obrigatório.' }, { status: 400 });
    }

    await getOrCreateUser(user.uid, user.email || `${user.uid}@user.local`, user.name);
    const category = await createCategoryForUser(user.uid, name, color, icon);
    return NextResponse.json({ category }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao criar categoria';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
