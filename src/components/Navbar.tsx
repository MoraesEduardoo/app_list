'use client';

import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

interface NavbarProps {
  activeSection: 'all' | 'pending' | 'completed';
  onSelectSection: (section: 'all' | 'pending' | 'completed') => void;
  onOpenNewCategory: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onSelectSection,
  onOpenNewCategory,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
      {/* Zona 1: Wordmark */}
      <Link
        href="/dashboard"
        onClick={() => onSelectSection('all')}
        className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 whitespace-nowrap shrink-0"
      >
        App List
      </Link>

      {/* Zona 2: Links de Navegação em Linha Única */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-500 dark:text-zinc-400">
        <button
          type="button"
          onClick={() => onSelectSection('all')}
          className={`hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeSection === 'all'
              ? 'text-zinc-900 dark:text-zinc-100 underline underline-offset-8 decoration-2'
              : ''
          }`}
        >
          Todas as Listas
        </button>
        <button
          type="button"
          onClick={() => onSelectSection('pending')}
          className={`hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeSection === 'pending'
              ? 'text-zinc-900 dark:text-zinc-100 underline underline-offset-8 decoration-2'
              : ''
          }`}
        >
          Com Pendências
        </button>
        <button
          type="button"
          onClick={() => onSelectSection('completed')}
          className={`hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeSection === 'completed'
              ? 'text-zinc-900 dark:text-zinc-100 underline underline-offset-8 decoration-2'
              : ''
          }`}
        >
          Concluídas
        </button>
        <Link
          href="/login"
          className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors whitespace-nowrap shrink-0"
        >
          Conta & Acesso
        </Link>
      </nav>

      {/* Zona 3: Ação Principal */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onOpenNewCategory}
          className="min-h-[40px] inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white dark:text-zinc-900 bg-zinc-900 dark:bg-zinc-100 rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Categoria</span>
        </button>
      </div>
    </header>
  );
};
