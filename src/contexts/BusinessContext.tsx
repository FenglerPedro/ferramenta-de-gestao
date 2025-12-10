import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client, Service, Meeting, BusinessSettings, Deal, PipelineStage, defaultPipelineStages, ProjectTask, ProjectStage, defaultProjectStages, Transaction, ClientActivity } from '@/types';
import env from '@/config/env';

interface BusinessContextType {
  clients: Client[];
  services: Service[];
  meetings: Meeting[];
  deals: Deal[];
  pipelineStages: PipelineStage[];
  projectTasks: ProjectTask[];
  projectStages: ProjectStage[];
  transactions: Transaction[];
  activities: ClientActivity[];
  settings: BusinessSettings;
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;
  addMeeting: (meeting: Omit<Meeting, 'id'>) => void;
  updateMeeting: (id: string, meeting: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDeal: (id: string, deal: Partial<Deal>) => void;
  deleteDeal: (id: string) => void;
  moveDeal: (dealId: string, newStageId: string) => void;
  addPipelineStage: (stage: Omit<PipelineStage, 'id' | 'order'>) => void;
  updatePipelineStage: (id: string, stage: Partial<PipelineStage>) => void;
  deletePipelineStage: (id: string) => void;
  reorderPipelineStages: (stages: PipelineStage[]) => void;
  addProjectTask: (task: Omit<ProjectTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProjectTask: (id: string, task: Partial<ProjectTask>) => void;
  deleteProjectTask: (id: string) => void;
  moveProjectTask: (taskId: string, newStageId: string) => void;
  addProjectStage: (stage: Omit<ProjectStage, 'id' | 'order'>) => void;
  updateProjectStage: (id: string, stage: Partial<ProjectStage>) => void;
  deleteProjectStage: (id: string) => void;
  reorderProjectStages: (stages: ProjectStage[]) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addActivity: (activity: Omit<ClientActivity, 'id'>) => void;
  updateActivity: (id: string, activity: Partial<ClientActivity>) => void;
  deleteActivity: (id: string) => void;
  updateSettings: (settings: Partial<BusinessSettings>) => void;
}

const STORAGE_KEY = 'gestao_business_data';

const defaultSettings: BusinessSettings = {
  businessName: env.businessName,
  ownerName: env.ownerName,
  email: env.businessEmail,
  phone: env.businessPhone,
  availableHours: { start: '09:00', end: '18:00' },
  availableDays: [1, 2, 3, 4, 5],
  daySchedules: {
    0: { enabled: false, startTime: '09:00', endTime: '18:00' },
    1: { enabled: true, startTime: '09:00', endTime: '18:00' },
    2: { enabled: true, startTime: '09:00', endTime: '18:00' },
    3: { enabled: true, startTime: '09:00', endTime: '18:00' },
    4: { enabled: true, startTime: '09:00', endTime: '18:00' },
    5: { enabled: true, startTime: '09:00', endTime: '18:00' },
    6: { enabled: false, startTime: '09:00', endTime: '18:00' },
  },
  meetingDuration: 60,
  blockedDates: [],
  blockedTimeSlots: [],
};

const defaultClients: Client[] = [];

const defaultServices: Service[] = [];

const defaultMeetings: Meeting[] = [];

const defaultDeals: Deal[] = [];

interface StoredData {
  clients: Client[];
  services: Service[];
  meetings: Meeting[];
  deals: Deal[];
  pipelineStages: PipelineStage[];
  projectTasks: ProjectTask[];
  projectStages: ProjectStage[];
  transactions: Transaction[];
  activities: ClientActivity[];
  settings: BusinessSettings;
}

const loadFromStorage = (): StoredData | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Erro ao carregar dados do localStorage:', error);
  }
  return null;
};

