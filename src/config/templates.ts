/**
 * Templates de terminologia por nicho de negócio
 */

export type BusinessTemplate = 
  | 'consultoria' 
  | 'advocacia' 
  | 'clinica' 
  | 'agencia' 
  | 'imobiliaria' 
  | 'ecommerce' 
  | 'outros';

export interface TemplateTerminology {
  // Entidades principais
  client: string;
  clients: string;
  service: string;
  services: string;
  deal: string;
  deals: string;
  meeting: string;
  meetings: string;
  project: string;
  projects: string;
  task: string;
  tasks: string;
  dashboard: string;
  crm: string;

  // Campos específicos
  clientType?: string;
  serviceType?: string;
  dealType?: string;
  meetingType?: string;

  // Descrições
  clientDescription?: string;
  serviceDescription?: string;
  dealDescription?: string;
  meetingDescription?: string;
}

export interface BusinessTemplateConfig {
  id: BusinessTemplate;
  name: string;
  terminology: TemplateTerminology;
  primaryColor?: string;
  icon?: string;
}

/**
 * Configurações de templates por nicho
 */
export const businessTemplates: Record<BusinessTemplate, BusinessTemplateConfig> = {
  consultoria: {
    id: 'consultoria',
    name: 'Consultoria',
    terminology: {
      client: 'Cliente',
      clients: 'Clientes',
      service: 'Serviço',
      services: 'Serviços',
      deal: 'Negócio',
      deals: 'Negócios',
      meeting: 'Reunião',
      meetings: 'Reuniões',
      project: 'Projeto',
      projects: 'Projetos',
      task: 'Tarefa',
      tasks: 'Tarefas',
      dashboard: 'Dashboard',
      crm: 'CRM',
      clientDescription: 'Pessoa ou empresa que contrata seus serviços',
      serviceDescription: 'Serviço de consultoria oferecido',
      dealDescription: 'Oportunidade de negócio ou venda',
      meetingDescription: 'Reunião ou sessão com cliente'
    },
    primaryColor: 'hsl(221.2 83.2% 53.3%)',
  },

  advocacia: {
    id: 'advocacia',
    name: 'Advocacia',
    terminology: {
      client: 'Cliente',
      clients: 'Clientes',
      service: 'Serviço Jurídico',
      services: 'Serviços Jurídicos',
      deal: 'Caso',
      deals: 'Casos',
      meeting: 'Audiência',
      meetings: 'Audiências',
      project: 'Processo',
      projects: 'Processos',
      task: 'Tarefa',
      tasks: 'Tarefas',
      dashboard: 'Painel',
      crm: 'Gestão de Clientes',
      clientDescription: 'Cliente que precisa de assistência jurídica',
      serviceDescription: 'Serviço jurídico oferecido pelo escritório',
      dealDescription: 'Novo caso ou oportunidade de atendimento',
      meetingDescription: 'Audiência, reunião ou compromisso com cliente'
    },
    primaryColor: 'hsl(210 40% 30%)',
  },

  clinica: {
    id: 'clinica',
    name: 'Clínica/Consultório',
    terminology: {
      client: 'Paciente',
      clients: 'Pacientes',
      service: 'Tratamento',
      services: 'Tratamentos',
      deal: 'Oportunidade',
      deals: 'Oportunidades',
      meeting: 'Consulta',
      meetings: 'Consultas',
      project: 'Tratamento',
      projects: 'Tratamentos',
      task: 'Tarefa',
      tasks: 'Tarefas',
      dashboard: 'Painel',
      crm: 'Gestão de Pacientes',
      clientDescription: 'Paciente que recebe atendimento',
      serviceDescription: 'Tratamento ou procedimento oferecido',
      dealDescription: 'Oportunidade de novo paciente',
      meetingDescription: 'Consulta ou sessão com paciente'
    },
    primaryColor: 'hsl(142 76% 36%)',
  },

  agencia: {
    id: 'agencia',
    name: 'Agência Digital',
    terminology: {
      client: 'Cliente',
      clients: 'Clientes',
      service: 'Serviço',
      services: 'Serviços',
      deal: 'Proposta',
      deals: 'Propostas',
      meeting: 'Reunião',
      meetings: 'Reuniões',
      project: 'Projeto',
      projects: 'Projetos',
      task: 'Tarefa',
      tasks: 'Tarefas',
      dashboard: 'Dashboard',
      crm: 'CRM',
      clientDescription: 'Cliente que contrata serviços da agência',
      serviceDescription: 'Serviço digital oferecido',
      dealDescription: 'Proposta comercial ou briefing',
      meetingDescription: 'Reunião com cliente ou equipe'
    },
    primaryColor: 'hsl(280 90% 50%)',
  },

  imobiliaria: {
    id: 'imobiliaria',
    name: 'Imobiliária',
    terminology: {
      client: 'Cliente',
      clients: 'Clientes',
      service: 'Imóvel',
      services: 'Imóveis',
      deal: 'Negociação',
      deals: 'Negociações',
      meeting: 'Visita',
      meetings: 'Visitas',
      project: 'Transação',
      projects: 'Transações',
      task: 'Tarefa',
      tasks: 'Tarefas',
      dashboard: 'Painel',
      crm: 'Gestão de Clientes',
      clientDescription: 'Cliente interessado em imóvel',
      serviceDescription: 'Imóvel disponível para venda ou locação',
      dealDescription: 'Negociação de venda ou locação',
      meetingDescription: 'Visita ao imóvel ou reunião'
    },
    primaryColor: 'hsl(24 95% 53%)',
  },

  ecommerce: {
    id: 'ecommerce',
    name: 'E-commerce',
    terminology: {
      client: 'Cliente',
      clients: 'Clientes',
      service: 'Produto',
      services: 'Produtos',
      deal: 'Venda',
      deals: 'Vendas',
      meeting: 'Atendimento',
      meetings: 'Atendimentos',
      project: 'Pedido',
      projects: 'Pedidos',
      task: 'Tarefa',
      tasks: 'Tarefas',
      dashboard: 'Dashboard',
      crm: 'CRM',
      clientDescription: 'Cliente que compra produtos',
      serviceDescription: 'Produto disponível na loja',
      dealDescription: 'Oportunidade de venda',
      meetingDescription: 'Atendimento ao cliente'
    },
    primaryColor: 'hsl(335 78% 42%)',
  },

  outros: {
    id: 'outros',
    name: 'Outros',
    terminology: {
      client: 'Cliente',
      clients: 'Clientes',
      service: 'Serviço',
      services: 'Serviços',
      deal: 'Negócio',
      deals: 'Negócios',
      meeting: 'Reunião',
      meetings: 'Reuniões',
      project: 'Projeto',
      projects: 'Projetos',
      task: 'Tarefa',
      tasks: 'Tarefas',
      dashboard: 'Dashboard',
      crm: 'CRM',
    },
    primaryColor: 'hsl(221.2 83.2% 53.3%)',
  },
};

