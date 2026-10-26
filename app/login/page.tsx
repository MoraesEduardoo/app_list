'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogIn, Loader2, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useApp } from '../../src/context/AppContext.tsx';
import { PWAInstallButton } from '../../src/components/PWAInstallButton.tsx';

export default function LoginPage() {
  const router = useRouter();
  const {
    user,
    theme,
    toggleTheme,
    signInWithGoogle,
    loginWithEmail,
    signupWithEmail,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleGoogleAuth = async () => {
    setFormError(null);
    setSubmitting(true);
    try {
      const ok = await signInWithGoogle();
      if (ok) {
        router.push('/dashboard');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    if (mode === 'signup' && !trimmedName) {
      setFormError('Por favor, informe seu nome.');
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setFormError('Informe um endereço de e-mail válido.');
      return;
    }
    if (!password || password.length < 6) {
      setFormError('A senha deve possuir no mínimo 6 caracteres.');
      return;
    }

    setSubmitting(true);
    try {
      const result =
        mode === 'signup'
          ? await signupWithEmail(trimmedName, trimmedEmail, password)
          : await loginWithEmail(trimmedEmail, password);

      if (!result.ok) {
        setFormError(result.error || 'Não foi possível autenticar.');
        return;
      }

      router.push('/dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  if (user) {
    router.replace('/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6">
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between gap-4">
        <span className="text-lg font-bold tracking-tight">App List</span>
        <div className="flex items-center gap-2.5">
          <PWAInstallButton />
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Alternar tema"
            className="min-h-[40px] inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-zinc-700" />
            )}
          </button>
        </div>
      </header>

      <main className="my-auto py-10 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-900/90 backdrop-blur-md p-7 sm:p-8 shadow-sm"
        >
          <div>
            <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
              Sincronização em Nuvem · PostgreSQL
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {mode === 'login' ? 'Entrar na sua conta' : 'Criar nova conta'}
            </h1>
            <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Suas categorias e listas são salvas em nuvem com acesso idêntico no celular ou computador.
            </p>
          </div>

          <div className="mt-6 space-y-5">
            <form onSubmit={handleFormSubmit} noValidate className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder="Seu nome"
                    className="w-full min-h-[44px] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-300"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formError) setFormError(null);
                  }}
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
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  placeholder="Mínimo de 6 caracteres"
                  className="w-full min-h-[44px] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-300"
                />
              </div>

              {formError && (
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-3.5 py-2.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                  {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="min-h-[46px] w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-xs font-semibold text-white dark:text-zinc-900 hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {submitting
                    ? 'Processando...'
                    : mode === 'login'
                    ? 'Entrar na Conta'
                    : 'Criar Conta e Acessar'}
                </span>
              </button>
            </form>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
              <span className="bg-white dark:bg-zinc-900 px-3 text-[11px] text-zinc-400 whitespace-nowrap">
                ou conecte com
              </span>
              <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={handleGoogleAuth}
              className="min-h-[44px] w-full flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 px-4 py-2.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4 text-indigo-500" />
              <span>Continuar com Google</span>
            </button>

            <div className="pt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setFormError(null);
                }}
                className="hover:text-zinc-900 dark:hover:text-zinc-100 underline underline-offset-4 cursor-pointer"
              >
                {mode === 'login'
                  ? 'Não tem conta? Cadastre-se agora'
                  : 'Já possui conta? Faça login'}
              </button>
              <span className="inline-flex items-center gap-1 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Nuvem Ativa
              </span>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="text-center text-xs text-zinc-400 dark:text-zinc-500">
        App List · Persistência em Nuvem PostgreSQL
      </footer>
    </div>
  );
}
