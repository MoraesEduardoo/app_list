'use client';

import React, { useState, useRef } from 'react';
import { Plus, CornerDownLeft } from 'lucide-react';
import { cn, CategoryColorTheme } from '../lib/utils.ts';

interface QuickAddInputProps {
  categoryId: number;
  categoryName: string;
  themeColor: CategoryColorTheme;
  onAdd: (categoryId: number, title: string) => Promise<void>;
}

export const QuickAddInput: React.FC<QuickAddInputProps> = ({
  categoryId,
  categoryName,
  themeColor,
  onAdd,
}) => {
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    // Limpa imediatamente e mantém o foco ativo para não fechar o teclado no celular
    setTitle('');
    inputRef.current?.focus();

    void onAdd(categoryId, trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center">
      <input
        ref={inputRef}
        type="text"
        enterKeyHint="done"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={`Adicionar em ${categoryName}...`}
        aria-label={`Adicionar novo item em ${categoryName}`}
        className="w-full min-h-[46px] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/70 pl-4 pr-20 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
      />

      <div className="absolute right-1.5 flex items-center gap-1">
        {title.trim().length > 0 && (
          <span
            aria-hidden="true"
            className="hidden sm:inline-flex items-center text-[10px] font-mono text-zinc-400 dark:text-zinc-500 px-1.5"
          >
            <CornerDownLeft className="w-3 h-3 mr-0.5" />
            Enter
          </span>
        )}
        <button
          type="submit"
          onMouseDown={(e) => {
            // Impede que o clique no botão roube o foco do input no mobile/desktop
            e.preventDefault();
          }}
          disabled={!title.trim()}
          aria-label="Salvar novo item"
          className={cn(
            'min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl text-white transition-all cursor-pointer active:scale-95 disabled:opacity-30',
            themeColor.progressFill
          )}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};
