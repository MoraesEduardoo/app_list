'use client';

import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search,
  Sun,
  Moon,
  LogOut,
  X,
  LayoutGrid,
  CheckCircle2,
  Clock,
  Loader2,
  FolderPlus,
} from 'lucide-react';
import { useApp, CategoryWithItems } from '../../src/context/AppContext.tsx';
import { Header } from '../../src/components/Header.tsx';
import { CategoryCard } from '../../src/components/CategoryCard.tsx';
import { CreateCategoryModal } from '../../src/components/CreateCategoryModal.tsx';
import { PWAInstallButton } from '../../src/components/PWAInstallButton.tsx';
import { OfflineIndicator } from '../../src/components/OfflineIndicator.tsx';
import LoginPage from '../login/page.tsx';

export default function DashboardPage() {
  const {
    user,
    authLoading,
    dataLoading,
    errorBanner,
    clearError,
    theme,
    toggleTheme,
    categories,
    signOutUser,
    createCategory,
    updateCategory,
    deleteCategory,
    addItem,
    toggleItem,
    updateItemTitle,
    deleteItem,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<'all' | 'pending' | 'completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithItems | null>(null);

  const metrics = useMemo(() => {
    const totalCategories = categories.length;
    const allItems = categories.flatMap((c) => c.items);
    const totalItems = allItems.length;
    const completedItems = allItems.filter((i) => i.completed).length;
    const pendingItems = totalItems - completedItems;
    const completionRate =
      totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return {
      totalCategories,
      totalItems,
      completedItems,
      pendingItems,
      completionRate,
    };
  }, [categories]);

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      if (activeSection === 'pending') {
        const hasPending = cat.items.some((i) => !i.completed) || cat.items.length === 0;
        if (!hasPending) return false;
      } else if (activeSection === 'completed') {
        const allDone = cat.items.length > 0 && cat.items.every((i) => i.completed);
        if (!allDone) return false;
      }

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = cat.name.toLowerCase().includes(q);
        const matchItems = cat.items.some((i) => i.title.toLowerCase().includes(q));
        return matchName || matchItems;
      }

      return true;
    });
  }, [categories, activeSection, searchQuery]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-500">
        <div className="flex items-center gap-2.5 text-xs font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
          <span>Verificando sessão segura em nuvem...</span>
        </div>
      </div>
    );
  }

  // Proteção de rota privada: exige autenticação real em nuvem
  if (!user) {
    return <LoginPage />;
  }

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category: CategoryWithItems) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (
    name: string,
    color: string,
    icon: string,
    categoryId?: number
  ) => {
    if (categoryId) {
      await updateCategory(categoryId, name, color, icon);
    } else {
      await createCategory(name, color, icon);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-20 md:pb-12">
      {/* Ponto de acesso único no Header para navegação e criação de categoria */}
      <Header
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        onOpenNewCategory={handleOpenCreateModal}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {errorBanner && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-700 dark:text-rose-300">
            <span>{errorBanner}</span>
            <button
              type="button"
              onClick={clearError}
              className="p-1 hover:opacity-75 cursor-pointer"
              aria-label="Fechar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Cabeçalho do Painel + Utilitários Únicos (PWA, Tema, Logout) */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Sincronizado em Nuvem · {user.email}
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 text-balance">
              Suas Listas por Categoria
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <PWAInstallButton />

            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Alternar tema claro ou escuro"
              className="min-h-[40px] inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-zinc-700" />
                  <span>Modo Escuro</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={signOutUser}
              className="min-h-[40px] inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>

        {/* Faixa de Resumo Quantitativo (Tabular Numerals) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Categorias</div>
            <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
              {metrics.totalCategories}
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Concluídos</div>
            <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              {metrics.completedItems}
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Pendentes</div>
            <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
              {metrics.pendingItems}
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Conclusão</div>
            <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
              {metrics.completionRate}%
            </div>
          </div>
        </div>

        {/* Campo de Busca Rápida (Sem duplicar botões já existentes no Header) */}
        {categories.length > 0 && (
          <div className="py-5 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar categorias ou itens pelo nome..."
                className="w-full min-h-[44px] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-10 pr-9 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Limpar busca"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Loading Skeletons / Empty State / Grid de Categorias */}
        {dataLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-72 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/50 p-6 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                </div>
                <div className="mt-6 h-10 w-full rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
                <div className="mt-4 space-y-3">
                  <div className="h-8 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-8 w-4/5 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-12 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/60 p-12 text-center max-w-lg mx-auto"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <FolderPlus className="w-6 h-6" />
            </div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {categories.length === 0
                ? 'Você ainda não criou nenhuma categoria'
                : 'Nenhum resultado para o filtro atual'}
            </h2>
            <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {categories.length === 0
                ? 'Use o botão "Nova Categoria" no topo da tela para criar sua primeira lista personalizada com 15 cores e 15 ícones.'
                : 'Altere os termos da busca ou selecione outra aba de visualização.'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start py-2">
            <AnimatePresence initial={false}>
              {filteredCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onEditCategory={handleOpenEditModal}
                  onDeleteCategory={deleteCategory}
                  onAddItem={addItem}
                  onToggleItem={toggleItem}
                  onUpdateItemTitle={updateItemTitle}
                  onDeleteItem={deleteItem}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Navegação Inferior Exclusiva para Telas Mobile (md:hidden) */}
      <nav
        aria-label="Filtro Mobile"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-3 items-center h-14 px-2"
      >
        <button
          type="button"
          onClick={() => setActiveSection('all')}
          className={`min-h-[44px] flex flex-col items-center justify-center cursor-pointer ${
            activeSection === 'all'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Todas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('pending')}
          className={`min-h-[44px] flex flex-col items-center justify-center cursor-pointer ${
            activeSection === 'pending'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Pendentes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('completed')}
          className={`min-h-[44px] flex flex-col items-center justify-center cursor-pointer ${
            activeSection === 'completed'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Concluídas</span>
        </button>
      </nav>

      <CreateCategoryModal
        isOpen={isModalOpen}
        editingCategory={editingCategory}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
      />

      <OfflineIndicator />
    </div>
  );
}
