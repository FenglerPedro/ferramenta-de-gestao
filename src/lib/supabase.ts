
import { createClient } from '@supabase/supabase-js';
import env from '@/config/env';

/**
 * Verifica se as variáveis de ambiente do Supabase estão configuradas
 */
export const isSupabaseConfigured = () => {
    return !!env.supabase.url && !!env.supabase.anonKey;
};

/**
 * Cliente do Supabase
 * Se não estiver configurado, retorna null ou lança erro dependendo do uso,
 * mas para evitar quebras na inicialização, criamos apenas se houver config.
 */
export const supabase = isSupabaseConfigured()
    ? createClient(env.supabase.url, env.supabase.anonKey)
    : null;

/**
 * Tipos do Banco de Dados (serão gerados automaticamente depois)
 * Por enquanto, usamos any ou definimos manualmente se necessário
 */
export type Database = any;
