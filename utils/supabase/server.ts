/**
 * Utilitário Server-Side para integração com Supabase SSR no Next.js App Router
 */
import { cookies } from 'next/headers';

export async function getServerSessionCookie() {
  const cookieStore = await cookies();
  return cookieStore.get('applist_session')?.value || null;
}
