import { NextRequest, NextResponse } from 'next/server';
import { verifyRequestAuth } from '../../../../src/lib/auth-helper.ts';
import { deleteCategoryForUser } from '../../../../src/db/queries.ts';

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
