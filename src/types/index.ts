export interface Installment {
  id: string;
  serviceId: string;
  dueDate: string; // ISO date
  value: number;
  status: 'pending' | 'paid' | 'overdue';
  paymentDate?: string; // Date when payment was made
  transactionId?: string;
  number: number; // 1, 2, 3...
}

export interface PurchasedService {
  id: string;
  clientId: string;
  serviceName: string;
  type: 'recurring' | 'one-time';
  value: number; // Total value for one-time, or Monthly value for recurring
  status: 'active' | 'completed' | 'cancelled';
  startDate: string;
  // For recurring
  recurrenceInterval?: 'monthly' | 'yearly';
  installments?: Installment[];
  // For one-time
  transactionId?: string; // One-time payment transaction
}

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
  serviceId?: string; // Link to PurchasedService
  installmentId?: string; // Link to Installment
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
  title: string;
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
