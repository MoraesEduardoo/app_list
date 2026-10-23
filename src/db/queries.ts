import { db } from './index.ts';
import { users, categories, items } from './schema.ts';
import { eq, and, asc, desc } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, displayName?: string | null) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName: displayName || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName: displayName || null,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database query failed in getOrCreateUser:', error);
    throw new Error('Falha ao sincronizar perfil de usuário.', { cause: error });
  }
}

export async function getUserCategoriesWithItems(uid: string) {
  try {
    const userCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.userUid, uid))
      .orderBy(asc(categories.createdAt));

    const userItems = await db
      .select()
      .from(items)
      .where(eq(items.userUid, uid))
      .orderBy(asc(items.completed), desc(items.createdAt));

    return userCategories.map((cat) => ({
      ...cat,
      items: userItems.filter((item) => item.categoryId === cat.id),
    }));
  } catch (error) {
    console.error('Database query failed in getUserCategoriesWithItems:', error);
    throw new Error('Falha ao carregar categorias e itens.', { cause: error });
  }
}

export async function createCategoryForUser(
  uid: string,
  name: string,
  color: string,
  icon: string
) {
  try {
    const result = await db
      .insert(categories)
      .values({
        userUid: uid,
        name,
        color,
        icon,
      })
      .returning();

    return {
      ...result[0],
      items: [],
    };
  } catch (error) {
    console.error('Database query failed in createCategoryForUser:', error);
    throw new Error('Falha ao criar categoria.', { cause: error });
  }
}

export async function deleteCategoryForUser(uid: string, categoryId: number) {
  try {
    const result = await db
      .delete(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.userUid, uid)))
      .returning();

    return result[0] || null;
  } catch (error) {
    console.error('Database query failed in deleteCategoryForUser:', error);
    throw new Error('Falha ao excluir categoria.', { cause: error });
  }
}

export async function createItemForUser(
  uid: string,
  categoryId: number,
  title: string
) {
  try {
    const result = await db
      .insert(items)
      .values({
        userUid: uid,
        categoryId,
        title,
        completed: false,
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database query failed in createItemForUser:', error);
    throw new Error('Falha ao adicionar item na categoria.', { cause: error });
  }
}

export async function toggleItemForUser(
  uid: string,
  itemId: number,
  completed: boolean
) {
  try {
    const result = await db
      .update(items)
      .set({ completed })
      .where(and(eq(items.id, itemId), eq(items.userUid, uid)))
      .returning();

    return result[0] || null;
  } catch (error) {
    console.error('Database query failed in toggleItemForUser:', error);
    throw new Error('Falha ao atualizar status do item.', { cause: error });
  }
}

export async function deleteItemForUser(uid: string, itemId: number) {
  try {
    const result = await db
      .delete(items)
      .where(and(eq(items.id, itemId), eq(items.userUid, uid)))
      .returning();

    return result[0] || null;
  } catch (error) {
    console.error('Database query failed in deleteItemForUser:', error);
    throw new Error('Falha ao remover item.', { cause: error });
  }
}

export async function seedInitialCategoriesIfEmpty(uid: string) {
  try {
    const existing = await db
      .select()
      .from(categories)
      .where(eq(categories.userUid, uid));

    if (existing.length > 0) {
      return;
    }

    const insertedCats = await db
      .insert(categories)
      .values([
        {
          userUid: uid,
          name: 'Tarefas do Dia',
          color: 'indigo',
          icon: 'check-circle',
        },
        {
          userUid: uid,
          name: 'Mercado & Casa',
          color: 'emerald',
          icon: 'shopping-bag',
        },
        {
          userUid: uid,
          name: 'Metas & Projetos',
          color: 'amber',
          icon: 'sparkles',
        },
      ])
      .returning();

    if (insertedCats.length >= 3) {
      await db.insert(items).values([
        {
          userUid: uid,
          categoryId: insertedCats[0].id,
          title: 'Revisar arquitetura do projeto Next.js',
          completed: true,
        },
        {
          userUid: uid,
          categoryId: insertedCats[0].id,
          title: 'Validar instalação do PWA no celular',
          completed: false,
        },
        {
          userUid: uid,
          categoryId: insertedCats[1].id,
          title: 'Café especial em grãos 500g',
          completed: false,
        },
        {
          userUid: uid,
          categoryId: insertedCats[1].id,
          title: 'Azeite de oliva extra virgem',
          completed: true,
        },
        {
          userUid: uid,
          categoryId: insertedCats[2].id,
          title: 'Publicar versão 1.0 na Vercel',
          completed: false,
        },
      ]);
    }
  } catch (error) {
    console.error('Database query failed in seedInitialCategoriesIfEmpty:', error);
  }
}
