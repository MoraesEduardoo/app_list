'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';

export interface ListItem {
  id: number;
  categoryId: number;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface CategoryWithItems {
  id: number;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
  items: ListItem[];
}

export interface SessionUser {
  uid: string;
  email: string;
  displayName?: string | null;
}

interface AppContextValue {
  user: SessionUser | null;
  authLoading: boolean;
  dataLoading: boolean;
  errorBanner: string | null;
  clearError: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  categories: CategoryWithItems[];
  signInWithGoogle: () => Promise<boolean>;
  loginWithEmail: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signupWithEmail: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signOutUser: () => Promise<void>;
  createCategory: (name: string, color: string, icon: string) => Promise<void>;
  updateCategory: (categoryId: number, name: string, color: string, icon: string) => Promise<void>;
  deleteCategory: (categoryId: number) => Promise<void>;
  addItem: (categoryId: number, title: string) => Promise<void>;
  toggleItem: (categoryId: number, itemId: number, completed: boolean) => Promise<void>;
  updateItemTitle: (categoryId: number, itemId: number, title: string) => Promise<void>;
  deleteItem: (categoryId: number, itemId: number) => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [bearerToken, setBearerToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  // Sem mocks e sem localStorage para dados de listas: 100% sincronizado via nuvem PostgreSQL
  const [categories, setCategories] = useState<CategoryWithItems[]>([]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', next === 'dark');
      return next;
    });
  }, []);

  // Verificar sessão existente (Cookie HTTP-only de sessão PostgreSQL ou Firebase Auth)
  useEffect(() => {
    let mounted = true;

    async function checkExistingSession() {
      try {
        const res = await fetch('/api/auth', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (mounted && data.user) {
            setUser({
              uid: data.user.uid,
              email: data.user.email,
              displayName: data.user.name,
            });
            setAuthLoading(false);
            return;
          }
        }
      } catch {
        // Ignorar erro inicial de rede
      }

      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!mounted) return;
        if (firebaseUser) {
          try {
            const token = await firebaseUser.getIdToken();
            setBearerToken(token);
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || `${firebaseUser.uid}@user.local`,
              displayName: firebaseUser.displayName,
            });
          } catch {
            setBearerToken(null);
            setUser(null);
          }
        }
        setAuthLoading(false);
      });

      return () => unsubscribe();
    }

    checkExistingSession();
    return () => {
      mounted = false;
    };
  }, []);

  const getAuthHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (auth.currentUser) {
      const freshToken = await auth.currentUser.getIdToken();
      headers.Authorization = `Bearer ${freshToken}`;
    } else if (bearerToken) {
      headers.Authorization = `Bearer ${bearerToken}`;
    }
    return headers;
  }, [bearerToken]);

  // Carregar Categorias e Itens diretamente do PostgreSQL em nuvem
  useEffect(() => {
    let active = true;

    async function fetchCloudCategories() {
      if (authLoading) return;
      if (!user) {
        setCategories([]);
        setDataLoading(false);
        return;
      }

      setDataLoading(true);
      try {
        const headers = await getAuthHeaders();
        const res = await fetch('/api/categories', {
          headers,
          credentials: 'include',
        });
        if (!res.ok) {
          throw new Error('Não foi possível sincronizar suas listas com o servidor.');
        }
        const data = await res.json();
        if (active && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      } catch (err: unknown) {
        if (active) {
          const msg = err instanceof Error ? err.message : 'Erro ao carregar listas.';
          setErrorBanner(msg);
        }
      } finally {
        if (active) setDataLoading(false);
      }
    }

    fetchCloudCategories();
    return () => {
      active = false;
    };
  }, [user, authLoading, getAuthHeaders]);

  const signInWithGoogle = async (): Promise<boolean> => {
    setErrorBanner(null);
    try {
      const cred = await signInWithPopup(auth, googleAuthProvider);
      const token = await cred.user.getIdToken();
      setBearerToken(token);
      setUser({
        uid: cred.user.uid,
        email: cred.user.email || `${cred.user.uid}@user.local`,
        displayName: cred.user.displayName,
      });
      return true;
    } catch (error: unknown) {
      console.error('Erro no login Google:', error);
      setErrorBanner('Popup bloqueado ou cancelado. Utilize o login por E-mail e Senha abaixo.');
      return false;
    }
  };

  const loginWithEmail = async (
    email: string,
    password: string
  ): Promise<{ ok: boolean; error?: string }> => {
    setErrorBanner(null);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'login', email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || 'Falha ao autenticar.' };
      }
      setBearerToken(data.token);
      setUser({
        uid: data.user.uid,
        email: data.user.email,
        displayName: data.user.name,
      });
      return { ok: true };
    } catch {
      return { ok: false, error: 'Erro de conexão com o servidor.' };
    }
  };

  const signupWithEmail = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ ok: boolean; error?: string }> => {
    setErrorBanner(null);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'signup', name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || 'Não foi possível criar a conta.' };
      }
      setBearerToken(data.token);
      setUser({
        uid: data.user.uid,
        email: data.user.email,
        displayName: data.user.name,
      });
      return { ok: true };
    } catch {
      return { ok: false, error: 'Erro de conexão com o servidor.' };
    }
  };

  const signOutUser = async () => {
    setErrorBanner(null);
    try {
      await fetch('/api/auth', { method: 'DELETE', credentials: 'include' });
      await signOut(auth).catch(() => {});
      setBearerToken(null);
      setUser(null);
      setCategories([]);
    } catch (error) {
      console.error('Erro ao encerrar sessão:', error);
    }
  };

  const createCategory = async (name: string, color: string, icon: string) => {
    setErrorBanner(null);
    const headers = await getAuthHeaders();
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ name, color, icon }),
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data.error || 'Erro ao criar categoria no servidor.';
      setErrorBanner(msg);
      throw new Error(msg);
    }
    setCategories((prev) => [...prev, data.category]);
  };

  const updateCategory = async (
    categoryId: number,
    name: string,
    color: string,
    icon: string
  ) => {
    setErrorBanner(null);
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/categories/${categoryId}`, {
      method: 'PATCH',
      headers,
      credentials: 'include',
      body: JSON.stringify({ name, color, icon }),
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data.error || 'Erro ao atualizar categoria.';
      setErrorBanner(msg);
      throw new Error(msg);
    }
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              name: data.category.name,
              color: data.category.color,
              icon: data.category.icon,
            }
          : cat
      )
    );
  };

  const deleteCategory = async (categoryId: number) => {
    setErrorBanner(null);
    const previous = categories;
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Falha ao excluir categoria no banco de dados.');
    } catch (err: unknown) {
      setCategories(previous);
      setErrorBanner(err instanceof Error ? err.message : 'Erro ao excluir categoria.');
    }
  };

  const addItem = async (categoryId: number, title: string) => {
    setErrorBanner(null);
    const headers = await getAuthHeaders();
    const res = await fetch('/api/items', {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ categoryId, title }),
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data.error || 'Erro ao adicionar item.';
      setErrorBanner(msg);
      throw new Error(msg);
    }
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, items: [data.item, ...cat.items] } : cat
      )
    );
  };

  const toggleItem = async (categoryId: number, itemId: number, completed: boolean) => {
    setErrorBanner(null);
    const previous = categories;
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map((item) =>
                item.id === itemId ? { ...item, completed } : item
              ),
            }
          : cat
      )
    );

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify({ completed }),
      });
      if (!res.ok) throw new Error('Falha ao sincronizar status do item.');
    } catch (err: unknown) {
      setCategories(previous);
      setErrorBanner(err instanceof Error ? err.message : 'Erro ao atualizar item.');
    }
  };

  const updateItemTitle = async (categoryId: number, itemId: number, title: string) => {
    setErrorBanner(null);
    const trimmed = title.trim();
    if (!trimmed) return;

    const previous = categories;
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map((item) =>
                item.id === itemId ? { ...item, title: trimmed } : item
              ),
            }
          : cat
      )
    );

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify({ title: trimmed }),
      });
      if (!res.ok) throw new Error('Falha ao atualizar título do item.');
    } catch (err: unknown) {
      setCategories(previous);
      setErrorBanner(err instanceof Error ? err.message : 'Erro ao editar item.');
    }
  };

  const deleteItem = async (categoryId: number, itemId: number) => {
    setErrorBanner(null);
    const previous = categories;
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? { ...cat, items: cat.items.filter((item) => item.id !== itemId) }
          : cat
      )
    );

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Falha ao remover item do banco de dados.');
    } catch (err: unknown) {
      setCategories(previous);
      setErrorBanner(err instanceof Error ? err.message : 'Erro ao remover item.');
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        authLoading,
        dataLoading,
        errorBanner,
        clearError: () => setErrorBanner(null),
        theme,
        toggleTheme,
        categories,
        signInWithGoogle,
        loginWithEmail,
        signupWithEmail,
        signOutUser,
        createCategory,
        updateCategory,
        deleteCategory,
        addItem,
        toggleItem,
        updateItemTitle,
        deleteItem,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return ctx;
}
