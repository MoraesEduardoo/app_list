'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
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

const DEFAULT_DEMO_CATEGORIES: CategoryWithItems[] = [
  {
    id: 1,
    name: 'Tarefas do Dia',
    color: 'indigo',
    icon: 'check-circle',
    createdAt: new Date().toISOString(),
    items: [
      {
        id: 101,
        categoryId: 1,
        title: 'Revisar arquitetura do projeto Next.js App Router',
        completed: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 102,
        categoryId: 1,
        title: 'Testar animações de conclusão com Framer Motion',
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 103,
        categoryId: 1,
        title: 'Validar instalação do PWA na tela inicial do celular',
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 2,
    name: 'Compras & Mercado',
    color: 'emerald',
    icon: 'shopping-bag',
    createdAt: new Date().toISOString(),
    items: [
      {
        id: 201,
        categoryId: 2,
        title: 'Café especial em grãos 500g',
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 202,
        categoryId: 2,
        title: 'Azeite de oliva extra virgem',
        completed: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 203,
        categoryId: 2,
        title: 'Castanhas-do-pará e amêndoas',
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 3,
    name: 'Metas & Lançamento',
    color: 'amber',
    icon: 'sparkles',
    createdAt: new Date().toISOString(),
    items: [
      {
        id: 301,
        categoryId: 3,
        title: 'Configurar Row Level Security (RLS) no banco PostgreSQL',
        completed: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 302,
        categoryId: 3,
        title: 'Publicar versão 1.0 em produção na Vercel',
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ],
  },
];

interface AppContextValue {
  user: User | null;
  authLoading: boolean;
  dataLoading: boolean;
  errorBanner: string | null;
  clearError: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  categories: CategoryWithItems[];
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  createCategory: (name: string, color: string, icon: string) => Promise<void>;
  deleteCategory: (categoryId: number) => Promise<void>;
  addItem: (categoryId: number, title: string) => Promise<void>;
  toggleItem: (categoryId: number, itemId: number, completed: boolean) => Promise<void>;
  deleteItem: (categoryId: number, itemId: number) => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const LOCAL_STORAGE_CATEGORIES_KEY = 'applist_pwa_categories_v2';
const LOCAL_STORAGE_THEME_KEY = 'applist_pwa_theme_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [categories, setCategories] = useState<CategoryWithItems[]>(DEFAULT_DEMO_CATEGORIES);

  // Inicializar Tema Dark/Light
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY) as 'light' | 'dark' | null;
      const initialTheme = savedTheme || 'dark';
      setTheme(initialTheme);
      document.documentElement.classList.toggle('dark', initialTheme === 'dark');
    } catch {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(LOCAL_STORAGE_THEME_KEY, next);
      } catch {}
      document.documentElement.classList.toggle('dark', next === 'dark');
      return next;
    });
  }, []);

  // Monitorar Autenticação Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          setIdToken(token);
        } catch {
          setIdToken(null);
        }
      } else {
        setIdToken(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Carregar Categorias (Cloud SQL quando autenticado, ou Cache Local para uso imediato/offline)
  useEffect(() => {
    let active = true;

    async function loadData() {
      if (authLoading) return;
      setDataLoading(true);

      if (user && idToken) {
        try {
          const token = await user.getIdToken();
          const res = await fetch('/api/categories', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            if (active && Array.isArray(data.categories)) {
              setCategories(data.categories);
              try {
                localStorage.setItem(
                  LOCAL_STORAGE_CATEGORIES_KEY,
                  JSON.stringify(data.categories)
                );
              } catch {}
            }
          } else {
            throw new Error('Falha ao carregar categorias do servidor.');
          }
        } catch (err) {
          console.error('Erro ao buscar categorias:', err);
          if (active) {
            setErrorBanner('Usando cache local temporariamente.');
          }
        } finally {
          if (active) setDataLoading(false);
        }
      } else {
        try {
          const saved = localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0 && active) {
              setCategories(parsed);
            }
          }
        } catch {}
        if (active) setDataLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [user, idToken, authLoading]);

  const persistLocal = (nextCategories: CategoryWithItems[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(nextCategories));
    } catch {}
  };

  const signInWithGoogle = async () => {
    setErrorBanner(null);
    try {
      const cred = await signInWithPopup(auth, googleAuthProvider);
      const token = await cred.user.getIdToken();
      setIdToken(token);
    } catch (error: unknown) {
      console.error('Erro no login Google:', error);
      setErrorBanner(
        'Não foi possível concluir o login com Google na janela popup. Você pode continuar utilizando o app normalmente.'
      );
    }
  };

  const signOutUser = async () => {
    setErrorBanner(null);
    try {
      await signOut(auth);
      setIdToken(null);
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const createCategory = async (name: string, color: string, icon: string) => {
    setErrorBanner(null);
    if (user) {
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, color, icon }),
        });
        if (!res.ok) throw new Error('Falha ao criar categoria');
        const { category } = await res.json();
        setCategories((prev) => {
          const next = [...prev, category];
          persistLocal(next);
          return next;
        });
        return;
      } catch (err) {
        console.error(err);
        setErrorBanner('Não foi possível sincronizar no servidor. Salvo localmente.');
      }
    }

    const fallbackCat: CategoryWithItems = {
      id: Date.now(),
      name,
      color,
      icon,
      createdAt: new Date().toISOString(),
      items: [],
    };
    setCategories((prev) => {
      const next = [...prev, fallbackCat];
      persistLocal(next);
      return next;
    });
  };

  const deleteCategory = async (categoryId: number) => {
    setErrorBanner(null);
    const previous = categories;
    setCategories((prev) => {
      const next = prev.filter((c) => c.id !== categoryId);
      persistLocal(next);
      return next;
    });

    if (user) {
      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/categories/${categoryId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Erro ao excluir categoria');
      } catch (err) {
        console.error(err);
        setCategories(previous);
        setErrorBanner('Erro ao remover categoria no banco de dados.');
      }
    }
  };

  const addItem = async (categoryId: number, title: string) => {
    setErrorBanner(null);
    if (user) {
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ categoryId, title }),
        });
        if (!res.ok) throw new Error('Erro ao criar item');
        const { item } = await res.json();
        setCategories((prev) => {
          const next = prev.map((cat) =>
            cat.id === categoryId ? { ...cat, items: [item, ...cat.items] } : cat
          );
          persistLocal(next);
          return next;
        });
        return;
      } catch (err) {
        console.error(err);
      }
    }

    const newItem: ListItem = {
      id: Date.now(),
      categoryId,
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setCategories((prev) => {
      const next = prev.map((cat) =>
        cat.id === categoryId ? { ...cat, items: [newItem, ...cat.items] } : cat
      );
      persistLocal(next);
      return next;
    });
  };

  const toggleItem = async (categoryId: number, itemId: number, completed: boolean) => {
    setErrorBanner(null);
    setCategories((prev) => {
      const next = prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        const updatedItems = cat.items.map((item) =>
          item.id === itemId ? { ...item, completed } : item
        );
        return { ...cat, items: updatedItems };
      });
      persistLocal(next);
      return next;
    });

    if (user) {
      try {
        const token = await user.getIdToken();
        await fetch(`/api/items/${itemId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ completed }),
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const deleteItem = async (categoryId: number, itemId: number) => {
    setErrorBanner(null);
    setCategories((prev) => {
      const next = prev.map((cat) =>
        cat.id === categoryId
          ? { ...cat, items: cat.items.filter((item) => item.id !== itemId) }
          : cat
      );
      persistLocal(next);
      return next;
    });

    if (user) {
      try {
        const token = await user.getIdToken();
        await fetch(`/api/items/${itemId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.error(err);
      }
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
        signOutUser,
        createCategory,
        deleteCategory,
        addItem,
        toggleItem,
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
