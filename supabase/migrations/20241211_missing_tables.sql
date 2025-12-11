-- Missing Tables Migration
-- This migration adds the missing tables: transactions, client_activities, purchased_services, and installments

-- Transactions
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  client_id uuid references public.clients(id) on delete set null,
  amount numeric not null,
  type text not null, -- income, expense
  category text,
  description text,
  date date not null,
  status text default 'pending', -- pending, completed, cancelled
  payment_method text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Transactions
alter table public.transactions enable row level security;
create policy "Users can crud own transactions" on public.transactions
  for all using (auth.uid() = user_id);

-- Client Activities
create table public.client_activities (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  type text not null, -- call, email, meeting, note, etc
  title text,
  description text,
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Client Activities
alter table public.client_activities enable row level security;
create policy "Users can crud own activities" on public.client_activities
  for all using (auth.uid() = user_id);

-- Purchased Services (Serviços Adquiridos pelos Clientes)
create table public.purchased_services (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  service_id uuid references public.services(id) on delete set null,
  service_name text not null,
  name text,
  type text default 'one-time', -- one-time, recurring
  value numeric not null,
  status text default 'active', -- active, inactive, completed, cancelled
  start_date date,
  next_billing_date date,
  recurrence_interval text, -- daily, weekly, monthly, yearly
  transaction_id uuid references public.transactions(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Purchased Services
alter table public.purchased_services enable row level security;
create policy "Users can crud own purchased services" on public.purchased_services
  for all using (auth.uid() = user_id);

-- Installments (Parcelas)
create table public.installments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  service_id uuid references public.purchased_services(id) on delete cascade not null,
  number integer not null,
  value numeric not null,
  due_date date not null,
  status text default 'pending', -- pending, paid, overdue, cancelled
  payment_date date,
  transaction_id uuid references public.transactions(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Installments
alter table public.installments enable row level security;
create policy "Users can crud own installments" on public.installments
  for all using (auth.uid() = user_id);
