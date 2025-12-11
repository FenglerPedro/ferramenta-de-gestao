import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client, Service, Meeting, BusinessSettings, Deal, PipelineStage, defaultPipelineStages, ProjectTask, ProjectStage, defaultProjectStages, Transaction, ClientActivity, PurchasedService } from '@/types';
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
  purchasedServices: PurchasedService[];
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
  addPurchasedService: (service: Omit<PurchasedService, 'id'>) => void;
  updatePurchasedService: (id: string, service: Partial<PurchasedService>) => void;
  deletePurchasedService: (id: string) => void;
  updateSettings: (settings: Partial<BusinessSettings>) => void;
  undo: () => void;
  redo: () => void;
  resetHistory: () => void;
  canUndo: boolean;
  canRedo: boolean;
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
  purchasedServices: PurchasedService[];
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
  const [purchasedServices, setPurchasedServices] = useState<PurchasedService[]>(storedData?.purchasedServices ?? []);
  const [settings, setSettings] = useState<BusinessSettings>(storedData?.settings ?? defaultSettings);

  // Undo/Redo State
  const [history, setHistory] = useState<StoredData[]>([]);
  const [future, setFuture] = useState<StoredData[]>([]);

  const saveCheckpoint = () => {
    const currentData: StoredData = {
      clients, services, meetings, deals, pipelineStages, projectTasks,
      projectStages, transactions, activities, purchasedServices, settings
    };
    setHistory(prev => [...prev, currentData]);
    setFuture([]);
  };

  const undo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    
    // Save current state to future
    const currentData: StoredData = {
      clients, services, meetings, deals, pipelineStages, projectTasks,
      projectStages, transactions, activities, purchasedServices, settings
    };
    setFuture(prev => [currentData, ...prev]);
    setHistory(newHistory);

    setClients(previous.clients);
    setServices(previous.services);
    setMeetings(previous.meetings);
    setDeals(previous.deals);
    setPipelineStages(previous.pipelineStages);
    setProjectTasks(previous.projectTasks);
    setProjectStages(previous.projectStages);
    setTransactions(previous.transactions);
    setActivities(previous.activities);
    setPurchasedServices(previous.purchasedServices);
    setSettings(previous.settings);
  };

  const redo = () => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);

    const currentData: StoredData = {
      clients, services, meetings, deals, pipelineStages, projectTasks,
      projectStages, transactions, activities, purchasedServices, settings
    };
    setHistory(prev => [...prev, currentData]);
    setFuture(newFuture);

    setClients(next.clients);
    setServices(next.services);
    setMeetings(next.meetings);
    setDeals(next.deals);
    setPipelineStages(next.pipelineStages);
    setProjectTasks(next.projectTasks);
    setProjectStages(next.projectStages);
    setTransactions(next.transactions);
    setActivities(next.activities);
    setPurchasedServices(next.purchasedServices);
    setSettings(next.settings);
  };

  const resetHistory = () => {
    setHistory([]);
    setFuture([]);
  };

  // Salvar no localStorage sempre que os dados mudarem
  useEffect(() => {
    saveToStorage({ clients, services, meetings, deals, pipelineStages, projectTasks, projectStages, transactions, activities, purchasedServices, settings });
  }, [clients, services, meetings, deals, pipelineStages, projectTasks, projectStages, transactions, activities, purchasedServices, settings]);

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
        setPurchasedServices(newData.purchasedServices);
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
    saveCheckpoint();
    setClients([...clients, { ...client, id: generateId() }]);
  };

  const updateClient = (id: string, client: Partial<Client>) => {
    saveCheckpoint();
    setClients(clients.map(c => c.id === id ? { ...c, ...client } : c));
  };

  const deleteClient = (id: string) => {
    saveCheckpoint();
    setClients(clients.filter(c => c.id !== id));
  };

  // Service functions
  const addService = (service: Omit<Service, 'id'>) => {
    saveCheckpoint();
    setServices([...services, { ...service, id: generateId() }]);
  };

  const updateService = (id: string, service: Partial<Service>) => {
    saveCheckpoint();
    setServices(services.map(s => s.id === id ? { ...s, ...service } : s));
  };

  const deleteService = (id: string) => {
    saveCheckpoint();
    setServices(services.filter(s => s.id !== id));
  };

  // Meeting functions
  const addMeeting = (meeting: Omit<Meeting, 'id'>) => {
    saveCheckpoint();
    setMeetings([...meetings, { ...meeting, id: generateId() }]);
  };

  const updateMeeting = (id: string, meeting: Partial<Meeting>) => {
    saveCheckpoint();
    setMeetings(meetings.map(m => m.id === id ? { ...m, ...meeting } : m));
  };

  const deleteMeeting = (id: string) => {
    saveCheckpoint();
    setMeetings(meetings.filter(m => m.id !== id));
  };

  // Deal functions
  const addDeal = (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => {
    saveCheckpoint();
    const now = new Date().toISOString().split('T')[0];
    setDeals([...deals, { ...deal, id: generateId(), createdAt: now, updatedAt: now }]);
  };

  const updateDeal = (id: string, deal: Partial<Deal>) => {
    saveCheckpoint();
    const now = new Date().toISOString().split('T')[0];
    setDeals(deals.map(d => d.id === id ? { ...d, ...deal, updatedAt: now } : d));
  };

  const deleteDeal = (id: string) => {
    saveCheckpoint();
    setDeals(deals.filter(d => d.id !== id));
  };


  const moveDeal = (dealId: string, newStageId: string) => {
    saveCheckpoint();
    const now = new Date().toISOString().split('T')[0];
    const deal = deals.find(d => d.id === dealId);
    const newStage = pipelineStages.find(s => s.id === newStageId);

    const isClosedStage = (newStage && (
      newStage.name.toLowerCase().includes('fechado') ||
      newStage.name.toLowerCase().includes('ganho') ||
      newStage.id === 'closed' ||
      newStage.id === 'won'
    )) || newStageId === 'closed' || newStageId === 'won';

    if (isClosedStage && deal) {
      const clientExists = clients.some(c =>
        (c.sourceDealId === deal.id) ||
        (c.email === deal.clientEmail && deal.clientEmail && deal.clientEmail.trim() !== '')
      );

      if (!clientExists) {
        const clientId = generateId();
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

        setClients(prev => [...prev, { ...newClient, id: clientId }]);

        const newService: Omit<PurchasedService, 'id'> = {
          clientId: clientId,
          serviceName: deal.title,
          type: deal.type || 'one-time',
          value: deal.value,
          status: 'active',
          startDate: now,
        };
        addPurchasedService(newService);

      } else {
        const client = clients.find(c =>
          (c.sourceDealId === deal.id) ||
          (c.email === deal.clientEmail && deal.clientEmail && deal.clientEmail.trim() !== '')
        );

        if (client) {
          const newService: Omit<PurchasedService, 'id'> = {
            clientId: client.id,
            serviceName: deal.title,
            type: deal.type || 'one-time',
            value: deal.value,
            status: 'active',
            startDate: now,
          };
          addPurchasedService(newService);

          const currentTotal = client.totalValue || 0;
          updateClient(client.id, { totalValue: currentTotal + deal.value });
        }
      }
    } else if (!isClosedStage && deal) {
      const clientToRemove = clients.find(c => c.sourceDealId === deal.id);
      if (clientToRemove) {
        deleteClient(clientToRemove.id);
      }
    }

    setDeals(prevDeals => prevDeals.map(d => d.id === dealId ? { ...d, stageId: newStageId, updatedAt: now } : d));
  };

  // Pipeline Stage functions
  const addPipelineStage = (stage: Omit<PipelineStage, 'id' | 'order'>) => {
    saveCheckpoint();
    const maxOrder = Math.max(...pipelineStages.map(s => s.order), -1);
    setPipelineStages([...pipelineStages, { ...stage, id: generateId(), order: maxOrder + 1 }]);
  };

  const updatePipelineStage = (id: string, stage: Partial<PipelineStage>) => {
    saveCheckpoint();
    setPipelineStages(pipelineStages.map(s => s.id === id ? { ...s, ...stage } : s));
  };

  const deletePipelineStage = (id: string) => {
    saveCheckpoint();
    const remainingStages = pipelineStages.filter(s => s.id !== id);
    if (remainingStages.length > 0) {
      const firstStage = remainingStages.sort((a, b) => a.order - b.order)[0];
      setDeals(deals.map(d => d.stageId === id ? { ...d, stageId: firstStage.id } : d));
    }
    setPipelineStages(remainingStages);
  };

  const reorderPipelineStages = (newStages: PipelineStage[]) => {
    saveCheckpoint();
    setPipelineStages(newStages.map((s, index) => ({ ...s, order: index })));
  };

  // Project Task functions
  const addProjectTask = (task: Omit<ProjectTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    saveCheckpoint();
    const now = new Date().toISOString().split('T')[0];
    setProjectTasks([...projectTasks, { ...task, id: generateId(), createdAt: now, updatedAt: now }]);
  };

  const updateProjectTask = (id: string, task: Partial<ProjectTask>) => {
    saveCheckpoint();
    const now = new Date().toISOString().split('T')[0];
    setProjectTasks(projectTasks.map(t => t.id === id ? { ...t, ...task, updatedAt: now } : t));
  };

  const deleteProjectTask = (id: string) => {
    saveCheckpoint();
    setProjectTasks(projectTasks.filter(t => t.id !== id));
  };

  const moveProjectTask = (taskId: string, newStageId: string) => {
    saveCheckpoint();
    const now = new Date().toISOString().split('T')[0];
    setProjectTasks(projectTasks.map(t => t.id === taskId ? { ...t, stageId: newStageId, updatedAt: now } : t));
  };

  // Project Stage functions
  const addProjectStage = (stage: Omit<ProjectStage, 'id' | 'order'>) => {
    saveCheckpoint();
    const maxOrder = Math.max(...projectStages.map(s => s.order), -1);
    setProjectStages([...projectStages, { ...stage, id: generateId(), order: maxOrder + 1 }]);
  };

  const updateProjectStage = (id: string, stage: Partial<ProjectStage>) => {
    saveCheckpoint();
    setProjectStages(projectStages.map(s => s.id === id ? { ...s, ...stage } : s));
  };

  const deleteProjectStage = (id: string) => {
    saveCheckpoint();
    const remainingStages = projectStages.filter(s => s.id !== id);
    if (remainingStages.length > 0) {
      const firstStage = remainingStages.sort((a, b) => a.order - b.order)[0];
      setProjectTasks(projectTasks.map(t => t.stageId === id ? { ...t, stageId: firstStage.id } : t));
    }
    setProjectStages(remainingStages);
  };

  const reorderProjectStages = (newStages: ProjectStage[]) => {
    saveCheckpoint();
    setProjectStages(newStages.map((s, index) => ({ ...s, order: index })));
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    saveCheckpoint();
    setTransactions([...transactions, { ...transaction, id: generateId() }]);
  };

  const updateTransaction = (id: string, transaction: Partial<Transaction>) => {
    saveCheckpoint();
    setTransactions(transactions.map(t => t.id === id ? { ...t, ...transaction } : t));
  };

  const deleteTransaction = (id: string) => {
    saveCheckpoint();
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // Activity functions
  const addActivity = (activity: Omit<ClientActivity, 'id'>) => {
    saveCheckpoint();
    setActivities([...activities, { ...activity, id: generateId() }]);
  };

  const updateActivity = (id: string, activity: Partial<ClientActivity>) => {
    saveCheckpoint();
    setActivities(activities.map(a => a.id === id ? { ...a, ...activity } : a));
  };

  const deleteActivity = (id: string) => {
    saveCheckpoint();
    setActivities(activities.filter(a => a.id !== id));
  };

  const addPurchasedService = (service: Omit<PurchasedService, 'id'>) => {
    saveCheckpoint();
    setPurchasedServices([...purchasedServices, { ...service, id: generateId() }]);
  };

  const updatePurchasedService = (id: string, service: Partial<PurchasedService>) => {
    saveCheckpoint();
    setPurchasedServices(purchasedServices.map(s => s.id === id ? { ...s, ...service } : s));
  };

  const deletePurchasedService = (id: string) => {
    saveCheckpoint();
    setPurchasedServices(purchasedServices.filter(s => s.id !== id));
  };

  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    saveCheckpoint();
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
        purchasedServices,
        addPurchasedService,
        updatePurchasedService,
        deletePurchasedService,
        updateSettings,
        undo,
        redo,
        resetHistory,
        canUndo: history.length > 0,
        canRedo: future.length > 0,
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
