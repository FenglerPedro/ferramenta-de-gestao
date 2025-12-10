-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (Dados do Negócio do Usuário)
create table public.profiles (
  id uuid references auth.users not null primary key,
  business_name text,
  owner_name text,
  email text,
  phone text,
  logo_url text,
  photo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Profiles
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Trigger para criar profile ao criar usuário (Supabase Auth)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, owner_name, business_name)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'owner_name', 'Novo Usuário'), 
    coalesce(new.raw_user_meta_data->>'business_name', 'Minha Empresa')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Services
create table public.services (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  price numeric default 0,
  duration text,
  is_recurring boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Services
alter table public.services enable row level security;
create policy "Users can crud own services" on public.services
  for all using (auth.uid() = user_id);

-- Clients
create table public.clients (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  email text,
  phone text,
  service_interest text, -- Para compatibilidade simples
  total_value numeric default 0,
  monthly_value numeric default 0,
  purchase_date date,
  is_recurring boolean default false,
  status text default 'active', -- active, inactive, pending
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Clients
alter table public.clients enable row level security;
create policy "Users can crud own clients" on public.clients
  for all using (auth.uid() = user_id);

-- Relationship Table: Clients <-> Services (Many-to-Many)
create table public.client_services (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references public.clients(id) on delete cascade not null,
  service_id uuid references public.services(id) on delete cascade not null,
  assigned_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Client Services
alter table public.client_services enable row level security;
create policy "Users can crud own client services" on public.client_services
  for all using (
    exists (select 1 from public.clients where id = client_id and user_id = auth.uid())
  );

-- Pipeline Stages
create table public.pipeline_stages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  color text,
  "order" integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Pipeline Stages
alter table public.pipeline_stages enable row level security;
create policy "Users can crud own pipeline stages" on public.pipeline_stages
  for all using (auth.uid() = user_id);

-- Deals (Oportunidades)
create table public.deals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  pipeline_stage_id uuid references public.pipeline_stages(id),
  title text not null,
  value numeric default 0,
  client_name text,
  client_email text,
  client_phone text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Deals
alter table public.deals enable row level security;
create policy "Users can crud own deals" on public.deals
  for all using (auth.uid() = user_id);

-- Meetings (Agenda)
create table public.meetings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  client_id uuid references public.clients(id), -- Opcional, pode ser lead sem cadastro
  client_name text,
  client_email text,
  title text,
  date date not null,
  time text not null,
  duration integer default 60,
  status text default 'scheduled', -- scheduled, completed, cancelled
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Meetings
alter table public.meetings enable row level security;
create policy "Users can crud own meetings" on public.meetings
  for all using (auth.uid() = user_id);

-- Project Stages
create table public.project_stages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  color text,
  "order" integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Project Stages
alter table public.project_stages enable row level security;
create policy "Users can crud own project stages" on public.project_stages
  for all using (auth.uid() = user_id);

-- Project Tasks
create table public.project_tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  client_id uuid references public.clients(id) on delete cascade,
  project_stage_id uuid references public.project_stages(id),
  title text not null,
  description text,
  priority text default 'medium', -- low, medium, high
  due_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Project Tasks
alter table public.project_tasks enable row level security;
create policy "Users can crud own project tasks" on public.project_tasks
  for all using (auth.uid() = user_id);

-- Business Settings (Configurações avançadas em JSON)
create table public.settings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  config jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- RLS Settings
alter table public.settings enable row level security;
create policy "Users can crud own settings" on public.settings
  for all using (auth.uid() = user_id);
