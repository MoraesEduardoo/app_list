'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, LogIn, ShieldCheck } from 'lucide-react';
import { useApp } from '../../src/context/AppContext.tsx';

export default function LoginPage() {
  const router = useRouter();
  const { user, signInWithGoogle, signOutUser } = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleGoogleAuth = async () => {
    setSubmitting(true);
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6">
      {/* Topo simples */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <Link
          href="/dashboard"
          className="min-h-[44px] inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para o Dashboard</span>
        </Link>
        <span className="text-sm font-bold tracking-tight">App List</span>
      </div>

      {/* Card Central Minimalista */}
      <main className="my-auto py-12 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-7 sm:p-8 shadow-sm"
        >
          <div>
            <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
              Sincronização em Nuvem · PWA
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {mode === 'login' ? 'Acesse sua conta' : 'Crie sua conta gratuita'}
            </h1>
            <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Sincronize suas listas dinâmicas e categorias com isolamento por usuário no PostgreSQL.
            </p>
          </div>

          {user ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    Conectado como {user.displayName || user.email}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                    {user.email}
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard"
                className="min-h-[44px] w-full flex items-center justify-center rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-xs font-semibold text-white dark:text-zinc-900 hover:opacity-90 transition-opacity"
              >
                Ir para Minhas Listas
              </Link>

              <button
                type="button"
                onClick={signOutUser}
                className="min-h-[44px] w-full flex items-center justify-center rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Encerrar Sessão
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {/* Botão Principal Google OAuth */}
              <button
                type="button"
                disabled={submitting}
                onClick={handleGoogleAuth}
                className="min-h-[48px] w-full flex items-center justify-center gap-2.5 rounded-2xl bg-zinc-900 dark:bg-zinc-100 px-4 py-3 text-xs font-semibold text-white dark:text-zinc-900 hover:opacity-90 transition-opacity cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{submitting ? 'Autenticando...' : 'Continuar com Google'}</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
                <span className="bg-white dark:bg-zinc-900 px-3 text-[11px] text-zinc-400 whitespace-nowrap">
                  ou acesse com e-mail
                </span>
                <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@exemplo.com.br"
                    className="w-full min-h-[44px] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Senha
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full min-h-[44px] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-300"
                  />
                </div>

                <button
                  type="submit"
                  className="min-h-[44px] w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  {mode === 'login' ? 'Entrar no Workspace' : 'Criar Conta'}
                </button>
              </form>

              <div className="pt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="hover:text-zinc-900 dark:hover:text-zinc-100 underline underline-offset-4 cursor-pointer"
                >
                  {mode === 'login'
                    ? 'Não tem conta? Cadastre-se'
                    : 'Já possui conta? Faça login'}
                </button>
                <span className="inline-flex items-center gap-1 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  RLS Ativo
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      <footer className="text-center text-xs text-zinc-400 dark:text-zinc-500">
        App List · PWA de Listas Dinâmicas por Categorias
      </footer>
    </div>
  );
}
