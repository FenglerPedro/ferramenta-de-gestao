// Tipos para o sistema de projetos de clientes

export interface ProjectStage {
    id: string;
    name: string;
    color: string;
    order: number;
}

export interface ProjectTask {
    id: string;
    clientId: string;
    title: string;
    description?: string;
    stageId: string;
    priority?: 'low' | 'medium' | 'high';
    assignedTo?: string;
    dueDate?: string;
    createdAt: string;
    updatedAt: string;
}

// Estágios padrão do projeto
export const defaultProjectStages: ProjectStage[] = [
    { id: 'planning', name: 'Planejamento', color: '#8b5cf6', order: 0 },
    { id: 'execution', name: 'Execução', color: '#3b82f6', order: 1 },
    { id: 'review', name: 'Revisão', color: '#f59e0b', order: 2 },
    { id: 'completed', name: 'Finalizado', color: '#22c55e', order: 3 },
];
