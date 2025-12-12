-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table profiles enable row level security;

create policy "Users can view their own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can insert their own profile" on profiles
  for insert with check (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Clients
create table clients (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  email text,
  phone text,
  company text,
  notes text,
  status text default 'active',
  total_value numeric default 0,
  photo text,
  source_deal_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table clients enable row level security;

create policy "Users can crud their own clients" on clients
  for all using (auth.uid() = user_id);

-- Services
create table services (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  description text,
  price numeric,
  duration text, -- Changed from integer to text to match frontend
  is_recurring boolean default false,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table services enable row level security;

create policy "Users can crud their own services" on services
  for all using (auth.uid() = user_id);

-- Meetings
create table meetings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  description text,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  client_id uuid references clients(id),
  client_name text,
  client_email text,
  service_id uuid references services(id),
  status text default 'scheduled',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table meetings enable row level security;

create policy "Users can crud their own meetings" on meetings
  for all using (auth.uid() = user_id);

-- Deals (CRM)
create table deals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  value numeric default 0,
  client_id uuid references clients(id),
  client_name text,
  client_email text,
  client_phone text,
  type text default 'one-time',
  pipeline_stage_id text, -- ID stored as text in frontend default data
  priority text default 'medium',
  notes text,
  expected_close_date timestamp with time zone,
  status text default 'open',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table deals enable row level security;

create policy "Users can crud their own deals" on deals
  for all using (auth.uid() = user_id);

-- Pipeline Stages (User custom stages)
create table pipeline_stages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  "order" integer default 0,
  color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table pipeline_stages enable row level security;

create policy "Users can crud their own pipeline stages" on pipeline_stages
  for all using (auth.uid() = user_id);

-- Project Tasks
create table project_tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  description text,
  client_id uuid references clients(id),
  project_stage_id text,
  assigned_to text,
  due_date timestamp with time zone,
  priority text default 'medium',
  status text default 'todo',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table project_tasks enable row level security;

create policy "Users can crud their own project tasks" on project_tasks
  for all using (auth.uid() = user_id);

-- Project Stages
create table project_stages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  "order" integer default 0,
  color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table project_stages enable row level security;

create policy "Users can crud their own project stages" on project_stages
  for all using (auth.uid() = user_id);

-- Transactions (Finance)
create table transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  description text not null,
  amount numeric not null,
  type text not null, -- 'income' | 'expense'
  category text,
  date timestamp with time zone not null,
  status text default 'completed',
  payment_method text,
  client_id uuid references clients(id),
  service_id uuid, -- Link to PurchasedService (can't ref purchased_services(id) circular dependency risk if not careful, but fine for now)
  installment_id text, -- string ID from frontend
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table transactions enable row level security;

create policy "Users can crud their own transactions" on transactions
  for all using (auth.uid() = user_id);

-- Client Activities
create table client_activities (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  client_id uuid references clients(id) not null,
  type text not null,
  description text not null,
  date timestamp with time zone not null,
  title text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table client_activities enable row level security;

create policy "Users can crud their own activities" on client_activities
  for all using (auth.uid() = user_id);

-- Purchased Services
create table purchased_services (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  client_id uuid references clients(id) not null,
  service_id uuid references services(id) not null,
  service_name text,
  type text,
  value numeric,
  status text,
  purchase_date timestamp with time zone not null, -- Mapped to startDate
  installments jsonb default '[]'::jsonb,
  price_at_purchase numeric,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table purchased_services enable row level security;

create policy "Users can crud their own purchased services" on purchased_services
  for all using (auth.uid() = user_id);

-- Business Settings
create table business_settings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null unique, -- One settings per user
  business_name text,
  owner_name text,
  email text,
  phone text,
  logo text,
  photo text,
  available_hours jsonb,
  available_days jsonb,
  day_schedules jsonb,
  meeting_duration integer,
  blocked_dates jsonb,
  blocked_time_slots jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table business_settings enable row level security;

create policy "Users can crud their own settings" on business_settings
  for all using (auth.uid() = user_id);
