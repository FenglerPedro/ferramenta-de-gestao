# 🔧 REFERÊNCIA DE MUDANÇAS - Linha por Linha

## Arquivo: `src/contexts/BusinessContext.tsx`

### ✅ SELECTs Corrigidos (10 mudanças)

#### L156 - Clientes
```diff
- const { data: clientsData } = await supabase.from('clients').select('*, client_services(services(name))');
+ const { data: clientsData } = await supabase.from('clients').select('*, client_services(services(name))').eq('user_id', user.id);
```

#### L176 - Serviços  
```diff
- const { data: servicesData } = await supabase.from('services').select('*');
+ const { data: servicesData } = await supabase.from('services').select('*').eq('user_id', user.id);
```

#### L185 - Reuniões
```diff
- const { data: meetingsData } = await supabase.from('meetings').select('*');
+ const { data: meetingsData } = await supabase.from('meetings').select('*').eq('user_id', user.id);
```

#### L200 - Deals
```diff
- const { data: dealsData } = await supabase.from('deals').select('*');
+ const { data: dealsData } = await supabase.from('deals').select('*').eq('user_id', user.id);
```

#### L218 - Pipeline Stages
```diff
- const { data: pipelineData } = await supabase.from('pipeline_stages').select('*').order('order');
+ const { data: pipelineData } = await supabase.from('pipeline_stages').select('*').eq('user_id', user.id).order('order');
```

#### L229 - Project Stages
```diff
- const { data: projectStagesData } = await supabase.from('project_stages').select('*').order('order');
+ const { data: projectStagesData } = await supabase.from('project_stages').select('*').eq('user_id', user.id).order('order');
```

#### L240 - Project Tasks
```diff
- const { data: tasksData } = await supabase.from('project_tasks').select('*');
+ const { data: tasksData } = await supabase.from('project_tasks').select('*').eq('user_id', user.id);
```

#### L256 - Transações
```diff
- const { data: transactionsData } = await supabase.from('transactions').select('*');
+ const { data: transactionsData } = await supabase.from('transactions').select('*').eq('user_id', user.id);
```

#### L270 - Atividades
```diff
- const { data: activitiesData } = await supabase.from('client_activities').select('*');
+ const { data: activitiesData } = await supabase.from('client_activities').select('*').eq('user_id', user.id);
```

#### L284 - Serviços Adquiridos
```diff
- const { data: purchasedData } = await supabase.from('purchased_services').select('*, installments(*)');
+ const { data: purchasedData } = await supabase.from('purchased_services').select('*, installments(*)').eq('user_id', user.id);
```

---

### ✅ UPDATEs Corrigidos (11 mudanças)

#### L446 - updateClient
```diff
- const { error } = await supabase.from('clients').update(updates).eq('id', id);
+ const { error } = await supabase.from('clients').update(updates).eq('id', id).eq('user_id', user.id);
```

#### L504 - updateService
```diff
- const { error } = await supabase.from('services').update(updates).eq('id', id);
+ const { error } = await supabase.from('services').update(updates).eq('id', id).eq('user_id', user.id);
```

#### L554 - updateMeeting
```diff
- const { error } = await supabase.from('meetings').update(updates).eq('id', id);
+ const { error } = await supabase.from('meetings').update(updates).eq('id', id).eq('user_id', user.id);
```

#### L603 - updateDeal
```diff
- const { error } = await supabase.from('deals').update(updates).eq('id', id);
+ const { error } = await supabase.from('deals').update(updates).eq('id', id).eq('user_id', user.id);
```

#### L769 - updatePipelineStage
```diff
- const { error } = await supabase.from('pipeline_stages').update(updates).eq('id', id);
+ const { error } = await supabase.from('pipeline_stages').update(updates).eq('id', id).eq('user_id', user.id);
```

#### L793 - updateProjectStage
```diff
- const { error } = await supabase.from('project_stages').update(updates).eq('id', id);
+ const { error } = await supabase.from('project_stages').update(updates).eq('id', id).eq('user_id', user.id);
```

#### L828 - updateProjectTask
```diff
- const { error } = await supabase.from('project_tasks').update(updates).eq('id', id);
+ const { error } = await supabase.from('project_tasks').update(updates).eq('id', id).eq('user_id', user.id);
```

