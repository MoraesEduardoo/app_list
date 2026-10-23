/**
 * Cliente Utilitário para integração com Supabase (PostgreSQL + Auth)
 * Compatível com Next.js App Router (Client & Server Components)
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseConfig(): SupabaseConfig {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  };
}

/**
 * Exemplo de wrapper REST leve compatível com Supabase PostgREST + Auth
 * Para uso direto com @supabase/ssr em deploy na Vercel:
 *
 * import { createBrowserClient } from '@supabase/ssr'
 * export const createClient = () =>
 *   createBrowserClient(
 *     process.env.NEXT_PUBLIC_SUPABASE_URL!,
 *     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
 *   )
 */
export function createSupabaseBrowserConfig() {
  const { url, anonKey } = getSupabaseConfig();
  return {
    supabaseUrl: url,
    supabaseAnonKey: anonKey,
    isConfigured: Boolean(url && anonKey),
  };
}
