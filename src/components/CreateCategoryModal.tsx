'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { CATEGORY_COLORS, CategoryColorKey, cn } from '../lib/utils.ts';
import { CATEGORY_ICONS } from './CategoryCard.tsx';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, color: string, icon: string) => Promise<void>;
}

const ICON_OPTIONS = [
  { key: 'check-circle', label: 'Tarefas' },
  { key: 'shopping-bag', label: 'Compras' },
  { key: 'sparkles', label: 'Metas' },
  { key: 'briefcase', label: 'Trabalho' },
  { key: 'heart', label: 'Saúde' },
  { key: 'home', label: 'Casa' },
  { key: 'book', label: 'Estudos' },
  { key: 'plane', label: 'Viagem' },
];

export const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState<CategoryColorKey>('indigo');
  const [selectedIcon, setSelectedIcon] = useState<string>('check-circle');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    try {
      await onCreate(trimmed, selectedColor, selectedIcon);
      setName('');
      setSelectedColor('indigo');
      setSelectedIcon('check-circle');
      onClose();
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
            className="w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-2xl"
          >
            {/* Grab Handle Mobile */}
            <div className="sm:hidden w-10 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Nova Categoria
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Personalize o nome, o ícone e a cor de destaque da lista.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar modal"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Compras da Semana, Projeto App..."
                  className="w-full min-h-[44px] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-300 transition-colors"
                />
              </div>

              {/* Seleção de Cor Dinâmica */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Cor de Destaque
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(Object.keys(CATEGORY_COLORS) as CategoryColorKey[]).map((colorKey) => {
                    const c = CATEGORY_COLORS[colorKey];
                    const active = selectedColor === colorKey;
                    return (
                      <button
                        key={colorKey}
                        type="button"
                        onClick={() => setSelectedColor(colorKey)}
                        className={cn(
                          'min-h-[44px] flex flex-col items-center justify-center gap-1 rounded-2xl border transition-all cursor-pointer',
                          active
                            ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100/80 dark:bg-zinc-800/80'
                            : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                        )}
                      >
                        <span className={cn('w-4 h-4 rounded-full flex items-center justify-center', c.dot)}>
                          {active && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                        </span>
                        <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                          {c.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Seleção de Ícone */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Ícone da Lista
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {ICON_OPTIONS.map((opt) => {
                    const Icon = CATEGORY_ICONS[opt.key];
                    const active = selectedIcon === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setSelectedIcon(opt.key)}
                        className={cn(
                          'min-h-[48px] flex flex-col items-center justify-center gap-1 rounded-2xl border p-2 text-xs transition-all cursor-pointer',
                          active
                            ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[11px]">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[44px] px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!name.trim() || loading}
                  className="min-h-[44px] px-5 py-2 text-xs font-semibold text-white dark:text-zinc-900 bg-zinc-900 dark:bg-zinc-100 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer"
                >
                  {loading ? 'Criando...' : 'Criar Categoria'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
