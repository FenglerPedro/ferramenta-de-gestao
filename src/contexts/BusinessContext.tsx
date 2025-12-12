import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  addClient: (client: Omit<Client, 'id'> & { id?: string }) => void;
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

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

const STORAGE_KEY = 'business_data';

function getStorageKey(userId: string) {
  return `${STORAGE_KEY}_${userId}`;
}

function saveToStorage(userId: string, data: StoredData) {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(data));
  } catch (err) {
    console.error('Erro ao salvar dados no localStorage:', err);
  }
}

function loadFromStorage(userId: string): StoredData | null {
  try {
    const stored = localStorage.getItem(getStorageKey(userId));
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    console.error('Erro ao carregar dados do localStorage:', err);
    return null;
  }
}

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>(defaultPipelineStages);
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([]);
  const [projectStages, setProjectStages] = useState<ProjectStage[]>(defaultProjectStages);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activities, setActivities] = useState<ClientActivity[]>([]);
  const [purchasedServices, setPurchasedServices] = useState<PurchasedService[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(defaultSettings);

  const [history, setHistory] = useState<StoredData[]>([]);
  const [future, setFuture] = useState<StoredData[]>([]);

  // Carregar dados do localStorage ao montar ou quando user muda
  useEffect(() => {
    if (!user) {
      setClients([]);
      setServices([]);
      setMeetings([]);
      setDeals([]);
      setPipelineStages(defaultPipelineStages);
      setProjectTasks([]);
      setProjectStages(defaultProjectStages);
      setTransactions([]);
      setActivities([]);
      setPurchasedServices([]);
      setSettings(defaultSettings);
      return;
    }

    const storedData = loadFromStorage(user.id);
    if (storedData) {
      setClients(storedData.clients);
      setServices(storedData.services);
      setMeetings(storedData.meetings);
      setDeals(storedData.deals);
      setPipelineStages(storedData.pipelineStages);
      setProjectTasks(storedData.projectTasks);
      setProjectStages(storedData.projectStages);
      setTransactions(storedData.transactions);
      setActivities(storedData.activities);
      setPurchasedServices(storedData.purchasedServices);
      setSettings(storedData.settings);
    } else {
      // Inicializar com dados padrão
      setClients([]);
      setServices([]);
      setMeetings([]);
      setDeals([]);
      setPipelineStages(defaultPipelineStages);
      setProjectTasks([]);
      setProjectStages(defaultProjectStages);
      setTransactions([]);
      setActivities([]);
      setPurchasedServices([]);
      setSettings(defaultSettings);
    }
  }, [user]);

  // Salvar dados quando qualquer coisa muda
  useEffect(() => {
    if (!user) return;

    const data: StoredData = {
      clients,
      services,
      meetings,
      deals,
      pipelineStages,
      projectTasks,
      projectStages,
      transactions,
      activities,
      purchasedServices,
      settings,
    };

    saveToStorage(user.id, data);
  }, [user, clients, services, meetings, deals, pipelineStages, projectTasks, projectStages, transactions, activities, purchasedServices, settings]);

  const saveCheckpoint = (data: StoredData) => {
    setHistory((prev) => [...prev, data]);
    setFuture([]);
  };

  // Clients
  const addClient = (client: Omit<Client, 'id'> & { id?: string }) => {
    const newClient: Client = {
      ...client,
      id: client.id || `client_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newClients = [...clients, newClient];
    setClients(newClients);

    saveCheckpoint({
      clients: newClients,
      services,
      meetings,
      deals,
      pipelineStages,
      projectTasks,
      projectStages,
      transactions,
      activities,
      purchasedServices,
      settings,
    });
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    const newClients = clients.map((c) =>
      c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    );
    setClients(newClients);

    saveCheckpoint({
      clients: newClients,
      services,
      meetings,
      deals,
      pipelineStages,
      projectTasks,
      projectStages,
      transactions,
      activities,
      purchasedServices,
      settings,
    });
  };

  const deleteClient = (id: string) => {
    const newClients = clients.filter((c) => c.id !== id);
    setClients(newClients);

    saveCheckpoint({
      clients: newClients,
      services,
      meetings,
      deals,
      pipelineStages,
      projectTasks,
      projectStages,
      transactions,
      activities,
      purchasedServices,
      settings,
    });
  };

  // Services
  const addService = (service: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...service,
      id: `service_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newServices = [...services, newService];
    setServices(newServices);

    saveCheckpoint({
      clients,
      services: newServices,
      meetings,
      deals,
      pipelineStages,
      projectTasks,
      projectStages,
      transactions,
      activities,
      purchasedServices,
      settings,
    });
  };

  const updateService = (id: string, updates: Partial<Service>) => {
    const newServices = services.map((s) =>
      s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
    );
    setServices(newServices);

    saveCheckpoint({
      clients,
      services: newServices,
      meetings,
      deals,
      pipelineStages,
      projectTasks,
      projectStages,
      transactions,
      activities,
      purchasedServices,
      settings,
    });
  };

  const deleteService = (id: string) => {
    const newServices = services.filter((s) => s.id !== id);
    setServices(newServices);

    saveCheckpoint({
      clients,
      services: newServices,
      meetings,
      deals,
      pipelineStages,
      projectTasks,
      projectStages,
      transactions,
      activities,
      purchasedServices,
      settings,
    });
  };

  // Meetings
  const addMeeting = (meeting: Omit<Meeting, 'id'>) => {
    const newMeeting: Meeting = {
      ...meeting,
      id: `meeting_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newMeetings = [...meetings, newMeeting];
    setMeetings(newMeetings);

    saveCheckpoint({
      clients,
      services,
      meetings: newMeetings,
      deals,
      pipelineStages,
      projectTasks,
      projectStages,
      transactions,
      activities,
      purchasedServices,
      settings,
    });
  };

  const updateMeeting = (id: string, updates: Partial<Meeting>) => {
    const newMeetings = meetings.map((m) =>
      m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
    );
    setMeetings(newMeetings);

    saveCheckpoint({
      clients,
      services,
      meetings: newMeetings,
      deals,
      pipelineStages,
      projectTasks,
      projectStages,
      transactions,
      activities,
      purchasedServices,
      settings,
    });
  };

  const deleteMeeting = (id: string) => {
    const newMeetings = meetings.filter((m) => m.id !== id);
    setMeetings(newMeetings);

    saveCheckpoint({
      clients,
      services,
      meetings: newMeetings,
      deals,
      pipelineStages,
      projectTasks,
      projectStages,
      transactions,
      activities,
      purchasedServices,
      settings,
    });
  };

  // Deals
  const addDeal = (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDeal: Deal = {
      ...deal,
      id: `deal_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newDeals = [...deals, newDeal];
    setDeals(newDeals);

    saveCheckpoint({
      clients,
      services,
      meetings,
      deals: newDeals,
      pipelineStages,
      projectTasks,
      projectStages,
      transactions,
      activities,
      purchasedServices,
      settings,
    });
  };

  const updateDeal = (id: string, updates: Partial<Deal>) => {
    const newDeals = deals.map((d) =>
      d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
    );
    setDeals(newDeals);

    saveCheckpoint({
      clients,
      services,
      meetings,
      deals: newDeals,
      pipelineStages,
      projectTasks,
      projectStages,
      transactions,
      activities,
      purchasedServices,
      settings,
    });
  };

  const deleteDeal = (id: string) => {
    const newDeals = deals.filter((d) => d.id !== id);
    setDeals(newDeals);

    saveCheckpoint({
      clients,
      services,
      meetings,
      deals: newDeals,
      pipelineStages,
      projectTasks,
      projectStages,
      transactions,
      activities,
      purchasedServices,
      settings,
    });
  };

  const moveDeal = (dealId: string, newStageId: string) => {
    const newDeals = deals.map((d) =>
      d.id === dealId ? { ...d, pipeline_stage_id: newStageId, updatedAt: new Date().toISOString() } : d
    );
    setDeals(newDeals);

    saveCheckpoint({
      clients,
      services,
      meetings,
      deals: newDeals,
      pipelineStages,
      projectTasks,
      projectStages,
      transactions,
      activities,
      purchasedServices,
      settings,
    });
  };

  // Pipeline Stages
  const addPipelineStage = (stage: Omit<PipelineStage, 'id' | 'order'>) => {
    const newStage: PipelineStage = {
      ...stage,
      id: `stage_${Date.now()}`,
      order: Math.max(0, ...(pipelineStages.map((s) => s.order) || [0])) + 1,
    };

    const newPipelineStages = [...pipelineStages, newStage];
    setPipelineStages(newPipelineStages);

    saveCheckpoint({
      clients,
      services,
      meetings,
      deals,
      pipelineStages: newPipelineStages,
      projectTasks,
      projectStages,
      transactions,
      activities,
      purchasedServices,
      settings,
    });
  };

  const updatePipelineStage = (id: string, updates: Partial<PipelineStage>) => {
    const newPipelineStages = pipelineStages.map((s) =>
      s.id === id ? { ...s, ...updates } : s
    );
    setPipelineStages(newPipelineStages);

    saveCheckpoint({
      clients,
      services,
      meetings,
      deals,
      pipelineStages: newPipelineStages,
      projectTasks,
      projectStages,
      transactions,
      activities,
      purchasedServices,
      settings,
    });
  };

  const deletePipelineStage = (id: string) => {
    const firstStage = pipelineStages.find((s) => s.id !== id);

    const newDeals = deals.map((d) =>
      d.pipeline_stage_id === id && firstStage
        ? { ...d, pipeline_stage_id: firstStage.id, updatedAt: new Date().toISOString() }
        : d
    );

    const newPipelineStages = pipelineStages.filter((s) => s.id !== id);

    setDeals(newDeals);
    setPipelineStages(newPipelineStages);

    saveCheckpoint({
      clients,
      services,
      meetings,
      deals: newDeals,
      pipelineStages: newPipelineStages,
      projectTasks,
      projectStages,
      transactions,
      activities,
      purchasedServices,
      settings,
    });
  };

  const reorderPipelineStages = (stages: PipelineStage[]) => {
    setPipelineStages(stages);

    saveCheckpoint({
      clients,
      services,
      meetings,
      deals,
      pipelineStages: stages,
      projectTasks,
      projectStages,
      transactions,
      activities,
      purchasedServices,
      settings,
    });
  };

  // Project Tasks
  const addProjectTask = (task: Omit<ProjectTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: ProjectTask = {
      ...task,
      id: `task_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newProjectTasks = [...projectTasks, newTask];
    setProjectTasks(newProjectTasks);

    saveCheckpoint({
      clients,
      services,
      meetings,
      deals,
      pipelineStages,
      projectTasks: newProjectTasks,
      projectStages,
      transactions,
      activities,
      purchasedServices,
      settings,
    });
  };

  const updateProjectTask = (id: string, updates: Partial<ProjectTask>) => {
    const newProjectTasks = projectTasks.map((t) =>
      t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    );
    setProjectTasks(newProjectTasks);

    saveCheckpoint({
      clients,
      services,
      meetings,
      deals,
      pipelineStages,
      projectTasks: newProjectTasks,
      projectStages,
      transactions,
      activities,
      purchasedServices,
      settings,
    });
  };

  const deleteProjectTask = (id: string) => {
    const newProjectTasks = projectTasks.filter((t) => t.id !== id);
    setProjectTasks(newProjectTasks);

    saveCheckpoint({
      clients,
      services,
      meetings,
      deals,
      pipelineStages,
      projectTasks: newProjectTasks,
      projectStages,
      transactions,
      activities,
      purchasedServices,
      settings,
    });
  };

  const moveProjectTask = (taskId: string, newStageId: string) => {
    const newProjectTasks = projectTasks.map((t) =>
      t.id === taskId ? { ...t, project_stage_id: newStageId, updatedAt: new Date().toISOString() } : t
    );
    setProjectTasks(newProjectTasks);

    saveCheckpoint({
      clients,
      services,
      meetings,
      deals,
      pipelineStages,
      projectTasks: newProjectTasks,
      projectStages,
      transactions,
      activities,
      purchasedServices,
      settings,
    });
  };

  // Project Stages
  const addProjectStage = (stage: Omit<ProjectStage, 'id' | 'order'>) => {
    const newStage: ProjectStage = {
      ...stage,
      id: `pstage_${Date.now()}`,
      order: Math.max(0, ...(projectStages.map((s) => s.order) || [0])) + 1,
    };

    const newProjectStages = [...projectStages, newStage];
    setProjectStages(newProjectStages);

    saveCheckpoint({
      clients,
      services,
      meetings,
      deals,
      pipelineStages,
      projectTasks,
      projectStages: newProjectStages,
      transactions,
      activities,
      purchasedServices,
      settings,
    });
  };

  const updateProjectStage = (id: string, updates: Partial<ProjectStage>) => {
    const newProjectStages = projectStages.map((s) =>
      s.id === id ? { ...s, ...updates } : s
    );
    setProjectStages(newProjectStages);

    saveCheckpoint({
      clients,
      services,
      meetings,
      deals,
      pipelineStages,
      projectTasks,
      projectStages: newProjectStages,
      transactions,
      activities,
      purchasedServices,
      settings,
    });
  };

  const deleteProjectStage = (id: string) => {
    const firstStage = projectStages.find((s) => s.id !== id);

    const newProjectTasks = projectTasks.map((t) =>
      t.project_stage_id === id && firstStage
        ? { ...t, project_stage_id: firstStage.id, updatedAt: new Date().toISOString() }
        : t
    );

    const newProjectStages = projectStages.filter((s) => s.id !== id);

    setProjectTasks(newProjectTasks);
    setProjectStages(newProjectStages);

    saveCheckpoint({
      clients,
      services,
      meetings,
      deals,
      pipelineStages,
      projectTasks: newProjectTasks,
      projectStages: newProjectStages,
      transactions,
      activities,
      purchasedServices,
      settings,
    });
  };

  const reorderProjectStages = (stages: ProjectStage[]) => {
    setProjectStages(stages);

    saveCheckpoint({
      clients,
      services,
      meetings,
      deals,
      pipelineStages,
      projectTasks,
      projectStages: stages,
      transactions,
      activities,
      purchasedServices,
      settings,
    });
  };

  // Transactions
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `trans_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newTransactions = [...transactions, newTransaction];
    setTransactions(newTransactions);

    saveCheckpoint({
      clients,
      services,
      meetings,
      deals,
      pipelineStages,
      projectTasks,
      projectStages,
      transactions: newTransactions,
      activities,
      purchasedServices,
      settings,
    });
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    const newTransactions = transactions.map((t) =>
      t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    );
    setTransactions(newTransactions);

    saveCheckpoint({
      clients,
      services,
      meetings,
      deals,
      pipelineStages,
      projectTasks,
      projectStages,
      transactions: newTransactions,
      activities,
      purchasedServices,
      settings,
    });
  };

  const deleteTransaction = (id: string) => {
    const newTransactions = transactions.filter((t) => t.id !== id);
    setTransactions(newTransactions);

    saveCheckpoint({
      clients,
      services,
      meetings,
      deals,
      pipelineStages,
      projectTasks,
      projectStages,
      transactions: newTransactions,
      activities,
      purchasedServices,
      settings,
    });
  };

  // Activities
  const addActivity = (activity: Omit<ClientActivity, 'id'>) => {
    const newActivity: ClientActivity = {
      ...activity,
      id: `act_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newActivities = [...activities, newActivity];
    setActivities(newActivities);

    saveCheckpoint({
      clients,
      services,
      meetings,
      deals,
      pipelineStages,
      projectTasks,
      projectStages,
      transactions,
      activities: newActivities,
      purchasedServices,
      settings,
    });
  };

  const updateActivity = (id: string, updates: Partial<ClientActivity>) => {
    const newActivities = activities.map((a) =>
      a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
    );
    setActivities(newActivities);

    saveCheckpoint({
      clients,
      services,
      meetings,
      deals,
      pipelineStages,
      projectTasks,
      projectStages,
      transactions,
      activities: newActivities,
      purchasedServices,
      settings,
    });
  };

  const deleteActivity = (id: string) => {
    const newActivities = activities.filter((a) => a.id !== id);
    setActivities(newActivities);

    saveCheckpoint({
      clients,
      services,
      meetings,
      deals,
      pipelineStages,
      projectTasks,
      projectStages,
      transactions,
      activities: newActivities,
      purchasedServices,
      settings,
    });
  };

  // Purchased Services
  const addPurchasedService = (service: Omit<PurchasedService, 'id'>) => {
    const newService: PurchasedService = {
      ...service,
      id: `purch_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newPurchasedServices = [...purchasedServices, newService];
    setPurchasedServices(newPurchasedServices);

    saveCheckpoint({
      clients,
      services,
      meetings,
      deals,
      pipelineStages,
      projectTasks,
      projectStages,
      transactions,
      activities,
      purchasedServices: newPurchasedServices,
      settings,
    });
  };

  const updatePurchasedService = (id: string, updates: Partial<PurchasedService>) => {
    const newPurchasedServices = purchasedServices.map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    setPurchasedServices(newPurchasedServices);

    saveCheckpoint({
      clients,
      services,
      meetings,
      deals,
      pipelineStages,
      projectTasks,
      projectStages,
      transactions,
      activities,
      purchasedServices: newPurchasedServices,
      settings,
    });
  };

  const deletePurchasedService = (id: string) => {
    const newPurchasedServices = purchasedServices.filter((p) => p.id !== id);
    setPurchasedServices(newPurchasedServices);

    saveCheckpoint({
      clients,
      services,
      meetings,
      deals,
      pipelineStages,
      projectTasks,
      projectStages,
      transactions,
      activities,
      purchasedServices: newPurchasedServices,
      settings,
    });
  };

  // Settings
  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    saveCheckpoint({
      clients,
      services,
      meetings,
      deals,
      pipelineStages,
      projectTasks,
      projectStages,
      transactions,
      activities,
      purchasedServices,
      settings: updatedSettings,
    });
  };

  // Undo/Redo
  const undo = () => {
    if (history.length === 0) return;

    const previousState = history[history.length - 1];
    const currentState: StoredData = {
      clients,
      services,
      meetings,
      deals,
      pipelineStages,
      projectTasks,
      projectStages,
      transactions,
      activities,
      purchasedServices,
      settings,
    };

    setClients(previousState.clients);
    setServices(previousState.services);
    setMeetings(previousState.meetings);
    setDeals(previousState.deals);
    setPipelineStages(previousState.pipelineStages);
    setProjectTasks(previousState.projectTasks);
    setProjectStages(previousState.projectStages);
    setTransactions(previousState.transactions);
    setActivities(previousState.activities);
    setPurchasedServices(previousState.purchasedServices);
    setSettings(previousState.settings);

    setHistory((prev) => prev.slice(0, -1));
    setFuture((prev) => [currentState, ...prev]);
  };

  const redo = () => {
    if (future.length === 0) return;

    const nextState = future[0];
    const currentState: StoredData = {
      clients,
      services,
      meetings,
      deals,
      pipelineStages,
      projectTasks,
      projectStages,
      transactions,
      activities,
      purchasedServices,
      settings,
    };

    setClients(nextState.clients);
    setServices(nextState.services);
    setMeetings(nextState.meetings);
    setDeals(nextState.deals);
    setPipelineStages(nextState.pipelineStages);
    setProjectTasks(nextState.projectTasks);
    setProjectStages(nextState.projectStages);
    setTransactions(nextState.transactions);
    setActivities(nextState.activities);
    setPurchasedServices(nextState.purchasedServices);
    setSettings(nextState.settings);

    setHistory((prev) => [...prev, currentState]);
    setFuture((prev) => prev.slice(1));
  };

  const resetHistory = () => {
    setHistory([]);
    setFuture([]);
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
        transactions,
        activities,
        purchasedServices,
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
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addActivity,
        updateActivity,
        deleteActivity,
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

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness deve ser usado dentro de BusinessProvider');
  }
  return context;
};
