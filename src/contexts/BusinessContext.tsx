import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
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

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Initialize with defaults - Supabase will populate this
  const [clients, setClients] = useState<Client[]>(defaultClients);
  const [services, setServices] = useState<Service[]>(defaultServices);
  const [meetings, setMeetings] = useState<Meeting[]>(defaultMeetings);
  const [deals, setDeals] = useState<Deal[]>(defaultDeals);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>(defaultPipelineStages);
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([]);
  const [projectStages, setProjectStages] = useState<ProjectStage[]>(defaultProjectStages);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activities, setActivities] = useState<ClientActivity[]>([]);
  const [purchasedServices, setPurchasedServices] = useState<PurchasedService[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(defaultSettings);

  // Undo/Redo State
  const [history, setHistory] = useState<StoredData[]>([]);
  const [future, setFuture] = useState<StoredData[]>([]);

  // Fetch data from Supabase
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Profiles (Settings)
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        const { data: settingsData } = await supabase.from('settings').select('*').eq('user_id', user.id).single();
        
        if (profileData || settingsData) {
           const mergedSettings: BusinessSettings = {
             ...defaultSettings,
             ...(settingsData?.config || {}),
             businessName: profileData?.business_name || defaultSettings.businessName,
             ownerName: profileData?.owner_name || defaultSettings.ownerName,
             email: profileData?.email || defaultSettings.email,
             phone: profileData?.phone || defaultSettings.phone,
           };
           setSettings(mergedSettings);
        }

        // Fetch Clients - FILTRA POR USER_ID
        const { data: clientsData } = await supabase.from('clients').select('*, client_services(services(name))').eq('user_id', user.id);
        if (clientsData) {
          const mappedClients = clientsData.map((c: any) => ({
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone,
            service: c.service_interest || '',
            services: c.client_services?.map((cs: any) => cs.services?.name).filter(Boolean) || [],
            totalValue: Number(c.total_value),
            purchaseDate: c.purchase_date,
            isRecurring: c.is_recurring,
            monthlyValue: Number(c.monthly_value),
            status: c.status,
            photo: c.photo
          }));
          setClients(mappedClients);
        }

        // Fetch Services - FILTRA POR USER_ID
        const { data: servicesData } = await supabase.from('services').select('*').eq('user_id', user.id);
        if (servicesData) {
           setServices(servicesData.map((s: any) => ({
             ...s,
             isRecurring: s.is_recurring
           })));
        }

        // Fetch Meetings - FILTRA POR USER_ID
        const { data: meetingsData } = await supabase.from('meetings').select('*').eq('user_id', user.id);
        if (meetingsData) {
          setMeetings(meetingsData.map((m: any) => ({
             id: m.id,
             clientName: m.client_name,
             clientEmail: m.client_email,
             date: m.date,
             time: m.time,
             duration: m.duration,
             status: m.status,
             notes: m.notes || undefined
          })));
        }

        // Fetch Deals - FILTRA POR USER_ID
        const { data: dealsData } = await supabase.from('deals').select('*').eq('user_id', user.id);
        if (dealsData) {
           setDeals(dealsData.map((d: any) => ({
             id: d.id,
             stageId: d.pipeline_stage_id,
             title: d.title,
             value: Number(d.value),
             clientName: d.client_name,
             clientEmail: d.client_email,
             clientPhone: d.client_phone,
             notes: d.notes,
             createdAt: d.created_at,
             updatedAt: d.updated_at,
             type: 'one-time'
           })));
        }
        
        // Fetch Pipeline Stages - FILTRA POR USER_ID
        const { data: pipelineData } = await supabase.from('pipeline_stages').select('*').eq('user_id', user.id).order('order');
        if (pipelineData && pipelineData.length > 0) {
           setPipelineStages(pipelineData.map((p: any) => ({
             id: p.id,
             name: p.name,
             color: p.color,
             order: p.order
           })));
        }

        // Fetch Project Stages - FILTRA POR USER_ID
        const { data: projectStagesData } = await supabase.from('project_stages').select('*').eq('user_id', user.id).order('order');
        if (projectStagesData && projectStagesData.length > 0) {
           setProjectStages(projectStagesData.map((p: any) => ({
             id: p.id,
             name: p.name,
             color: p.color,
             order: p.order
           })));
        }

        // Fetch Project Tasks - FILTRA POR USER_ID
        const { data: tasksData } = await supabase.from('project_tasks').select('*').eq('user_id', user.id);
        if (tasksData) {
           setProjectTasks(tasksData.map((t: any) => ({
             id: t.id,
             stageId: t.project_stage_id,
             title: t.title,
             description: t.description,
             priority: t.priority,
             dueDate: t.due_date,
             clientId: t.client_id,
             createdAt: t.created_at,
             updatedAt: t.updated_at
           })));
        }
        
        // Fetch Transactions - FILTRA POR USER_ID
        const { data: transactionsData } = await supabase.from('transactions').select('*').eq('user_id', user.id);
        if (transactionsData) {
           setTransactions(transactionsData.map((t: any) => ({
             id: t.id,
             clientId: t.client_id,
             date: t.date,
             amount: Number(t.amount),
             description: t.description,
             status: t.status,
             paymentMethod: t.payment_method
           })));
        }
        
        // Fetch Activities - FILTRA POR USER_ID
        const { data: activitiesData } = await supabase.from('client_activities').select('*').eq('user_id', user.id);
        if (activitiesData) {
           setActivities(activitiesData.map((a: any) => ({
             id: a.id,
             clientId: a.client_id,
             type: a.type,
             title: a.title,
             description: a.description,
             date: a.date,
             userId: a.user_id
           })));
        }
        
        // Fetch Purchased Services & Installments - FILTRA POR USER_ID
        const { data: purchasedData } = await supabase.from('purchased_services').select('*, installments(*)').eq('user_id', user.id);
        if (purchasedData) {
           setPurchasedServices(purchasedData.map((p: any) => ({
             id: p.id,
             clientId: p.client_id,
             serviceName: p.service_name,
             type: p.type,
             value: Number(p.value),
             status: p.status,
             startDate: p.start_date,
             recurrenceInterval: p.recurrence_interval,
             transactionId: p.transaction_id,
             installments: p.installments?.map((i: any) => ({
               id: i.id,
               serviceId: i.service_id,
               dueDate: i.due_date,
               value: Number(i.value),
               status: i.status,
               paymentDate: i.payment_date,
               transactionId: i.transaction_id,
               number: i.number
             })) || []
           })));
        }

      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

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

  const resetHistory = React.useCallback(() => {
    setHistory([]);
    setFuture([]);
  }, []);

  const generateId = () => {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
          return crypto.randomUUID();
      }
      return Math.random().toString(36).substr(2, 9);
  };

  // Client functions
  const addClient = async (client: Omit<Client, 'id'> & { id?: string }) => {
    saveCheckpoint();
    const newId = client.id || generateId();
    const newClient = { ...client, id: newId };
    setClients([...clients, newClient]);

    if (user) {
        const { error } = await supabase.from('clients').insert({
          id: newId,
          user_id: user.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          service_interest: client.service,
          total_value: client.totalValue,
          monthly_value: client.monthlyValue,
          purchase_date: client.purchaseDate,
          is_recurring: client.isRecurring,
          status: client.status,
          photo: client.photo
        });
        if (error) console.error('Error adding client:', error);
        
        if (client.services && client.services.length > 0) {
            const serviceIds = services.filter(s => client.services?.includes(s.name)).map(s => s.id);
            if (serviceIds.length > 0) {
                 const clientServices = serviceIds.map(sid => ({
                     client_id: newId,
                     service_id: sid
                 }));
                 const { error: csError } = await supabase.from('client_services').insert(clientServices);
                 if (csError) console.error('Error adding client services:', csError);
            }
        }
    }
  };

  const updateClient = async (id: string, client: Partial<Client>) => {
    saveCheckpoint();
    setClients(clients.map(c => c.id === id ? { ...c, ...client } : c));

    if (user) {
        const updates: any = {};
        if (client.name !== undefined) updates.name = client.name;
        if (client.email !== undefined) updates.email = client.email;
        if (client.phone !== undefined) updates.phone = client.phone;
        if (client.service !== undefined) updates.service_interest = client.service;
        if (client.totalValue !== undefined) updates.total_value = client.totalValue;
        if (client.monthlyValue !== undefined) updates.monthly_value = client.monthlyValue;
        if (client.purchaseDate !== undefined) updates.purchase_date = client.purchaseDate;
        if (client.isRecurring !== undefined) updates.is_recurring = client.isRecurring;
        if (client.status !== undefined) updates.status = client.status;
        if (client.photo !== undefined) updates.photo = client.photo;

        const { error } = await supabase.from('clients').update(updates).eq('id', id).eq('user_id', user.id);
        if (error) console.error('Error updating client:', error);

        if (client.services !== undefined) {
             await supabase.from('client_services').delete().eq('client_id', id);
             const serviceIds = services.filter(s => client.services?.includes(s.name)).map(s => s.id);
             if (serviceIds.length > 0) {
                 const clientServices = serviceIds.map(sid => ({
                     client_id: id,
                     service_id: sid
                 }));
                 await supabase.from('client_services').insert(clientServices);
            }
        }
    }
  };

  const deleteClient = async (id: string) => {
    saveCheckpoint();
    setClients(clients.filter(c => c.id !== id));
    if (user) {
        const { error } = await supabase.from('clients').delete().eq('id', id).eq('user_id', user.id);
        if (error) console.error('Error deleting client:', error);
    }
  };

  // Service functions
  const addService = async (service: Omit<Service, 'id'>) => {
    saveCheckpoint();
    const newId = generateId();
    setServices([...services, { ...service, id: newId }]);

    if (user) {
        const { error } = await supabase.from('services').insert({
            id: newId,
            user_id: user.id,
            name: service.name,
            description: service.description,
            price: service.price,
            duration: service.duration,
            is_recurring: service.isRecurring
        });
        if (error) console.error('Error adding service:', error);
    }
  };

  const updateService = async (id: string, service: Partial<Service>) => {
    saveCheckpoint();
    setServices(services.map(s => s.id === id ? { ...s, ...service } : s));

    if (user) {
        const updates: any = {};
        if (service.name !== undefined) updates.name = service.name;
        if (service.description !== undefined) updates.description = service.description;
        if (service.price !== undefined) updates.price = service.price;
        if (service.duration !== undefined) updates.duration = service.duration;
        if (service.isRecurring !== undefined) updates.is_recurring = service.isRecurring;

        const { error } = await supabase.from('services').update(updates).eq('id', id).eq('user_id', user.id);
        if (error) console.error('Error updating service:', error);
    }
  };

  const deleteService = async (id: string) => {
    saveCheckpoint();
    setServices(services.filter(s => s.id !== id));
    if (user) {
        const { error } = await supabase.from('services').delete().eq('id', id).eq('user_id', user.id);
        if (error) console.error('Error deleting service:', error);
    }
  };

  // Meeting functions
  const addMeeting = async (meeting: Omit<Meeting, 'id'>) => {
    saveCheckpoint();
    const newId = generateId();
    setMeetings([...meetings, { ...meeting, id: newId }]);

    if (user) {
        const { error } = await supabase.from('meetings').insert({
            id: newId,
            user_id: user.id,
            client_name: meeting.clientName,
            client_email: meeting.clientEmail,
            date: meeting.date,
            time: meeting.time,
            duration: meeting.duration,
            status: meeting.status,
            notes: meeting.notes
        });
        if (error) console.error('Error adding meeting:', error);
    }
  };

  const updateMeeting = async (id: string, meeting: Partial<Meeting>) => {
    saveCheckpoint();
    setMeetings(meetings.map(m => m.id === id ? { ...m, ...meeting } : m));

    if (user) {
        const updates: any = {};
        if (meeting.clientName !== undefined) updates.client_name = meeting.clientName;
        if (meeting.clientEmail !== undefined) updates.client_email = meeting.clientEmail;
        if (meeting.date !== undefined) updates.date = meeting.date;
        if (meeting.time !== undefined) updates.time = meeting.time;
        if (meeting.duration !== undefined) updates.duration = meeting.duration;
        if (meeting.status !== undefined) updates.status = meeting.status;
        if (meeting.notes !== undefined) updates.notes = meeting.notes;

        const { error } = await supabase.from('meetings').update(updates).eq('id', id).eq('user_id', user.id);
        if (error) console.error('Error updating meeting:', error);
    }
  };

  const deleteMeeting = async (id: string) => {
    saveCheckpoint();
    setMeetings(meetings.filter(m => m.id !== id));
    if (user) {
        const { error } = await supabase.from('meetings').delete().eq('id', id).eq('user_id', user.id);
        if (error) console.error('Error deleting meeting:', error);
    }
  };

  // Deal functions
  const addDeal = async (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => {
    saveCheckpoint();
    const now = new Date().toISOString().split('T')[0];
    const newId = generateId();
    setDeals([...deals, { ...deal, id: newId, createdAt: now, updatedAt: now }]);

    if (user) {
        const { error } = await supabase.from('deals').insert({
            id: newId,
            user_id: user.id,
            pipeline_stage_id: deal.stageId,
            title: deal.title,
            value: deal.value,
            client_name: deal.clientName,
            client_email: deal.clientEmail,
            client_phone: deal.clientPhone,
            notes: deal.notes
        });
        if (error) console.error('Error adding deal:', error);
    }
  };

  const updateDeal = async (id: string, deal: Partial<Deal>) => {
    saveCheckpoint();
    const now = new Date().toISOString().split('T')[0];
    setDeals(deals.map(d => d.id === id ? { ...d, ...deal, updatedAt: now } : d));

    if (user) {
        const updates: any = { updated_at: new Date().toISOString() };
        if (deal.stageId !== undefined) updates.pipeline_stage_id = deal.stageId;
        if (deal.title !== undefined) updates.title = deal.title;
        if (deal.value !== undefined) updates.value = deal.value;
        if (deal.clientName !== undefined) updates.client_name = deal.clientName;
        if (deal.clientEmail !== undefined) updates.client_email = deal.clientEmail;
        if (deal.clientPhone !== undefined) updates.client_phone = deal.clientPhone;
        if (deal.notes !== undefined) updates.notes = deal.notes;

        const { error } = await supabase.from('deals').update(updates).eq('id', id).eq('user_id', user.id);
        if (error) console.error('Error updating deal:', error);
    }
  };

  const deleteDeal = async (id: string) => {
    saveCheckpoint();
    setDeals(deals.filter(d => d.id !== id));
    if (user) {
        const { error } = await supabase.from('deals').delete().eq('id', id).eq('user_id', user.id);
        if (error) console.error('Error deleting deal:', error);
    }
  };


  const moveDeal = async (dealId: string, newStageId: string) => {
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

        await addClient({ ...newClient, id: clientId });

        const newService: Omit<PurchasedService, 'id'> = {
          clientId: clientId,
          serviceName: deal.title,
          type: deal.type || 'one-time',
          value: deal.value,
          status: 'active',
          startDate: now,
        };
        await addPurchasedService(newService);

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
          await addPurchasedService(newService);

          const currentTotal = client.totalValue || 0;
          await updateClient(client.id, { totalValue: currentTotal + deal.value });
        }
      }
    } else if (!isClosedStage && deal) {
      const clientToRemove = clients.find(c => c.sourceDealId === deal.id);
      if (clientToRemove) {
        await deleteClient(clientToRemove.id);
      }
    }

    setDeals(prevDeals => prevDeals.map(d => d.id === dealId ? { ...d, stageId: newStageId, updatedAt: now } : d));
    
    if (user) {
         const { error } = await supabase.from('deals').update({ 
            pipeline_stage_id: newStageId, 
            updated_at: new Date().toISOString() 
        }).eq('id', dealId).eq('user_id', user.id);
        if (error) console.error('Error moving deal:', error);
    }
  };

  // Pipeline Stage functions
  const addPipelineStage = async (stage: Omit<PipelineStage, 'id' | 'order'>) => {
    saveCheckpoint();
    const maxOrder = Math.max(...pipelineStages.map(s => s.order), -1);
    const newId = generateId();
    const newOrder = maxOrder + 1;
    setPipelineStages([...pipelineStages, { ...stage, id: newId, order: newOrder }]);

    if (user) {
        const { error } = await supabase.from('pipeline_stages').insert({
            id: newId,
            user_id: user.id,
            name: stage.name,
            color: stage.color,
            order: newOrder
        });
        if (error) console.error('Error adding pipeline stage:', error);
    }
  };

  const updatePipelineStage = async (id: string, stage: Partial<PipelineStage>) => {
    saveCheckpoint();
    setPipelineStages(pipelineStages.map(s => s.id === id ? { ...s, ...stage } : s));
    
    if (user) {
        const updates: any = {};
        if (stage.name !== undefined) updates.name = stage.name;
        if (stage.color !== undefined) updates.color = stage.color;
        if (stage.order !== undefined) updates.order = stage.order;

        const { error } = await supabase.from('pipeline_stages').update(updates).eq('id', id).eq('user_id', user.id);
        if (error) console.error('Error updating pipeline stage:', error);
    }
  };

  const deletePipelineStage = async (id: string) => {
    saveCheckpoint();
    const remainingStages = pipelineStages.filter(s => s.id !== id);
    if (remainingStages.length > 0) {
      const firstStage = remainingStages.sort((a, b) => a.order - b.order)[0];
      setDeals(deals.map(d => d.stageId === id ? { ...d, stageId: firstStage.id } : d));
      if (user) {
          await supabase.from('deals').update({ pipeline_stage_id: firstStage.id }).eq('pipeline_stage_id', id).eq('user_id', user.id);
      }
    }
    setPipelineStages(remainingStages);
    
    if (user) {
        const { error } = await supabase.from('pipeline_stages').delete().eq('id', id).eq('user_id', user.id);
        if (error) console.error('Error deleting pipeline stage:', error);
    }
  };

  const reorderPipelineStages = async (newStages: PipelineStage[]) => {
    saveCheckpoint();
    setPipelineStages(newStages.map((s, index) => ({ ...s, order: index })));
    
    if (user) {
        const updates = newStages.map((s, index) => ({
            id: s.id,
            user_id: user.id,
            name: s.name,
            color: s.color,
            order: index
        }));
        for (const update of updates) {
            await supabase.from('pipeline_stages').update(update).eq('id', update.id).eq('user_id', user.id);
        }
    }
  };

  // Project Task functions
  const addProjectTask = async (task: Omit<ProjectTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    saveCheckpoint();
    const now = new Date().toISOString().split('T')[0];
    const newId = generateId();
    const newTask = { ...task, id: newId, createdAt: now, updatedAt: now };
    setProjectTasks([...projectTasks, newTask]);

    if (user) {
        const { error } = await supabase.from('project_tasks').insert({
            id: newId,
            user_id: user.id,
            title: task.title,
            description: task.description,
            project_stage_id: task.stageId,
            priority: task.priority,
            due_date: task.dueDate,
            created_at: now,
            updated_at: now
        });
        if (error) console.error('Error adding project task:', error);
    }
  };

  const updateProjectTask = async (id: string, task: Partial<ProjectTask>) => {
    saveCheckpoint();
    const now = new Date().toISOString().split('T')[0];
    setProjectTasks(projectTasks.map(t => t.id === id ? { ...t, ...task, updatedAt: now } : t));

    if (user) {
        const updates: any = { updated_at: now };
        if (task.title !== undefined) updates.title = task.title;
        if (task.description !== undefined) updates.description = task.description;
        if (task.stageId !== undefined) updates.project_stage_id = task.stageId;
        if (task.priority !== undefined) updates.priority = task.priority;
        if (task.dueDate !== undefined) updates.due_date = task.dueDate;

        const { error } = await supabase.from('project_tasks').update(updates).eq('id', id).eq('user_id', user.id);
        if (error) console.error('Error updating project task:', error);
    }
  };

  const deleteProjectTask = async (id: string) => {
    saveCheckpoint();
    setProjectTasks(projectTasks.filter(t => t.id !== id));
    
    if (user) {
        const { error } = await supabase.from('project_tasks').delete().eq('id', id).eq('user_id', user.id);
        if (error) console.error('Error deleting project task:', error);
    }
  };

  const moveProjectTask = async (taskId: string, newStageId: string) => {
    saveCheckpoint();
    const now = new Date().toISOString().split('T')[0];
    setProjectTasks(projectTasks.map(t => t.id === taskId ? { ...t, stageId: newStageId, updatedAt: now } : t));

    if (user) {
        const { error } = await supabase.from('project_tasks').update({ 
            project_stage_id: newStageId,
            updated_at: now
        }).eq('id', taskId).eq('user_id', user.id);
        if (error) console.error('Error moving project task:', error);
    }
  };

  // Project Stage functions
  const addProjectStage = async (stage: Omit<ProjectStage, 'id' | 'order'>) => {
    saveCheckpoint();
    const maxOrder = Math.max(...projectStages.map(s => s.order), -1);
    const newId = generateId();
    const newOrder = maxOrder + 1;
    setProjectStages([...projectStages, { ...stage, id: newId, order: newOrder }]);

    if (user) {
        const { error } = await supabase.from('project_stages').insert({
            id: newId,
            user_id: user.id,
            name: stage.name,
            order: newOrder
        });
        if (error) console.error('Error adding project stage:', error);
    }
  };

  const updateProjectStage = async (id: string, stage: Partial<ProjectStage>) => {
    saveCheckpoint();
    setProjectStages(projectStages.map(s => s.id === id ? { ...s, ...stage } : s));

    if (user) {
        const updates: any = {};
        if (stage.name !== undefined) updates.name = stage.name;
        if (stage.order !== undefined) updates.order = stage.order;
        
        const { error } = await supabase.from('project_stages').update(updates).eq('id', id).eq('user_id', user.id);
        if (error) console.error('Error updating project stage:', error);
    }
  };

  const deleteProjectStage = async (id: string) => {
    saveCheckpoint();
    const remainingStages = projectStages.filter(s => s.id !== id);
    if (remainingStages.length > 0) {
      const firstStage = remainingStages.sort((a, b) => a.order - b.order)[0];
      setProjectTasks(projectTasks.map(t => t.stageId === id ? { ...t, stageId: firstStage.id } : t));
      
      if (user) {
          await supabase.from('project_tasks').update({ project_stage_id: firstStage.id }).eq('project_stage_id', id).eq('user_id', user.id);
      }
    }
    setProjectStages(remainingStages);

    if (user) {
        const { error } = await supabase.from('project_stages').delete().eq('id', id).eq('user_id', user.id);
        if (error) console.error('Error deleting project stage:', error);
    }
  };

  const reorderProjectStages = async (newStages: ProjectStage[]) => {
    saveCheckpoint();
    setProjectStages(newStages.map((s, index) => ({ ...s, order: index })));

    if (user) {
        const updates = newStages.map((s, index) => ({
            id: s.id,
            user_id: user.id,
            name: s.name,
            order: index
        }));
        for (const update of updates) {
            await supabase.from('project_stages').update(update).eq('id', update.id).eq('user_id', user.id);
        }
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    saveCheckpoint();
    const newId = generateId();
    setTransactions([...transactions, { ...transaction, id: newId }]);

    if (user) {
        const { error } = await supabase.from('transactions').insert({
            id: newId,
            user_id: user.id,
            description: transaction.description,
            amount: transaction.amount,
            type: transaction.type,
            category: transaction.category,
            date: transaction.date,
            status: transaction.status,
            client_id: transaction.clientId || null
        });
        if (error) console.error('Error adding transaction:', error);
    }
  };

  const updateTransaction = async (id: string, transaction: Partial<Transaction>) => {
    saveCheckpoint();
    setTransactions(transactions.map(t => t.id === id ? { ...t, ...transaction } : t));

    if (user) {
        const updates: any = {};
        if (transaction.description !== undefined) updates.description = transaction.description;
        if (transaction.amount !== undefined) updates.amount = transaction.amount;
        if (transaction.type !== undefined) updates.type = transaction.type;
        if (transaction.category !== undefined) updates.category = transaction.category;
        if (transaction.date !== undefined) updates.date = transaction.date;
        if (transaction.status !== undefined) updates.status = transaction.status;
        if (transaction.clientId !== undefined) updates.client_id = transaction.clientId || null;

        const { error } = await supabase.from('transactions').update(updates).eq('id', id).eq('user_id', user.id);
        if (error) console.error('Error updating transaction:', error);
    }
  };

  const deleteTransaction = async (id: string) => {
    saveCheckpoint();
    setTransactions(transactions.filter(t => t.id !== id));

    if (user) {
        const { error } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', user.id);
        if (error) console.error('Error deleting transaction:', error);
    }
  };

  // Activity functions
  const addActivity = async (activity: Omit<ClientActivity, 'id'>) => {
    saveCheckpoint();
    const newId = generateId();
    setActivities([...activities, { ...activity, id: newId }]);

    if (user) {
        const { error } = await supabase.from('client_activities').insert({
            id: newId,
            user_id: user.id,
            client_id: activity.clientId,
            type: activity.type,
            description: activity.description,
            date: activity.date
        });
        if (error) console.error('Error adding activity:', error);
    }
  };

  const updateActivity = async (id: string, activity: Partial<ClientActivity>) => {
    saveCheckpoint();
    setActivities(activities.map(a => a.id === id ? { ...a, ...activity } : a));

    if (user) {
        const updates: any = {};
        if (activity.clientId !== undefined) updates.client_id = activity.clientId;
        if (activity.type !== undefined) updates.type = activity.type;
        if (activity.description !== undefined) updates.description = activity.description;
        if (activity.date !== undefined) updates.date = activity.date;

        const { error } = await supabase.from('client_activities').update(updates).eq('id', id).eq('user_id', user.id);
        if (error) console.error('Error updating activity:', error);
    }
  };

  const deleteActivity = async (id: string) => {
    saveCheckpoint();
    setActivities(activities.filter(a => a.id !== id));

    if (user) {
        const { error } = await supabase.from('client_activities').delete().eq('id', id).eq('user_id', user.id);
        if (error) console.error('Error deleting activity:', error);
    }
  };

  const addPurchasedService = async (service: Omit<PurchasedService, 'id'>) => {
    saveCheckpoint();
    const newId = generateId();
    setPurchasedServices([...purchasedServices, { ...service, id: newId }]);

    if (user) {
        const { error } = await supabase.from('purchased_services').insert({
            id: newId,
            user_id: user.id,
            client_id: service.clientId,
            service_id: service.serviceId,
            name: service.name,
            value: service.value,
            start_date: service.startDate,
            status: service.status,
            next_billing_date: service.nextBillingDate
        });
        if (error) console.error('Error adding purchased service:', error);
    }
  };

  const updatePurchasedService = async (id: string, service: Partial<PurchasedService>) => {
    saveCheckpoint();
    setPurchasedServices(purchasedServices.map(s => s.id === id ? { ...s, ...service } : s));

    if (user) {
        const updates: any = {};
        if (service.clientId !== undefined) updates.client_id = service.clientId;
        if (service.serviceId !== undefined) updates.service_id = service.serviceId;
        if (service.name !== undefined) updates.name = service.name;
        if (service.value !== undefined) updates.value = service.value;
        if (service.startDate !== undefined) updates.start_date = service.startDate;
        if (service.status !== undefined) updates.status = service.status;
        if (service.nextBillingDate !== undefined) updates.next_billing_date = service.nextBillingDate;

        const { error } = await supabase.from('purchased_services').update(updates).eq('id', id).eq('user_id', user.id);
        if (error) console.error('Error updating purchased service:', error);
    }
  };

  const deletePurchasedService = async (id: string) => {
    saveCheckpoint();
    setPurchasedServices(purchasedServices.filter(s => s.id !== id));

    if (user) {
        const { error } = await supabase.from('purchased_services').delete().eq('id', id).eq('user_id', user.id);
        if (error) console.error('Error deleting purchased service:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<BusinessSettings>) => {
    saveCheckpoint();
    const mergedSettings = { ...settings, ...newSettings };
    setSettings(mergedSettings);

    if (user) {
        // Update profile
        const profileUpdates: any = {};
        if (newSettings.businessName !== undefined) profileUpdates.business_name = newSettings.businessName;
        if (newSettings.ownerName !== undefined) profileUpdates.owner_name = newSettings.ownerName;
        if (newSettings.email !== undefined) profileUpdates.email = newSettings.email;
        if (newSettings.phone !== undefined) profileUpdates.phone = newSettings.phone;
        
        if (Object.keys(profileUpdates).length > 0) {
             const { error } = await supabase.from('profiles').update(profileUpdates).eq('id', user.id);
             if (error) console.error('Error updating profile:', error);
        }

        // Update settings config
        // We store the full settings object minus the profile fields in the 'config' column of 'settings' table
        const { businessName, ownerName, email, phone, ...configSettings } = mergedSettings;
        const { error: settingsError } = await supabase.from('settings').upsert({
            user_id: user.id,
            config: configSettings
        }, { onConflict: 'user_id' });
        if (settingsError) console.error('Error updating settings:', settingsError);
    }
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
