// Tipos para o CRM com Kanban personalizável

export interface PipelineStage {
    id: string;
    name: string;
    color: string;
    order: number;
}

export interface Deal {
    id: string;
    clientId?: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    title: string;
    value: number;
    type?: 'recurring' | 'one-time';
    stageId: string;
    createdAt: string;
    updatedAt: string;
    notes?: string;
}

// Estágios padrão do pipeline
export const defaultPipelineStages: PipelineStage[] = [
    { id: 'lead', name: 'Lead', color: '#6366f1', order: 0 },
    { id: 'contact', name: 'Em Contato', color: '#f59e0b', order: 1 },
    { id: 'proposal', name: 'Proposta Enviada', color: '#3b82f6', order: 2 },
    { id: 'lost', name: 'Perdido', color: '#ef4444', order: 3 },
    { id: 'closed', name: 'Fechado', color: '#22c55e', order: 4 },
];
