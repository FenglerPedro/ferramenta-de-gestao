
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Client, Service, Meeting, BusinessSettings, Deal, PipelineStage, defaultPipelineStages, ProjectTask, ProjectStage, defaultProjectStages, Transaction, ClientActivity, PurchasedService, Installment } from '@/types';
import env from '@/config/env';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { format, parseISO, addMinutes, differenceInMinutes } from 'date-fns';

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

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

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

  // Fetch Data function
  const fetchData = async () => {
    if (!user) return;
    try {
      const [
        clientsRes,
        servicesRes,
        meetingsRes,
        dealsRes,
        pipesRes,
        projTasksRes,
        projStagesRes,
        transRes,
        actRes,
        purRes,
        settingsRes
      ] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('services').select('*'),
        supabase.from('meetings').select('*'),
        supabase.from('deals').select('*'),
        supabase.from('pipeline_stages').select('*').order('order'),
        supabase.from('project_tasks').select('*'),
        supabase.from('project_stages').select('*').order('order'),
        supabase.from('transactions').select('*'),
        supabase.from('client_activities').select('*'),
        supabase.from('purchased_services').select('*'),
        supabase.from('business_settings').select('*').single()
      ]);

      if (clientsRes.error) throw clientsRes.error;
      setClients(clientsRes.data?.map(c => ({
        ...c,
        purchaseDate: c.created_at,
        totalValue: c.total_value,
        sourceDealId: c.source_deal_id,
        isRecurring: false,
        services: []
      })) || []);

      if (servicesRes.error) throw servicesRes.error;
      setServices(servicesRes.data?.map(s => ({
        ...s,
        isRecurring: s.is_recurring
      })) || []);

      if (meetingsRes.error) throw meetingsRes.error;
      setMeetings(meetingsRes.data?.map(m => {
        const start = parseISO(m.start_time);
        const end = parseISO(m.end_time);
        return {
          id: m.id,
          title: m.title,
          description: m.description,
          clientName: m.client_name || '',
          clientEmail: m.client_email || '',
          date: format(start, 'yyyy-MM-dd'),
          time: format(start, 'HH:mm'),
          duration: differenceInMinutes(end, start),
          status: m.status as any,
          notes: m.notes
        };
      }) || []);

      if (dealsRes.error) throw dealsRes.error;
      setDeals(dealsRes.data?.map(d => ({
        id: d.id,
        title: d.title,
        value: d.value,
        clientId: d.client_id,
        clientName: d.client_name || '',
        clientEmail: d.client_email || '',
        clientPhone: d.client_phone || '',
        type: d.type as any,
        stageId: d.pipeline_stage_id,
        priority: d.priority,
        notes: d.notes,
        createdAt: d.created_at,
        updatedAt: d.updated_at
      })) || []);

      if (pipesRes.error) throw pipesRes.error;
      if (pipesRes.data && pipesRes.data.length > 0) {
        setPipelineStages(pipesRes.data);
      } else {
        setPipelineStages(defaultPipelineStages);
      }

      if (projTasksRes.error) throw projTasksRes.error;
      setProjectTasks(projTasksRes.data?.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        stageId: t.project_stage_id,
        clientId: t.client_id,
        priority: t.priority,
        assignedTo: t.assigned_to,
        dueDate: t.due_date,
        createdAt: t.created_at,
        updatedAt: t.updated_at
      })) || []);

      if (projStagesRes.error) throw projStagesRes.error;
      if (projStagesRes.data && projStagesRes.data.length > 0) {
        setProjectStages(projStagesRes.data);
      } else {
        setProjectStages(defaultProjectStages);
      }

      if (transRes.error) throw transRes.error;
      setTransactions(transRes.data?.map(t => ({
        id: t.id,
        clientId: t.client_id,
        description: t.description,
        amount: t.amount,
        status: t.status as any,
        date: t.date,
        paymentMethod: t.payment_method as any,
        serviceId: t.service_id,
        installmentId: t.installment_id
      })) || []);

      if (actRes.error) throw actRes.error;
      setActivities(actRes.data?.map(a => ({
        ...a,
        clientId: a.client_id
      })) || []);

      if (purRes.error) throw purRes.error;
      setPurchasedServices(purRes.data?.map(p => ({
        id: p.id,
        clientId: p.client_id,
        serviceName: p.service_name || '',
        type: p.type as any,
        value: p.value || 0,
        status: p.status as any,
        startDate: p.purchase_date,
        installments: p.installments as Installment[] || []
      })) || []);

      if (!settingsRes.error && settingsRes.data) {
        const settingsData = settingsRes.data;
        setSettings({
          businessName: settingsData.business_name || defaultSettings.businessName,
          ownerName: settingsData.owner_name || defaultSettings.ownerName,
          email: settingsData.email || defaultSettings.email,
          phone: settingsData.phone || defaultSettings.phone,
          meetingDuration: settingsData.meeting_duration || defaultSettings.meetingDuration,
          availableHours: settingsData.available_hours || defaultSettings.availableHours,
          availableDays: settingsData.available_days || defaultSettings.availableDays,
          daySchedules: settingsData.day_schedules || defaultSettings.daySchedules,
          blockedDates: settingsData.blocked_dates || defaultSettings.blockedDates,
          blockedTimeSlots: settingsData.blocked_time_slots || defaultSettings.blockedTimeSlots,
          logo: settingsData.logo,
          photo: settingsData.photo
        });
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados do servidor.');
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // --- CRUD Operations ---

  const addClient = async (client: Omit<Client, 'id'> & { id?: string }) => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('clients').insert([{
        user_id: user.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: (client as any).company, // Assuming client object has it
        notes: (client as any).notes,
        total_value: client.totalValue,
        photo: client.photo,
        source_deal_id: client.sourceDealId
      }]).select().single();

      if (error) throw error;
      setClients(prev => [...prev, { ...client, id: data.id, purchaseDate: data.created_at } as Client]);
      toast.success('Cliente adicionado!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar cliente.');
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    if (!user) return;
    try {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.email) dbUpdates.email = updates.email;
      if (updates.phone) dbUpdates.phone = updates.phone;
      if (updates.totalValue !== undefined) dbUpdates.total_value = updates.totalValue;
      if (updates.photo !== undefined) dbUpdates.photo = updates.photo;
      if ((updates as any).company !== undefined) dbUpdates.company = (updates as any).company;
      if ((updates as any).notes !== undefined) dbUpdates.notes = (updates as any).notes;

      const { error } = await supabase.from('clients').update(dbUpdates).eq('id', id);
      if (error) throw error;

      setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
      toast.success('Cliente atualizado!');
    } catch (error) {
      toast.error('Erro ao atualizar client.');
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) {
        console.error('Erro ao excluir cliente:', error);
        toast.error('Erro ao remover cliente. Verifique sua conexão.');
        return;
      }
      setClients(prev => prev.filter(c => c.id !== id));
      toast.success('Cliente removido.');
    } catch (e) {
      console.error('Erro ao remover:', e);
      toast.error('Erro ao remover.');
    }
  };

  const addService = async (service: Omit<Service, 'id'>) => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('services').insert([{
        user_id: user.id,
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        is_recurring: service.isRecurring
      }]).select().single();
      if (error) throw error;
      setServices(prev => [...prev, { ...service, id: data.id }]);
      toast.success('Serviço criado!');
    } catch (e) { toast.error('Erro ao criar serviço.'); }
  };

  const updateService = async (id: string, updates: Partial<Service>) => {
    try {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.price) dbUpdates.price = updates.price;
      if (updates.isRecurring !== undefined) dbUpdates.is_recurring = updates.isRecurring;

      await supabase.from('services').update(dbUpdates).eq('id', id);
      setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      toast.success('Atualizado!');
    } catch (e) { toast.error('Erro ao atualizar.'); }
  };

  const deleteService = async (id: string) => {
    await supabase.from('services').delete().eq('id', id);
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const addMeeting = async (meeting: Omit<Meeting, 'id'>) => {
    if (!user) return;
    // Convert date/time to timestamps
    const startDateTime = new Date(`${meeting.date}T${meeting.time}`);
    const endDateTime = addMinutes(startDateTime, meeting.duration);

    try {
      const { data, error } = await supabase.from('meetings').insert([{
        user_id: user.id,
        title: meeting.title,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        client_name: meeting.clientName,
        client_email: meeting.clientEmail,
        client_phone: meeting.clientPhone,
        notes: meeting.notes
      }]).select().single();
      if (error) throw error;
      setMeetings(prev => [...prev, { ...meeting, id: data.id }]);
      toast.success('Agendamento criado!');
    } catch (e) {
      console.error('Error adding meeting:', e);
      toast.error('Erro ao agendar. Verifique os dados.');
    }
  };

  const updateMeeting = async (id: string, meeting: Partial<Meeting>) => {
    const oldMeeting = meetings.find(m => m.id === id);
    if (!oldMeeting) return;
    const merged = { ...oldMeeting, ...meeting };

    const startDateTime = new Date(`${merged.date}T${merged.time}`);
    const endDateTime = addMinutes(startDateTime, merged.duration);

    try {
      await supabase.from('meetings').update({
        title: meeting.title,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        status: meeting.status,
        notes: meeting.notes
      }).eq('id', id);
      setMeetings(prev => prev.map(m => m.id === id ? { ...m, ...meeting } : m));
      toast.success('Atualizado!');
    } catch (e) { toast.error('Erro ao atualizar.'); }
  };

  const deleteMeeting = async (id: string) => {
    await supabase.from('meetings').delete().eq('id', id);
    setMeetings(prev => prev.filter(m => m.id !== id));
  };

  const addDeal = async (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('deals').insert([{
        user_id: user.id,
        title: deal.title,
        value: deal.value,
        client_id: deal.clientId,
        client_name: deal.clientName,
        client_email: deal.clientEmail,
        client_phone: deal.clientPhone,
        pipeline_stage_id: deal.stageId,
        type: deal.type,
        notes: deal.notes
      }]).select().single();
      if (error) throw error;
      setDeals(prev => [...prev, { ...deal, id: data.id, createdAt: data.created_at, updatedAt: data.updated_at }]);
      toast.success('Negócio criado!');
    } catch (e) { console.error(e); toast.error('Erro ao criar negócio.'); }
  };

  const updateDeal = async (id: string, updates: Partial<Deal>) => {
    try {
      const dbUpdates: any = {};
      if (updates.stageId) dbUpdates.pipeline_stage_id = updates.stageId;
      if (updates.title) dbUpdates.title = updates.title;
      // Map other fields as needed
      await supabase.from('deals').update(dbUpdates).eq('id', id);
      setDeals(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    } catch (e) { toast.error('Erro ao atualizar.'); }
  };

  const moveDeal = async (dealId: string, newStageId: string) => {
    if (!user) return;

    const deal = deals.find(d => d.id === dealId);
    if (!deal) return;

    // Optimistic update
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stageId: newStageId } : d));
    await supabase.from('deals').update({ pipeline_stage_id: newStageId }).eq('id', dealId);

    // If moved to "closed", create client and purchased service
    if (newStageId === 'closed') {
      try {
        // 1. Create Client
        const { data: clientData, error: clientError } = await supabase.from('clients').insert([{
          user_id: user.id,
          name: deal.clientName,
          email: deal.clientEmail,
          phone: deal.clientPhone,
          total_value: deal.value,
          source_deal_id: deal.id
        }]).select().single();

        if (clientError) {
          console.error('Error creating client:', clientError);
          toast.error('Erro ao criar cliente automaticamente.');
          return;
        }

        // Update local state
        const newClient = {
          id: clientData.id,
          name: deal.clientName,
          email: deal.clientEmail,
          phone: deal.clientPhone,
          totalValue: deal.value,
          sourceDealId: deal.id,
          purchaseDate: new Date().toISOString(),
          services: [],
          service: '',
          photo: '',
          isRecurring: deal.type === 'recurring',
          status: 'active' as const
        };
        setClients(prev => [...prev, newClient as any]);

        // 2. Create Purchased Service
        const { data: psData, error: psError } = await supabase.from('purchased_services').insert([{
          user_id: user.id,
          client_id: clientData.id,
          service_name: deal.title,
          type: deal.type,
          value: deal.value,
          status: 'active',
          purchase_date: new Date().toISOString(),
          installments: []
        }]).select().single();

        if (!psError && psData) {
          setPurchasedServices(prev => [...prev, {
            id: psData.id,
            clientId: clientData.id,
            serviceName: deal.title,
            type: deal.type as any,
            value: deal.value,
            status: 'active',
            startDate: new Date().toISOString(),
            installments: []
          }]);
        }

        // 3. Create Transaction (Pending) for Revenue Tracking
        const { data: transData, error: transError } = await supabase.from('transactions').insert([{
          user_id: user.id,
          client_id: clientData.id,
          description: `Venda: ${deal.title}`,
          amount: deal.value,
          type: 'income',
          status: 'completed', // Auto-complete for now as per user expectation of "Faturamento" update
          date: new Date().toISOString(),
          payment_method: 'other',
          service_id: psData?.id
        }]).select().single();

        if (!transError && transData) {
          setTransactions(prev => [...prev, {
            id: transData.id,
            clientId: clientData.id,
            description: transData.description,
            amount: transData.amount,
            status: transData.status as any,
            date: transData.date,
            paymentMethod: transData.payment_method as any,
            serviceId: transData.service_id,
            installmentId: transData.installment_id
          }]);
        }

        toast.success(`✅ ${deal.clientName} cadastrado como cliente e venda registrada!`);
      } catch (e) {
        console.error('Error in moveDeal closed flow:', e);
      }
    }
  };

  const deleteDeal = async (id: string) => {
    await supabase.from('deals').delete().eq('id', id);
    setDeals(prev => prev.filter(d => d.id !== id));
  };

  // Pipeline Stages
  const addPipelineStage = async (stage: Omit<PipelineStage, 'id' | 'order'>) => { /* To implement if needed, currently rarely used in UI */ };
  const updatePipelineStage = async (id: string, stage: Partial<PipelineStage>) => { /* To implement */ };
  const deletePipelineStage = async (id: string) => { /* To implement */ };
  const reorderPipelineStages = async (stages: PipelineStage[]) => { /* To implement: update 'order' field for all */ };

  // Project Tasks
  const addProjectTask = async (task: Omit<ProjectTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('project_tasks').insert([{
        user_id: user.id,
        title: task.title,
        description: task.description,
        client_id: task.clientId,
        project_stage_id: task.stageId,
        assigned_to: task.assignedTo,
        due_date: task.dueDate || null, // Handle empty string
        priority: task.priority || 'medium'
      }]).select().single();
      if (error) throw error;
      setProjectTasks(prev => [...prev, { ...task, id: data.id, createdAt: data.created_at, updatedAt: data.updated_at } as ProjectTask]);
      toast.success('Tarefa criada!');
    } catch (e) {
      console.error(e);
      toast.error('Erro ao criar tarefa. Verifique os dados.');
    }
  };

  const updateProjectTask = async (id: string, task: Partial<ProjectTask>) => {
    const dbUpdates: any = {};
    if (task.stageId) dbUpdates.project_stage_id = task.stageId;
    if (task.title) dbUpdates.title = task.title;
    // ... Map others
    await supabase.from('project_tasks').update(dbUpdates).eq('id', id);
    setProjectTasks(prev => prev.map(t => t.id === id ? { ...t, ...task } : t));
  };

  const deleteProjectTask = async (id: string) => {
    await supabase.from('project_tasks').delete().eq('id', id);
    setProjectTasks(prev => prev.filter(t => t.id !== id));
  };

  const moveProjectTask = async (taskId: string, newStageId: string) => {
    setProjectTasks(prev => prev.map(t => t.id === taskId ? { ...t, stageId: newStageId } : t));
    await supabase.from('project_tasks').update({ project_stage_id: newStageId }).eq('id', taskId);
  };

  // Project Stages (skipping impl for brevity, usually static-ish)
  const addProjectStage = (stage: Omit<ProjectStage, 'id' | 'order'>) => { };
  const updateProjectStage = (id: string, stage: Partial<ProjectStage>) => { };
  const deleteProjectStage = (id: string) => { };
  const reorderProjectStages = (stages: ProjectStage[]) => { };

  // Transactions
  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('transactions').insert([{
        user_id: user.id,
        client_id: transaction.clientId,
        description: transaction.description,
        amount: transaction.amount,
        status: transaction.status,
        type: transaction.amount > 0 ? 'income' : 'expense',
        date: transaction.date,
        payment_method: transaction.paymentMethod,
        service_id: transaction.serviceId,
        installment_id: transaction.installmentId
      }]).select().single();
      if (error) throw error;
      setTransactions(prev => [...prev, { ...transaction, id: data.id }]);
    } catch (e) { toast.error('Erro ao criar transação.'); }
  };
  const updateTransaction = (id: string, transaction: Partial<Transaction>) => { };
  const deleteTransaction = async (id: string) => {
    await supabase.from('transactions').delete().eq('id', id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Activities
  const addActivity = async (activity: Omit<ClientActivity, 'id'>) => {
    if (!user) return;
    const { data } = await supabase.from('client_activities').insert([{
      user_id: user.id,
      client_id: activity.clientId,
      type: activity.type,
      description: activity.description,
      date: activity.date,
      // title?
    }]).select().single();
    if (data) setActivities(prev => [...prev, { ...activity, id: data.id }]);
  };
  const updateActivity = (id: string, activity: Partial<ClientActivity>) => { };
  const deleteActivity = (id: string) => { };

  // Purchased Service
  const addPurchasedService = async (service: Omit<PurchasedService, 'id'>) => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('purchased_services').insert([{
        user_id: user.id,
        client_id: service.clientId,
        service_name: service.serviceName,
        type: service.type,
        value: service.value,
        status: service.status,
        purchase_date: service.startDate,
        installments: service.installments as any
      }]).select().single();
      if (error) throw error;
      setPurchasedServices(prev => [...prev, { ...service, id: data.id }]);
    } catch (e) { toast.error('Erro ao adicionar serviço.'); }
  };

  const updatePurchasedService = async (id: string, service: Partial<PurchasedService>) => {
    const dbUpdates: any = {};
    if (service.status) dbUpdates.status = service.status;
    if (service.installments) dbUpdates.installments = service.installments;
    // ...
    await supabase.from('purchased_services').update(dbUpdates).eq('id', id);
    setPurchasedServices(prev => prev.map(s => s.id === id ? { ...s, ...service } : s));
  };

  const deletePurchasedService = async (id: string) => {
    await supabase.from('purchased_services').delete().eq('id', id);
    setPurchasedServices(prev => prev.filter(s => s.id !== id));
  };

  // Settings
  const updateSettings = async (newSettings: Partial<BusinessSettings>) => {
    if (!user) return;
    const updated = { ...settings, ...newSettings };
    setSettings(updated); // Optimistic

    const dbPayload = {
      user_id: user.id,
      business_name: updated.businessName,
      owner_name: updated.ownerName,
      email: updated.email,
      phone: updated.phone,
      available_hours: updated.availableHours,
      available_days: updated.availableDays,
      day_schedules: updated.daySchedules,
      blocked_time_slots: updated.blockedTimeSlots,
      logo: updated.logo,
      photo: updated.photo
    };

    // Upsert
    await supabase.from('business_settings').upsert(dbPayload, { onConflict: 'user_id' });
  };

  // Undo/Redo Stubs
  const undo = () => { toast.info('Funcionalidade de desfazer em desenvolvimento.'); };
  const redo = () => { toast.info('Funcionalidade de refazer em desenvolvimento.'); };
  const resetHistory = () => { };
  const canUndo = false;
  const canRedo = false;

  return (
    <BusinessContext.Provider
      value={{
        clients, services, meetings, deals, pipelineStages, projectTasks, projectStages,
        transactions, activities, purchasedServices, settings,
        addClient, updateClient, deleteClient,
        addService, updateService, deleteService,
        addMeeting, updateMeeting, deleteMeeting,
        addDeal, updateDeal, deleteDeal, moveDeal,
        addPipelineStage, updatePipelineStage, deletePipelineStage, reorderPipelineStages,
        addProjectTask, updateProjectTask, deleteProjectTask, moveProjectTask,
        addProjectStage, updateProjectStage, deleteProjectStage, reorderProjectStages,
        addTransaction, updateTransaction, deleteTransaction,
        addActivity, updateActivity, deleteActivity,
        addPurchasedService, updatePurchasedService, deletePurchasedService,
        updateSettings,
        undo, redo, resetHistory, canUndo, canRedo
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) throw new Error('useBusiness must be used within BusinessProvider');
  return context;
};