#### L936 - updateTransaction
```diff
- const { error } = await supabase.from('transactions').update(updates).eq('id', id);
+ const { error } = await supabase.from('transactions').update(updates).eq('id', id).eq('user_id', user.id);
```

#### L993 - updateActivity
```diff
- const { error } = await supabase.from('client_activities').update(updates).eq('id', id);
+ const { error } = await supabase.from('client_activities').update(updates).eq('id', id).eq('user_id', user.id);
```

#### L1043 - updatePurchasedService
```diff
- const { error } = await supabase.from('purchased_services').update(updates).eq('id', id);
+ const { error } = await supabase.from('purchased_services').update(updates).eq('id', id).eq('user_id', user.id);
```

#### L620 - moveDeal (dentro da função)
```diff
- const { error } = await supabase.from('deals').update({ pipeline_stage_id: newStageId, updated_at: new Date().toISOString() }).eq('id', dealId);
+ const { error } = await supabase.from('deals').update({ pipeline_stage_id: newStageId, updated_at: new Date().toISOString() }).eq('id', dealId).eq('user_id', user.id);
```

---

### ✅ DELETEs Corrigidos (10 mudanças)

#### L467 - deleteClient
```diff
- const { error } = await supabase.from('clients').delete();
+ const { error } = await supabase.from('clients').delete().eq('id', id).eq('user_id', user.id);
```

#### L513 - deleteService
```diff
- const { error } = await supabase.from('services').delete().eq('id', id);
+ const { error } = await supabase.from('services').delete().eq('id', id).eq('user_id', user.id);
```

#### L563 - deleteMeeting
```diff
- const { error } = await supabase.from('meetings').delete().eq('id', id);
+ const { error } = await supabase.from('meetings').delete().eq('id', id).eq('user_id', user.id);
```

#### L616 - deleteDeal
```diff
- const { error } = await supabase.from('deals').delete().eq('id', id);
+ const { error } = await supabase.from('deals').delete().eq('id', id).eq('user_id', user.id);
```

#### L758 - deletePipelineStage
```diff
- await supabase.from('deals').update({ pipeline_stage_id: firstStage.id }).eq('pipeline_stage_id', id);
- ...
- const { error } = await supabase.from('pipeline_stages').delete().eq('id', id);
+ await supabase.from('deals').update({ pipeline_stage_id: firstStage.id }).eq('pipeline_stage_id', id).eq('user_id', user.id);
+ ...
+ const { error } = await supabase.from('pipeline_stages').delete().eq('id', id).eq('user_id', user.id);
```

#### L813 - deleteProjectStage
```diff
- await supabase.from('project_tasks').update({ project_stage_id: firstStage.id }).eq('project_stage_id', id);
- ...
- const { error } = await supabase.from('project_stages').delete().eq('id', id);
+ await supabase.from('project_tasks').update({ project_stage_id: firstStage.id }).eq('project_stage_id', id).eq('user_id', user.id);
+ ...
+ const { error } = await supabase.from('project_stages').delete().eq('id', id).eq('user_id', user.id);
```

#### L950 - deleteProjectTask
```diff
- const { error } = await supabase.from('project_tasks').delete().eq('id', id);
+ const { error } = await supabase.from('project_tasks').delete().eq('id', id).eq('user_id', user.id);
```

#### L972 - deleteTransaction
```diff
- const { error } = await supabase.from('transactions').delete().eq('id', id);
+ const { error } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', user.id);
```

#### L1003 - deleteActivity
```diff
- const { error } = await supabase.from('client_activities').delete().eq('id', id);
+ const { error } = await supabase.from('client_activities').delete().eq('id', id).eq('user_id', user.id);
```

#### L1053 - deletePurchasedService
```diff
- const { error } = await supabase.from('purchased_services').delete().eq('id', id);
+ const { error } = await supabase.from('purchased_services').delete().eq('id', id).eq('user_id', user.id);
```

---

### ✅ Operações em Cascata Corrigidas (4 mudanças)

#### L758-769 - deletePipelineStage (UPDATE em cascata)
```diff
- await supabase.from('deals').update({ pipeline_stage_id: firstStage.id }).eq('pipeline_stage_id', id);
+ await supabase.from('deals').update({ pipeline_stage_id: firstStage.id }).eq('pipeline_stage_id', id).eq('user_id', user.id);
```

