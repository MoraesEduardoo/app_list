import { NextRequest, NextResponse } from 'next/server';
import { verifyRequestAuth } from '../../../../src/lib/auth-helper.ts';
import {
  updateCategoryForUser,
  deleteCategoryForUser,
} from '../../../../src/db/queries.ts';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await verifyRequestAuth(req);
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const categoryId = Number(id);
    if (Number.isNaN(categoryId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const color = typeof body.color === 'string' ? body.color : 'indigo';
    const icon = typeof body.icon === 'string' ? body.icon : 'shopping-cart';

    if (!name) {
      return NextResponse.json(
        { error: 'O nome da categoria não pode estar vazio.' },
        { status: 400 }
      );
    }

    const updated = await updateCategoryForUser(user.uid, categoryId, {
      name,
      color,
      icon,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ category: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar categoria';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await verifyRequestAuth(req);
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const categoryId = Number(id);
    if (Number.isNaN(categoryId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const deleted = await deleteCategoryForUser(user.uid, categoryId);
    if (!deleted) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ deleted });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao excluir categoria';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
