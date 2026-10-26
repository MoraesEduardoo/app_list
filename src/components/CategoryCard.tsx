'use client';

import React, { useState, useMemo } from 'react';
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
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { CategoryWithItems } from '../context/AppContext.tsx';
import { getCategoryColorTheme, cn } from '../lib/utils.ts';
import { ItemRow } from './ItemRow.tsx';
import { QuickAddInput } from './QuickAddInput.tsx';

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
  const [isExpanded, setIsExpanded] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const themeColor = getCategoryColorTheme(category.color);
  const IconComponent = CATEGORY_ICONS[category.icon] || Folder;

  // Ordena automaticamente: itens pendentes no topo, concluídos movem-se suavemente para o fim da lista
  const sortedItems = useMemo(() => {
    return [...category.items].sort((a, b) => {
      if (a.completed === b.completed) return 0;
      return a.completed ? 1 : -1;
    });
  }, [category.items]);

  const totalItems = category.items.length;
  const completedItems = category.items.filter((i) => i.completed).length;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.16 } }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'flex flex-col rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-900/90 backdrop-blur-md p-5 sm:p-6 shadow-xs transition-colors',
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
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-mono tabular-nums">
              <span>
                {completedItems}/{totalItems} {totalItems === 1 ? 'item' : 'itens'}
              </span>
              <span aria-hidden="true">·</span>
              <span>{progressPercent}% concluído</span>
            </div>
          </div>
        </div>

        {/* Exclusão sem fricção com confirmação discreta inline */}
        <div className="flex items-center gap-1 shrink-0">
          {confirmDelete ? (
            <div className="flex items-center gap-1 bg-rose-500/10 rounded-xl px-2 py-1">
              <button
                type="button"
                onClick={() => onDeleteCategory(category.id)}
                className="min-h-[36px] px-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer whitespace-nowrap"
              >
                Confirmar
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="min-h-[36px] px-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer whitespace-nowrap"
              >
                Não
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
                aria-label={isExpanded ? 'Recolher categoria' : 'Expandir categoria'}
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

      {/* Barra de Progresso */}
      <div className="mt-4 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <motion.div
          initial={false}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={cn('h-full rounded-full', themeColor.progressFill)}
        />
      </div>

      {/* Área Expansível com QuickAddInput Sempre Visível + Lista de Itens */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="mt-4 flex-1 flex flex-col"
          >
            <QuickAddInput
              categoryId={category.id}
              categoryName={category.name}
              themeColor={themeColor}
              onAdd={onAddItem}
            />

            {sortedItems.length === 0 ? (
              <div className="py-7 text-center">
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  Lista vazia. Digite acima e pressione Enter para adicionar.
                </p>
              </div>
            ) : (
              <ul className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800/60">
                <AnimatePresence initial={false}>
                  {sortedItems.map((item) => (
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
