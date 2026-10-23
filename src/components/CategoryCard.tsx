'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  ShoppingBag,
  Sparkles,
  Briefcase,
  Heart,
  Home,
  BookOpen,
  Plane,
  Folder,
  Plus,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { CategoryWithItems } from '../context/AppContext.tsx';
import { getCategoryColorTheme, cn } from '../lib/utils.ts';
import { ItemRow } from './ItemRow.tsx';

export const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'check-circle': CheckCircle2,
  'shopping-bag': ShoppingBag,
  sparkles: Sparkles,
  briefcase: Briefcase,
  heart: Heart,
  home: Home,
  book: BookOpen,
  plane: Plane,
  folder: Folder,
};

interface CategoryCardProps {
  category: CategoryWithItems;
  onAddItem: (categoryId: number, title: string) => Promise<void>;
  onToggleItem: (categoryId: number, itemId: number, completed: boolean) => Promise<void>;
  onDeleteItem: (categoryId: number, itemId: number) => Promise<void>;
  onDeleteCategory: (categoryId: number) => Promise<void>;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onAddItem,
  onToggleItem,
  onDeleteItem,
  onDeleteCategory,
}) => {
  const [newItemTitle, setNewItemTitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const themeColor = getCategoryColorTheme(category.color);
  const IconComponent = CATEGORY_ICONS[category.icon] || Folder;

  const totalItems = category.items.length;
  const completedItems = category.items.filter((i) => i.completed).length;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newItemTitle.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setNewItemTitle('');
    try {
      await onAddItem(category.id, trimmed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'flex flex-col rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/85 backdrop-blur-md p-5 sm:p-6 shadow-xs transition-colors',
        themeColor.borderAccent
      )}
    >
      {/* Cabeçalho do Card */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={cn(
              'w-11 h-11 rounded-2xl flex items-center justify-center shrink-0',
              themeColor.softBg,
              themeColor.iconText
            )}
          >
            <IconComponent className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
              {category.name}
            </h2>
            {/* Metadados limpos sem pílulas (Zero-Pill Discipline + Tabular Numerals) */}
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-mono tabular-nums">
              <span>
                {completedItems} de {totalItems} {totalItems === 1 ? 'item' : 'itens'}
              </span>
              <span aria-hidden="true">·</span>
              <span>{progressPercent}% concluído</span>
            </div>
          </div>
        </div>

        {/* Controles do Card (Expandir / Excluir com confirmação fluida) */}
        <div className="flex items-center gap-1 shrink-0">
          {confirmDelete ? (
            <div className="flex items-center gap-1 bg-rose-500/10 rounded-xl px-2 py-1">
              <button
                type="button"
                onClick={() => onDeleteCategory(category.id)}
                className="min-h-[36px] px-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer whitespace-nowrap"
              >
                Excluir
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="min-h-[36px] px-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer whitespace-nowrap"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                aria-label={`Excluir categoria ${category.name}`}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                aria-label={isExpanded ? 'Recolher lista' : 'Expandir lista'}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <ChevronDown
                  className={cn(
                    'w-4 h-4 transition-transform duration-200',
                    !isExpanded && '-rotate-90'
                  )}
                />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Barra de Progresso Sutil */}
      <div className="mt-4 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <motion.div
          initial={false}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={cn('h-full rounded-full', themeColor.progressFill)}
        />
      </div>

      {/* Corpo Expansível com Input Rápido e Lista de Itens */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="mt-4 flex-1 flex flex-col"
          >
            {/* Input de Adição Rápida */}
            <form onSubmit={handleAddSubmit} className="relative flex items-center gap-2">
              <input
                type="text"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                placeholder="Adicionar novo item..."
                className="w-full min-h-[44px] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 pl-4 pr-12 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
              />
              <button
                type="submit"
                disabled={!newItemTitle.trim() || submitting}
                aria-label="Adicionar item"
                className={cn(
                  'absolute right-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl text-white transition-opacity cursor-pointer disabled:opacity-30',
                  themeColor.progressFill
                )}
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {/* Lista de Itens */}
            {category.items.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  Nenhum item nesta categoria. Digite acima para adicionar.
                </p>
              </div>
            ) : (
              <ul className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800/60">
                <AnimatePresence initial={false}>
                  {category.items.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      themeColor={themeColor}
                      onToggle={(itemId, completed) =>
                        onToggleItem(category.id, itemId, completed)
                      }
                      onDelete={(itemId) => onDeleteItem(category.id, itemId)}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};