/**
 * Retorna a configuração do template ativo
 */
export function getActiveTemplate(): BusinessTemplateConfig {
  const templateId = (import.meta.env.VITE_BUSINESS_TEMPLATE || 'consultoria') as BusinessTemplate;
  return businessTemplates[templateId] || businessTemplates.consultoria;
}

/**
 * Retorna a terminologia do template ativo com override das variáveis de ambiente
 */
export function getTerminology(): TemplateTerminology {
  const template = getActiveTemplate();
  
  return {
    client: import.meta.env.VITE_TERM_CLIENT || template.terminology.client,
    clients: import.meta.env.VITE_TERM_CLIENTS || template.terminology.clients,
    service: import.meta.env.VITE_TERM_SERVICE || template.terminology.service,
    services: import.meta.env.VITE_TERM_SERVICES || template.terminology.services,
    deal: import.meta.env.VITE_TERM_DEAL || template.terminology.deal,
    deals: import.meta.env.VITE_TERM_DEALS || template.terminology.deals,
    meeting: import.meta.env.VITE_TERM_MEETING || template.terminology.meeting,
    meetings: import.meta.env.VITE_TERM_MEETINGS || template.terminology.meetings,
    project: import.meta.env.VITE_TERM_PROJECT || template.terminology.project,
    projects: import.meta.env.VITE_TERM_PROJECTS || template.terminology.projects,
    task: import.meta.env.VITE_TERM_TASK || template.terminology.task,
    tasks: import.meta.env.VITE_TERM_TASKS || template.terminology.tasks,
    dashboard: import.meta.env.VITE_TERM_DASHBOARD || template.terminology.dashboard,
    crm: import.meta.env.VITE_TERM_CRM || template.terminology.crm,
    ...template.terminology,
  };
}

/**
 * Hook customizado para usar terminologia
 */
export function useTerminology() {
  return getTerminology();
}
