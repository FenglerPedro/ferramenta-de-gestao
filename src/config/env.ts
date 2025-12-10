/**
 * Configurações centralizadas do ambiente
 */

export const env = {
    // Informações do negócio
    businessName: import.meta.env.VITE_BUSINESS_NAME || 'Minha Empresa',
    ownerName: import.meta.env.VITE_OWNER_NAME || 'Seu Nome',
    businessEmail: import.meta.env.VITE_BUSINESS_EMAIL || 'contato@empresa.com',
    businessPhone: import.meta.env.VITE_BUSINESS_PHONE || '(11) 99999-9999',

    // Template/Nicho
    businessTemplate: import.meta.env.VITE_BUSINESS_TEMPLATE || 'consultoria',

    // Supabase (para futuro uso)
    supabase: {
        url: import.meta.env.VITE_SUPABASE_URL || '',
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    },

    // Ambiente
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
} as const;

export default env;