const saveToStorage = (data: StoredData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao salvar dados no localStorage:', error);
  }
};

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const storedData = loadFromStorage();

  const [clients, setClients] = useState<Client[]>(storedData?.clients ?? defaultClients);
  const [services, setServices] = useState<Service[]>(storedData?.services ?? defaultServices);
  const [meetings, setMeetings] = useState<Meeting[]>(storedData?.meetings ?? defaultMeetings);
  const [deals, setDeals] = useState<Deal[]>(storedData?.deals ?? defaultDeals);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>(
    storedData?.pipelineStages ?? defaultPipelineStages
  );
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>(storedData?.projectTasks ?? []);
  const [projectStages, setProjectStages] = useState<ProjectStage[]>(
    storedData?.projectStages ?? defaultProjectStages
  );
  const [transactions, setTransactions] = useState<Transaction[]>(storedData?.transactions ?? []);
  const [activities, setActivities] = useState<ClientActivity[]>(storedData?.activities ?? []);
  const [settings, setSettings] = useState<BusinessSettings>(storedData?.settings ?? defaultSettings);

  // Salvar no localStorage sempre que os dados mudarem
  useEffect(() => {
    saveToStorage({ clients, services, meetings, deals, pipelineStages, projectTasks, projectStages, transactions, activities, settings });
  }, [clients, services, meetings, deals, pipelineStages, projectTasks, projectStages, transactions, activities, settings]);

  // Sincronizar dados quando há mudanças no localStorage (ex: em outras abas)
  useEffect(() => {
    const handleStorageChange = () => {
      const newData = loadFromStorage();
      if (newData) {
        setClients(newData.clients);
        setServices(newData.services);
        setMeetings(newData.meetings);
        setDeals(newData.deals);
        setPipelineStages(newData.pipelineStages);
        setProjectTasks(newData.projectTasks);
        setProjectStages(newData.projectStages);
        setTransactions(newData.transactions);
        setActivities(newData.activities);
        setSettings(newData.settings);
      }
    };

    // Escuta mudanças de storage (sincroniza entre abas)
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Client functions
  const addClient = (client: Omit<Client, 'id'>) => {
    setClients([...clients, { ...client, id: generateId() }]);
  };

  const updateClient = (id: string, client: Partial<Client>) => {
    setClients(clients.map(c => c.id === id ? { ...c, ...client } : c));
  };

  const deleteClient = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
  };

  // Service functions
  const addService = (service: Omit<Service, 'id'>) => {
    setServices([...services, { ...service, id: generateId() }]);
  };

  const updateService = (id: string, service: Partial<Service>) => {
    setServices(services.map(s => s.id === id ? { ...s, ...service } : s));
  };

  const deleteService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  // Meeting functions
  const addMeeting = (meeting: Omit<Meeting, 'id'>) => {
    setMeetings([...meetings, { ...meeting, id: generateId() }]);
  };

  const updateMeeting = (id: string, meeting: Partial<Meeting>) => {
    setMeetings(meetings.map(m => m.id === id ? { ...m, ...meeting } : m));
  };

  const deleteMeeting = (id: string) => {
    setMeetings(meetings.filter(m => m.id !== id));
  };

  // Deal functions
  const addDeal = (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    setDeals([...deals, { ...deal, id: generateId(), createdAt: now, updatedAt: now }]);
  };

  const updateDeal = (id: string, deal: Partial<Deal>) => {
    const now = new Date().toISOString().split('T')[0];
    setDeals(deals.map(d => d.id === id ? { ...d, ...deal, updatedAt: now } : d));
  };

  const deleteDeal = (id: string) => {
    setDeals(deals.filter(d => d.id !== id));
  };


  const moveDeal = (dealId: string, newStageId: string) => {
    const now = new Date().toISOString().split('T')[0];
    const deal = deals.find(d => d.id === dealId);
    const newStage = pipelineStages.find(s => s.id === newStageId);

    // Verificar se o estágio é "Fechado" ou similar (ganho/won)
    // Se o estágio não for encontrado (ex: deletado), mas o ID for 'closed' ou 'won', consideramos fechado.
    const isClosedStage = (newStage && (
      newStage.name.toLowerCase().includes('fechado') ||
      newStage.name.toLowerCase().includes('ganho') ||
      newStage.id === 'closed' ||
      newStage.id === 'won'
    )) || newStageId === 'closed' || newStageId === 'won';

    // Se moveu para "Fechado" e ainda não existe cliente com este email
    if (isClosedStage && deal) {
      const clientExists = clients.some(c =>
        (c.sourceDealId === deal.id) ||
        (c.email === deal.clientEmail && deal.clientEmail && deal.clientEmail.trim() !== '')
      );

      if (!clientExists) {
        // Criar novo cliente automaticamente
        const newClient: Omit<Client, 'id'> = {
          name: deal.clientName,
          email: deal.clientEmail,
          phone: deal.clientPhone,
          service: deal.title,
          services: [deal.title],
          totalValue: deal.value,
          purchaseDate: now,
          isRecurring: false,
          monthlyValue: 0,
          status: 'active',
          sourceDealId: dealId,
        };

        addClient(newClient);
        // Force update deals state first to ensure UI responsiveness, client addition happens via state setter
      } else if (clientExists) {
        // Se já existe, talvez atualizar o valor total?
        // Por enquanto, mantemos a lógica de apenas criar se não existir.
      }
    } else if (!isClosedStage && deal) {
      // Se saiu de "Fechado", remover cliente associado APENAS se foi criado automaticamente por este deal
      const clientToRemove = clients.find(c => c.sourceDealId === deal.id);
      if (clientToRemove) {
        deleteClient(clientToRemove.id);
      }
    }

    setDeals(prevDeals => prevDeals.map(d => d.id === dealId ? { ...d, stageId: newStageId, updatedAt: now } : d));
  };

  // Pipeline Stage functions
  const addPipelineStage = (stage: Omit<PipelineStage, 'id' | 'order'>) => {
    const maxOrder = Math.max(...pipelineStages.map(s => s.order), -1);
    setPipelineStages([...pipelineStages, { ...stage, id: generateId(), order: maxOrder + 1 }]);
  };

  const updatePipelineStage = (id: string, stage: Partial<PipelineStage>) => {
    setPipelineStages(pipelineStages.map(s => s.id === id ? { ...s, ...stage } : s));
  };

  const deletePipelineStage = (id: string) => {
    // Mover deals deste estágio para o primeiro estágio disponível
    const remainingStages = pipelineStages.filter(s => s.id !== id);
    if (remainingStages.length > 0) {
      const firstStage = remainingStages.sort((a, b) => a.order - b.order)[0];
      setDeals(deals.map(d => d.stageId === id ? { ...d, stageId: firstStage.id } : d));
    }
    setPipelineStages(remainingStages);
  };

  const reorderPipelineStages = (newStages: PipelineStage[]) => {
    setPipelineStages(newStages.map((s, index) => ({ ...s, order: index })));
  };

  // Project Task functions
  const addProjectTask = (task: Omit<ProjectTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    setProjectTasks([...projectTasks, { ...task, id: generateId(), createdAt: now, updatedAt: now }]);
  };

  const updateProjectTask = (id: string, task: Partial<ProjectTask>) => {
    const now = new Date().toISOString().split('T')[0];
    setProjectTasks(projectTasks.map(t => t.id === id ? { ...t, ...task, updatedAt: now } : t));
  };

  const deleteProjectTask = (id: string) => {
    setProjectTasks(projectTasks.filter(t => t.id !== id));
  };

  const moveProjectTask = (taskId: string, newStageId: string) => {
    const now = new Date().toISOString().split('T')[0];
    setProjectTasks(projectTasks.map(t => t.id === taskId ? { ...t, stageId: newStageId, updatedAt: now } : t));
  };

  // Project Stage functions
  const addProjectStage = (stage: Omit<ProjectStage, 'id' | 'order'>) => {
    const maxOrder = Math.max(...projectStages.map(s => s.order), -1);
    setProjectStages([...projectStages, { ...stage, id: generateId(), order: maxOrder + 1 }]);
  };

  const updateProjectStage = (id: string, stage: Partial<ProjectStage>) => {
    setProjectStages(projectStages.map(s => s.id === id ? { ...s, ...stage } : s));
  };

  const deleteProjectStage = (id: string) => {
    const remainingStages = projectStages.filter(s => s.id !== id);
    if (remainingStages.length > 0) {
      const firstStage = remainingStages.sort((a, b) => a.order - b.order)[0];
      setProjectTasks(projectTasks.map(t => t.stageId === id ? { ...t, stageId: firstStage.id } : t));
    }
    setProjectStages(remainingStages);
  };

  const reorderProjectStages = (newStages: ProjectStage[]) => {
    setProjectStages(newStages.map((s, index) => ({ ...s, order: index })));
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    setTransactions([...transactions, { ...transaction, id: generateId() }]);
  };

  const updateTransaction = (id: string, transaction: Partial<Transaction>) => {
    setTransactions(transactions.map(t => t.id === id ? { ...t, ...transaction } : t));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // Activity functions
  const addActivity = (activity: Omit<ClientActivity, 'id'>) => {
    setActivities([...activities, { ...activity, id: generateId() }]);
  };

  const updateActivity = (id: string, activity: Partial<ClientActivity>) => {
    setActivities(activities.map(a => a.id === id ? { ...a, ...activity } : a));
  };

  const deleteActivity = (id: string) => {
    setActivities(activities.filter(a => a.id !== id));
  };

  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    setSettings({ ...settings, ...newSettings });
  };

  return (
    <BusinessContext.Provider
      value={{
        clients,
        services,
        meetings,
        deals,
        pipelineStages,
        projectTasks,
        projectStages,
        settings,
        addClient,
        updateClient,
        deleteClient,
        addService,
        updateService,
        deleteService,
        addMeeting,
        updateMeeting,
        deleteMeeting,
        addDeal,
        updateDeal,
        deleteDeal,
        moveDeal,
        addPipelineStage,
        updatePipelineStage,
        deletePipelineStage,
        reorderPipelineStages,
        addProjectTask,
        updateProjectTask,
        deleteProjectTask,
        moveProjectTask,
        addProjectStage,
        updateProjectStage,
        deleteProjectStage,
        reorderProjectStages,
        transactions,
        activities,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addActivity,
        updateActivity,
        deleteActivity,
        updateSettings,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}
