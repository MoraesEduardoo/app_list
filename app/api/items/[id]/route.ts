import { NextRequest, NextResponse } from 'next/server';
import { verifyRequestAuth } from '../../../../src/lib/auth-helper.ts';
import { updateItemForUser, deleteItemForUser } from '../../../../src/db/queries.ts';

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
    const itemId = Number(id);
    if (Number.isNaN(itemId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await req.json();
    const updates: { completed?: boolean; title?: string } = {};

    if (typeof body.completed === 'boolean') {
      updates.completed = body.completed;
    }
    if (typeof body.title === 'string') {
      const trimmed = body.title.trim();
      if (!trimmed) {
        return NextResponse.json(
          { error: 'O título do item não pode ficar vazio.' },
          { status: 400 }
        );
      }
      updates.title = trimmed;
    }

    const updated = await updateItemForUser(user.uid, itemId, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ item: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar item';
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
    const itemId = Number(id);
    if (Number.isNaN(itemId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const deleted = await deleteItemForUser(user.uid, itemId);
    if (!deleted) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ deleted });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao excluir item';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
