import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type CategoryColorKey =
  | 'indigo'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'violet'
  | 'sky'
  | 'cyan'
  | 'teal'
  | 'lime'
  | 'orange'
  | 'pink'
  | 'fuchsia'
  | 'blue'
  | 'red'
  | 'zinc';

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

// Exatamente 15 opções de cores distintas (tons pastéis, vibrantes e neutros)
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
    dot: 'bg-sky-400',
    softBg: 'bg-sky-500/10 dark:bg-sky-500/15',
    iconText: 'text-sky-600 dark:text-sky-400',
    borderAccent: 'hover:border-sky-300 dark:hover:border-sky-800/70',
    progressFill: 'bg-sky-500 dark:bg-sky-400',
    checkboxActive: 'bg-sky-500 border-sky-500 dark:bg-sky-500 dark:border-sky-500',
  },
  cyan: {
    key: 'cyan',
    label: 'Ciano',
    dot: 'bg-cyan-500',
    softBg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
    iconText: 'text-cyan-600 dark:text-cyan-400',
    borderAccent: 'hover:border-cyan-300 dark:hover:border-cyan-800/70',
    progressFill: 'bg-cyan-600 dark:bg-cyan-500',
    checkboxActive: 'bg-cyan-600 border-cyan-600 dark:bg-cyan-500 dark:border-cyan-500',
  },
  teal: {
    key: 'teal',
    label: 'Turquesa',
    dot: 'bg-teal-500',
    softBg: 'bg-teal-500/10 dark:bg-teal-500/15',
    iconText: 'text-teal-600 dark:text-teal-400',
    borderAccent: 'hover:border-teal-300 dark:hover:border-teal-800/70',
    progressFill: 'bg-teal-600 dark:bg-teal-500',
    checkboxActive: 'bg-teal-600 border-teal-600 dark:bg-teal-500 dark:border-teal-500',
  },
  lime: {
    key: 'lime',
    label: 'Lima',
    dot: 'bg-lime-500',
    softBg: 'bg-lime-500/10 dark:bg-lime-500/15',
    iconText: 'text-lime-600 dark:text-lime-400',
    borderAccent: 'hover:border-lime-300 dark:hover:border-lime-800/70',
    progressFill: 'bg-lime-600 dark:bg-lime-500',
    checkboxActive: 'bg-lime-600 border-lime-600 dark:bg-lime-500 dark:border-lime-500',
  },
  orange: {
    key: 'orange',
    label: 'Laranja',
    dot: 'bg-orange-500',
    softBg: 'bg-orange-500/10 dark:bg-orange-500/15',
    iconText: 'text-orange-600 dark:text-orange-400',
    borderAccent: 'hover:border-orange-300 dark:hover:border-orange-800/70',
    progressFill: 'bg-orange-500 dark:bg-orange-400',
    checkboxActive: 'bg-orange-500 border-orange-500 dark:bg-orange-500 dark:border-orange-500',
  },
  pink: {
    key: 'pink',
    label: 'Pink Pastel',
    dot: 'bg-pink-400',
    softBg: 'bg-pink-500/10 dark:bg-pink-500/15',
    iconText: 'text-pink-600 dark:text-pink-400',
    borderAccent: 'hover:border-pink-300 dark:hover:border-pink-800/70',
    progressFill: 'bg-pink-500 dark:bg-pink-400',
    checkboxActive: 'bg-pink-500 border-pink-500 dark:bg-pink-500 dark:border-pink-500',
  },
  fuchsia: {
    key: 'fuchsia',
    label: 'Fúcsia',
    dot: 'bg-fuchsia-500',
    softBg: 'bg-fuchsia-500/10 dark:bg-fuchsia-500/15',
    iconText: 'text-fuchsia-600 dark:text-fuchsia-400',
    borderAccent: 'hover:border-fuchsia-300 dark:hover:border-fuchsia-800/70',
    progressFill: 'bg-fuchsia-600 dark:bg-fuchsia-500',
    checkboxActive: 'bg-fuchsia-600 border-fuchsia-600 dark:bg-fuchsia-500 dark:border-fuchsia-500',
  },
  blue: {
    key: 'blue',
    label: 'Azul Real',
    dot: 'bg-blue-600',
    softBg: 'bg-blue-500/10 dark:bg-blue-500/15',
    iconText: 'text-blue-600 dark:text-blue-400',
    borderAccent: 'hover:border-blue-300 dark:hover:border-blue-800/70',
    progressFill: 'bg-blue-600 dark:bg-blue-500',
    checkboxActive: 'bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500',
  },
  red: {
    key: 'red',
    label: 'Carmim',
    dot: 'bg-red-500',
    softBg: 'bg-red-500/10 dark:bg-red-500/15',
    iconText: 'text-red-600 dark:text-red-400',
    borderAccent: 'hover:border-red-300 dark:hover:border-red-800/70',
    progressFill: 'bg-red-600 dark:bg-red-500',
    checkboxActive: 'bg-red-600 border-red-600 dark:bg-red-500 dark:border-red-500',
  },
  zinc: {
    key: 'zinc',
    label: 'Grafite',
    dot: 'bg-zinc-500',
    softBg: 'bg-zinc-500/10 dark:bg-zinc-500/20',
    iconText: 'text-zinc-700 dark:text-zinc-300',
    borderAccent: 'hover:border-zinc-400 dark:hover:border-zinc-700',
    progressFill: 'bg-zinc-700 dark:bg-zinc-300',
    checkboxActive: 'bg-zinc-800 border-zinc-800 dark:bg-zinc-200 dark:border-zinc-200',
  },
};

export const CATEGORY_COLOR_LIST = Object.values(CATEGORY_COLORS);

export function getCategoryColorTheme(color?: string): CategoryColorTheme {
  if (color && color in CATEGORY_COLORS) {
    return CATEGORY_COLORS[color as CategoryColorKey];
  }
  return CATEGORY_COLORS.indigo;
}
