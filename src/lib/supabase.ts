import { createClient } from '@supabase/supabase-js';
import env from '@/config/env';

/**
 * Verifica se as variáveis de ambiente estão configuradas
 */
export const isSupabaseConfigured = () => {
  return !!env.supabase.url && !!env.supabase.anonKey;
};

/**
 * Cliente Supabase com persistência de sessão habilitada
 * (ESSA parte é o que faltava no seu projeto)
 */
export const supabase = isSupabaseConfigured()
  ? createClient(env.supabase.url, env.supabase.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export type Database = any;

