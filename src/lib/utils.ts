import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type CategoryColorKey = 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet' | 'sky';

export interface CategoryColorTheme {
  key: CategoryColorKey;
  label: string;
  dot: string;
  softBg: string;
  iconText: string;
  borderAccent: string;
  progressFill: string;
  checkboxActive: string;
}

export const CATEGORY_COLORS: Record<CategoryColorKey, CategoryColorTheme> = {
  indigo: {
    key: 'indigo',
    label: 'Índigo',
    dot: 'bg-indigo-500',
    softBg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
    iconText: 'text-indigo-600 dark:text-indigo-400',
    borderAccent: 'hover:border-indigo-300 dark:hover:border-indigo-800/70',
    progressFill: 'bg-indigo-600 dark:bg-indigo-500',
    checkboxActive: 'bg-indigo-600 border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500',
  },
  emerald: {
    key: 'emerald',
    label: 'Esmeralda',
    dot: 'bg-emerald-500',
    softBg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    borderAccent: 'hover:border-emerald-300 dark:hover:border-emerald-800/70',
    progressFill: 'bg-emerald-600 dark:bg-emerald-500',
    checkboxActive: 'bg-emerald-600 border-emerald-600 dark:bg-emerald-500 dark:border-emerald-500',
  },
  amber: {
    key: 'amber',
    label: 'Âmbar',
    dot: 'bg-amber-500',
    softBg: 'bg-amber-500/10 dark:bg-amber-500/15',
    iconText: 'text-amber-600 dark:text-amber-400',
    borderAccent: 'hover:border-amber-300 dark:hover:border-amber-800/70',
    progressFill: 'bg-amber-500 dark:bg-amber-400',
    checkboxActive: 'bg-amber-500 border-amber-500 dark:bg-amber-500 dark:border-amber-500',
  },
  rose: {
    key: 'rose',
    label: 'Rosa',
    dot: 'bg-rose-500',
    softBg: 'bg-rose-500/10 dark:bg-rose-500/15',
    iconText: 'text-rose-600 dark:text-rose-400',
    borderAccent: 'hover:border-rose-300 dark:hover:border-rose-800/70',
    progressFill: 'bg-rose-600 dark:bg-rose-500',
    checkboxActive: 'bg-rose-600 border-rose-600 dark:bg-rose-500 dark:border-rose-500',
  },
  violet: {
    key: 'violet',
    label: 'Violeta',
    dot: 'bg-violet-500',
    softBg: 'bg-violet-500/10 dark:bg-violet-500/15',
    iconText: 'text-violet-600 dark:text-violet-400',
    borderAccent: 'hover:border-violet-300 dark:hover:border-violet-800/70',
    progressFill: 'bg-violet-600 dark:bg-violet-500',
    checkboxActive: 'bg-violet-600 border-violet-600 dark:bg-violet-500 dark:border-violet-500',
  },
  sky: {
    key: 'sky',
    label: 'Celeste',
    dot: 'bg-sky-500',
    softBg: 'bg-sky-500/10 dark:bg-sky-500/15',
    iconText: 'text-sky-600 dark:text-sky-400',
    borderAccent: 'hover:border-sky-300 dark:hover:border-sky-800/70',
    progressFill: 'bg-sky-600 dark:bg-sky-500',
    checkboxActive: 'bg-sky-600 border-sky-600 dark:bg-sky-500 dark:border-sky-500',
  },
};

export function getCategoryColorTheme(color?: string): CategoryColorTheme {
  if (color && color in CATEGORY_COLORS) {
    return CATEGORY_COLORS[color as CategoryColorKey];
  }
  return CATEGORY_COLORS.indigo;
}