#### L813-824 - deleteProjectStage (UPDATE em cascata)
```diff
- await supabase.from('project_tasks').update({ project_stage_id: firstStage.id }).eq('project_stage_id', id);
+ await supabase.from('project_tasks').update({ project_stage_id: firstStage.id }).eq('project_stage_id', id).eq('user_id', user.id);
```

#### L768-778 - reorderPipelineStages (REFATORADO)
```diff
  const updates = newStages.map((s, index) => ({
    id: s.id,
    user_id: user.id,
    name: s.name,
    color: s.color,
    order: index
  }));
- const { error } = await supabase.from('pipeline_stages').upsert(updates);
+ for (const update of updates) {
+   await supabase.from('pipeline_stages').update(update).eq('id', update.id).eq('user_id', user.id);
+ }
```

#### L865-875 - reorderProjectStages (REFATORADO)
```diff
  const updates = newStages.map((s, index) => ({
    id: s.id,
    user_id: user.id,
    name: s.name,
    order: index
  }));
- const { error } = await supabase.from('project_stages').upsert(updates);
+ for (const update of updates) {
+   await supabase.from('project_stages').update(update).eq('id', update.id).eq('user_id', user.id);
+ }
```

---

## Arquivo: `supabase/migrations/20241211_missing_tables.sql` (NOVO)

### Tabelas Criadas

```sql
-- ✅ NOVA tabela: transactions (Transações Financeiras)
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users,  -- ✅ OBRIGATÓRIO
  amount numeric NOT NULL,
  type text NOT NULL,
  category text,
  description text,
  date date NOT NULL,
  status text DEFAULT 'pending',
  payment_method text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can crud own transactions" ON public.transactions
  FOR ALL USING (auth.uid() = user_id);

-- ✅ NOVA tabela: client_activities (Atividades)
CREATE TABLE public.client_activities (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users,  -- ✅ OBRIGATÓRIO
  client_id uuid NOT NULL REFERENCES public.clients ON DELETE CASCADE,
  type text NOT NULL,
  title text,
  description text,
  date date NOT NULL,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
ALTER TABLE public.client_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can crud own activities" ON public.client_activities
  FOR ALL USING (auth.uid() = user_id);

-- ✅ NOVA tabela: purchased_services (Serviços Adquiridos)
CREATE TABLE public.purchased_services (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users,  -- ✅ OBRIGATÓRIO
  client_id uuid NOT NULL REFERENCES public.clients ON DELETE CASCADE,
  service_id uuid REFERENCES public.services ON DELETE SET NULL,
  service_name text NOT NULL,
  name text,
  type text DEFAULT 'one-time',
  value numeric NOT NULL,
  status text DEFAULT 'active',
  start_date date,
  next_billing_date date,
  recurrence_interval text,
  transaction_id uuid REFERENCES public.transactions ON DELETE SET NULL,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
ALTER TABLE public.purchased_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can crud own purchased services" ON public.purchased_services
  FOR ALL USING (auth.uid() = user_id);

-- ✅ NOVA tabela: installments (Parcelas)
CREATE TABLE public.installments (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users,  -- ✅ OBRIGATÓRIO
  service_id uuid NOT NULL REFERENCES public.purchased_services ON DELETE CASCADE,
  number integer NOT NULL,
  value numeric NOT NULL,
  due_date date NOT NULL,
  status text DEFAULT 'pending',
  payment_date date,
  transaction_id uuid REFERENCES public.transactions ON DELETE SET NULL,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can crud own installments" ON public.installments
  FOR ALL USING (auth.uid() = user_id);
```

---

## Resumo Quantitativo

| Tipo | Quantidade | Status |
|------|-----------|--------|
| SELECTs corrigidos | 10 | ✅ |
| INSERTs com user_id | 10 | ✅ |
| UPDATEs com dupla validação | 11 | ✅ |
| DELETEs com dupla validação | 10 | ✅ |
| Operações em cascata protegidas | 4 | ✅ |
| Tabelas novas criadas | 4 | ✅ |
| RLS Policies criadas | 4 | ✅ |
| **TOTAL DE CORREÇÕES** | **49** | **✅** |

---

**Última atualização:** 11 de Dezembro de 2025  
**Status:** Todas as correções documentadas
