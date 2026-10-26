'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2 } from 'lucide-react';
import {
  CATEGORY_COLOR_LIST,
  CategoryColorKey,
  cn,
} from '../lib/utils.ts';
import { CATEGORY_ICON_OPTIONS } from './CategoryCard.tsx';
import { CategoryWithItems } from '../context/AppContext.tsx';

interface CreateCategoryModalProps {
  isOpen: boolean;
  editingCategory?: CategoryWithItems | null;
  onClose: () => void;
  onSave: (name: string, color: string, icon: string, categoryId?: number) => Promise<void>;
}

export const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  isOpen,
  editingCategory,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState<CategoryColorKey>('indigo');
  const [selectedIcon, setSelectedIcon] = useState<string>('shopping-cart');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setSelectedColor((editingCategory.color as CategoryColorKey) || 'indigo');
      setSelectedIcon(editingCategory.icon || 'shopping-cart');
    } else {
      setName('');
      setSelectedColor('indigo');
      setSelectedIcon('shopping-cart');
    }
    setValidationError(null);
  }, [editingCategory, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setValidationError('Por favor, informe um nome para a categoria.');
      return;
    }
    if (loading) return;

    setValidationError(null);
    setLoading(true);
    try {
      await onSave(trimmed, selectedColor, selectedIcon, editingCategory?.id);
      onClose();
    } catch (err: unknown) {
      setValidationError(
        err instanceof Error ? err.message : 'Não foi possível salvar a categoria.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-2xl"
          >
            <div className="sm:hidden w-10 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Escolha entre 15 cores de destaque e 15 ícones temáticos.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar modal"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  autoFocus
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="Ex: Compras do Mês, Metas 2026, Trabalho..."
                  className={cn(
                    'w-full min-h-[44px] rounded-2xl border bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none transition-colors',
                    validationError
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-zinc-300'
                  )}
                />
                {validationError && (
                  <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                    {validationError}
                  </p>
                )}
              </div>

              {/* Paleta com Exatamente 15 Cores Distintas */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Cor de Destaque (15 opções)
                  </label>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {CATEGORY_COLOR_LIST.find((c) => c.key === selectedColor)?.label}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {CATEGORY_COLOR_LIST.map((c) => {
                    const active = selectedColor === c.key;
                    return (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => setSelectedColor(c.key)}
                        className={cn(
                          'min-h-[42px] flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-left transition-all cursor-pointer',
                          active
                            ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800 font-semibold'
                            : 'border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                        )}
                      >
                        <span
                          className={cn(
                            'w-4 h-4 rounded-full flex items-center justify-center shrink-0',
                            c.dot
                          )}
                        >
                          {active && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                        </span>
                        <span className="text-[11px] text-zinc-700 dark:text-zinc-300 truncate">
                          {c.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Seleção com Exatamente 15 Ícones Distintos */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Ícone da Categoria (15 opções)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {CATEGORY_ICON_OPTIONS.map((opt) => {
                    const Icon = opt.Icon;
                    const active = selectedIcon === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setSelectedIcon(opt.key)}
                        className={cn(
                          'min-h-[52px] flex flex-col items-center justify-center gap-1 rounded-2xl border p-1.5 text-xs transition-all cursor-pointer',
                          active
                            ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                            : 'border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                        )}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="text-[10px] truncate max-w-full">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ações */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={loading}
                  onClick={onClose}
                  className="min-h-[44px] px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white dark:text-zinc-900 bg-zinc-900 dark:bg-zinc-100 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>
                    {loading
                      ? 'Salvando...'
                      : editingCategory
                      ? 'Salvar Alterações'
                      : 'Criar Categoria'}
                  </span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
