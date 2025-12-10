import { getTerminology, type TemplateTerminology } from '@/config/templates';

/**
 * Hook para acessar a terminologia dinâmica do template ativo
 * 
 * Exemplo de uso:
 * ```tsx
 * const terms = useTerminology();
 * return <h1>Lista de {terms.clients}</h1>;
 * ```
 */
export function useTerminology(): TemplateTerminology {
    return getTerminology();
}
