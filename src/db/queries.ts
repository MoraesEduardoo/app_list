import { db } from './index.ts';
import { users, categories, items } from './schema.ts';
import { eq, and, asc } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, displayName?: string | null) {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const result = await db
      .insert(users)
      .values({
        uid,
        email: normalizedEmail,
        displayName: displayName || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: normalizedEmail,
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

export async function findUserByEmail(email: string) {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail));
    return result[0] || null;
  } catch (error) {
    console.error('Database query failed in findUserByEmail:', error);
    throw new Error('Falha ao buscar usuário.', { cause: error });
  }
}

export async function findUserByUid(uid: string) {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.uid, uid));
    return result[0] || null;
  } catch (error) {
    console.error('Database query failed in findUserByUid:', error);
    throw new Error('Falha ao buscar sessão de usuário.', { cause: error });
  }
}

export async function createEmailUser(
  uid: string,
  email: string,
  passwordHash: string,
  displayName?: string | null
) {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const result = await db
      .insert(users)
      .values({
        uid,
        email: normalizedEmail,
        passwordHash,
        displayName: displayName || normalizedEmail.split('@')[0],
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed in createEmailUser:', error);
    throw new Error('Falha ao cadastrar novo usuário.', { cause: error });
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
      .orderBy(asc(items.completed), asc(items.createdAt));

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

export async function updateCategoryForUser(
  uid: string,
  categoryId: number,
  updates: { name: string; color: string; icon: string }
) {
  try {
    const result = await db
      .update(categories)
      .set({
        name: updates.name,
        color: updates.color,
        icon: updates.icon,
      })
      .where(and(eq(categories.id, categoryId), eq(categories.userUid, uid)))
      .returning();

    return result[0] || null;
  } catch (error) {
    console.error('Database query failed in updateCategoryForUser:', error);
    throw new Error('Falha ao atualizar categoria.', { cause: error });
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

export async function updateItemForUser(
  uid: string,
  itemId: number,
  updates: { completed?: boolean; title?: string }
) {
  try {
    const payload: Partial<{ completed: boolean; title: string }> = {};
    if (typeof updates.completed === 'boolean') {
      payload.completed = updates.completed;
    }
    if (typeof updates.title === 'string' && updates.title.trim()) {
      payload.title = updates.title.trim();
    }

    const result = await db
      .update(items)
      .set(payload)
      .where(and(eq(items.id, itemId), eq(items.userUid, uid)))
      .returning();

    return result[0] || null;
  } catch (error) {
    console.error('Database query failed in updateItemForUser:', error);
    throw new Error('Falha ao atualizar item.', { cause: error });
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
