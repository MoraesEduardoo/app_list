'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search,
  Sun,
  Moon,
  Plus,
  LogOut,
  LogIn,
  X,
  LayoutGrid,
  CheckCircle2,
  Clock,
  User as UserIcon,
} from 'lucide-react';
import { useApp } from '../../src/context/AppContext.tsx';
import { Header } from '../../src/components/Header.tsx';
import { CategoryCard } from '../../src/components/CategoryCard.tsx';
import { CreateCategoryModal } from '../../src/components/CreateCategoryModal.tsx';
import { PWAInstallButton } from '../../src/components/PWAInstallButton.tsx';
import { OfflineIndicator } from '../../src/components/OfflineIndicator.tsx';

export default function DashboardPage() {
  const {
    user,
    dataLoading,
    errorBanner,
    clearError,
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
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<'all' | 'pending' | 'completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-20 md:pb-12">
      <Header
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        onOpenNewCategory={() => setIsModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {/* Banner de Alerta Sutil se houver aviso */}
        {errorBanner && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-800 dark:text-amber-300">
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

        {/* Cabeçalho do Workspace + Barra de Utilitários (Tema, PWA, Conta) */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Organização Pessoal · Sincronização em Tempo Real
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 text-balance">
              Suas Listas por Categoria
            </h1>
          </div>

          {/* Controles Secundários do Workspace */}
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

            {user ? (
              <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-3 pr-2 py-1.5 text-xs">
                <span className="text-zinc-700 dark:text-zinc-300 font-medium truncate max-w-[140px]">
                  {user.displayName || user.email}
                </span>
                <button
                  type="button"
                  onClick={signOutUser}
                  title="Sair da conta"
                  className="min-h-[28px] px-2 rounded-lg text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={signInWithGoogle}
                className="min-h-[40px] inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-500" />
                <span>Sincronizar Conta</span>
              </button>
            )}
          </div>
        </div>

        {/* Faixa de Métricas com Tabular Numerals */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Categorias Ativas</div>
            <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
              {metrics.totalCategories}
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Itens Concluídos</div>
            <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              {metrics.completedItems}
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Itens Pendentes</div>
            <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
              {metrics.pendingItems}
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Progresso Geral</div>
            <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
              {metrics.completionRate}%
            </div>
          </div>
        </div>

        {/* Barra de Busca e Filtros Interativos */}
        <div className="py-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar categorias ou itens..."
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

          {/* Controle Segmentado de Filtro */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-zinc-200/70 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 self-start sm:self-auto">
            {(
              [
                { id: 'all', label: 'Todas' },
                { id: 'pending', label: 'Com Pendências' },
                { id: 'completed', label: 'Concluídas' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={`min-h-[36px] px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeSection === tab.id
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Estado de Carregamento (Skeleton) ou Grid de Categorias */}
        {dataLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-72 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/50 p-6 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                </div>
                <div className="mt-6 h-10 w-full rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
                <div className="mt-4 space-y-3">
                  <div className="h-8 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-8 w-5/6 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/60 p-12 text-center max-w-lg mx-auto"
          >
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Nenhuma lista encontrada
            </h2>
            <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              Crie uma nova categoria personalizada ou limpe os filtros atuais para visualizar seus itens.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              {(searchQuery || activeSection !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveSection('all');
                  }}
                  className="min-h-[44px] px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  Limpar Filtros
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white dark:text-zinc-900 bg-zinc-900 dark:bg-zinc-100 rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Primeira Categoria</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start py-2">
            <AnimatePresence initial={false}>
              {filteredCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onAddItem={addItem}
                  onToggleItem={toggleItem}
                  onDeleteItem={deleteItem}
                  onDeleteCategory={deleteCategory}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Barra Inferior Flutuante para Mobile (Natural Thumb Zone, <= 15% cap) */}
      <nav
        aria-label="Navegação Mobile"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-4 items-center h-14 px-2"
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

        <Link
          href="/login"
          className="min-h-[44px] flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400"
        >
          <UserIcon className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Conta</span>
        </Link>
      </nav>

      <CreateCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={createCategory}
      />

      <OfflineIndicator />
    </div>
  );
}
