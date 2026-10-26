'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Trash2, Pencil, X } from 'lucide-react';
import { ListItem } from '../context/AppContext.tsx';
import { cn, CategoryColorTheme } from '../lib/utils.ts';

interface ItemRowProps {
  item: ListItem;
  themeColor: CategoryColorTheme;
  onToggle: (itemId: number, completed: boolean) => Promise<void>;
  onUpdateTitle: (itemId: number, title: string) => Promise<void>;
  onDelete: (itemId: number) => Promise<void>;
}

export const ItemRow: React.FC<ItemRowProps> = ({
  item,
  themeColor,
  onToggle,
  onUpdateTitle,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(item.title);
  const [editError, setEditError] = useState(false);
  const [busy, setBusy] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
    }
  }, [isEditing]);

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draftTitle.trim();
    if (!trimmed) {
      setEditError(true);
      return;
    }
    setEditError(false);
    setIsEditing(false);
    if (trimmed !== item.title) {
      setBusy(true);
      try {
        await onUpdateTitle(item.id, trimmed);
      } finally {
        setBusy(false);
      }
    }
  };

  const handleDeleteClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await onDelete(item.id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="group flex items-center justify-between gap-2 rounded-2xl px-2 py-1 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50 transition-colors"
    >
      {isEditing ? (
        <form onSubmit={handleSaveEdit} className="flex-1 flex items-center gap-1.5 py-1">
          <input
            ref={editInputRef}
            type="text"
            value={draftTitle}
            onChange={(e) => {
              setDraftTitle(e.target.value);
              if (editError) setEditError(false);
            }}
            placeholder={editError ? 'Digite um título válido...' : 'Título do item'}
            className={cn(
              'flex-1 min-h-[38px] rounded-xl border bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none',
              editError
                ? 'border-rose-500 focus:border-rose-500'
                : 'border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-300'
            )}
          />
          <button
            type="submit"
            aria-label="Confirmar edição"
            className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 cursor-pointer"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setDraftTitle(item.title);
              setEditError(false);
            }}
            aria-label="Cancelar edição"
            className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <>
          <button
            type="button"
            disabled={busy}
            onClick={() => onToggle(item.id, !item.completed)}
            className="flex-1 min-h-[44px] flex items-center gap-3 text-left cursor-pointer select-none disabled:opacity-50"
          >
            <span
              className={cn(
                'w-5 h-5 rounded-lg border flex items-center justify-center transition-all duration-150 shrink-0',
                item.completed
                  ? `${themeColor.checkboxActive} text-white`
                  : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 group-hover:border-zinc-400 dark:group-hover:border-zinc-500'
              )}
            >
              <motion.span
                initial={false}
                animate={{
                  scale: item.completed ? 1 : 0,
                  opacity: item.completed ? 1 : 0,
                }}
                transition={{ duration: 0.15 }}
              >
                <Check className="w-3.5 h-3.5 stroke-[2.75]" />
              </motion.span>
            </span>

            <span
              className={cn(
                'text-sm leading-snug transition-all duration-150 break-words',
                item.completed
                  ? 'line-through text-zinc-400 dark:text-zinc-500'
                  : 'text-zinc-800 dark:text-zinc-100 font-medium'
              )}
            >
              {item.title}
            </span>
          </button>

          <div className="flex items-center gap-0.5 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setDraftTitle(item.title);
                setIsEditing(true);
              }}
              aria-label={`Editar ${item.title}`}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleDeleteClick}
              aria-label={`Remover ${item.title}`}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}
    </motion.li>
  );
};
