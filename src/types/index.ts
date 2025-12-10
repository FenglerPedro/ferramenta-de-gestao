export interface Client {
  id: string;
  name: string;
  email?: string; // Email agora é opcional
  phone: string;
  service: string; // Mantido para compatibilidade
  services?: string[]; // Novo: múltiplos serviços
  totalValue: number;
  purchaseDate: string;
  isRecurring: boolean;
  monthlyValue?: number;
  status: 'active' | 'inactive' | 'pending';
  sourceDealId?: string;
  photo?: string;
}

export interface Transaction {
  id: string;
  clientId: string;
  date: string; // ISO date string
  amount: number;
  description: string;
  status: 'paid' | 'pending' | 'cancelled';
  paymentMethod?: 'credit_card' | 'pix' | 'boleto' | 'transfer' | 'cash';
}

export interface ClientActivity {
  id: string;
  clientId: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'system';
  title: string;
  description?: string;
  date: string; // ISO date string
  userId?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  isRecurring: boolean;
}

export interface Meeting {
  id: string;
  clientName: string;
  clientEmail: string;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface BlockedDate {
  id: string;
  date: string;
  reason?: string;
}

export interface BlockedTimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

export interface DaySchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export interface BusinessSettings {
  businessName: string;
  ownerName: string;
  logo?: string;
  photo?: string;
  email: string;
  phone: string;
  availableHours: {
    start: string;
    end: string;
  };
  availableDays: number[];
  daySchedules: Record<number, DaySchedule>;
  meetingDuration: number;
  blockedDates: BlockedDate[];
  blockedTimeSlots: BlockedTimeSlot[];
}

// Re-export CRM types
export * from './crm';

// Re-export Project types
export * from './project';
