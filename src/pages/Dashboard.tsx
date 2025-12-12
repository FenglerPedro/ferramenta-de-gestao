import { DollarSign, Users, Calendar, TrendingUp, Kanban, Target } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentMeetings } from '@/components/dashboard/RecentMeetings';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { FunnelChart } from '@/components/dashboard/FunnelChart';
import { useBusiness } from '@/contexts/BusinessContext';
import { useState } from 'react';
import { parseISO, isAfter, isBefore, subDays, format } from 'date-fns';

import { useTerminology } from '@/hooks/useTerminology';

export default function Dashboard() {
  const { clients, meetings, deals, pipelineStages, transactions } = useBusiness();
  const terms = useTerminology();

  // Default to last 30 days
  const [startDate, setStartDate] = useState<string | null>(
    format(subDays(new Date(), 30), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState<string | null>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line'>('area');

  // Filter deals
  const filteredDeals = deals.filter((d) => {
    if (!d.createdAt) return false;
    const dt = parseISO(d.createdAt);
    if (startDate && isBefore(dt, parseISO(startDate))) return false;
    if (endDate && isAfter(dt, parseISO(endDate))) return false;
    return true;
  });

  // For Funnel/Pipeline metrics, we usually want to see ALL open deals, not just those created in date range
  const currentFunnelDeals = deals;

  // Revenue from Paid Transactions
  const totalRevenue = transactions
    .filter(t => {
      const status = t.status as string;
      if (status !== 'paid' && status !== 'completed') return false;
      const dt = parseISO(t.date);
      if (startDate && isBefore(dt, parseISO(startDate))) return false;
      if (endDate && isAfter(dt, parseISO(endDate))) return false;
      return true;
    })
    .reduce((acc, t) => acc + t.amount, 0);

  const activeClients = clients.filter((c) => c.status === 'active').length;

  // Scheduled meetings check (future only + date range)
  const scheduledMeetings = meetings.filter((m) => {
    if (m.status !== 'scheduled') return false;
    if (!m.date) return false;
    const dt = parseISO(m.date);

    // Only future meetings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isBefore(dt, today)) return false;

    // Apply date range filter if set
    if (startDate && isBefore(dt, parseISO(startDate))) return false;
    if (endDate && isAfter(dt, parseISO(endDate))) return false;
    return true;
  }).length;

  // CRM Stats
  // CRM Stats
  // Filter active deals (excluding closed/won/lost) for pipeline metrics
  const activeDealsList = currentFunnelDeals.filter(d =>
    !d.stageId.includes('closed') &&
    !d.stageId.includes('won') &&
    d.stageId !== 'lost' &&
    d.stageId !== 'fechado' &&
    d.stageId !== 'ganho'
  );

  const totalDeals = activeDealsList.length;
  const pipelineValue = activeDealsList.reduce((acc, deal) => acc + deal.value, 0);

  // Encontrar estágios "fechado" ou "won" para calcular conversões
  const closedStageIds = new Set<string>();

  // Adicionar IDs de stages existentes que são de "fechado"
  pipelineStages.forEach(s => {
    if (
      s.name.toLowerCase().includes('fechado') ||
      s.name.toLowerCase().includes('ganho') ||
      s.id === 'closed' ||
      s.id === 'won'
    ) {
      closedStageIds.add(s.id);
    }
  });

  // Sempre incluir 'closed' e 'won' pois são drop zones fixas que não existem como stages
  closedStageIds.add('closed');
  closedStageIds.add('won');
  closedStageIds.add('fechado');
  closedStageIds.add('ganho');

  // Closed deals should respect the date range (e.g. "Sales this month")
  const closedDeals = filteredDeals.filter((d) => closedStageIds.has(d.stageId));
  const closedValue = closedDeals.reduce((acc, deal) => acc + deal.value, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{terms.dashboard}</h1>
        <p className="text-muted-foreground">Visão geral do seu negócio</p>
      </div>

      {/* Main Stats Grid */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm">Início:</label>
          <input type="date" value={startDate ?? ''} onChange={(e) => setStartDate(e.target.value || null)} className="input input-sm" />
          <label className="text-sm">Fim:</label>
          <input type="date" value={endDate ?? ''} onChange={(e) => setEndDate(e.target.value || null)} className="input input-sm" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm">Visualização:</label>
          <select value={chartType} onChange={(e) => setChartType(e.target.value as any)} className="input input-sm">
            <option value="area">Área</option>
            <option value="bar">Barra</option>
            <option value="line">Linha</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Faturamento Total"
          value={`R$ ${totalRevenue.toLocaleString('pt-BR')}`}
          subtitle={`Valor total de ${terms.clients.toLowerCase()}`}
          icon={DollarSign}
        />
        <StatsCard
          title={`${terms.clients} Ativos`}
          value={activeClients}
          subtitle={`${clients.length} total`}
          icon={Users}
        />
        <StatsCard
          title={`${terms.meetings} Agendadas`}
          value={scheduledMeetings}
          subtitle="Próximos dias"
          icon={Calendar}
        />
      </div>

      {/* CRM Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title={terms.deals}
          value={totalDeals}
          subtitle="No funil de vendas (Total)"
          icon={Kanban}
        />
        <StatsCard
          title="Valor no Funil"
          value={`R$ ${pipelineValue.toLocaleString('pt-BR')}`}
          subtitle={`Total em aberto`}
          icon={Target}
        />
        <StatsCard
          title="Fechados"
          value={`R$ ${closedValue.toLocaleString('pt-BR')}`}
          subtitle={`${closedDeals.length} ${terms.deals.toLowerCase()} neste período`}
          icon={DollarSign}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart transactions={transactions} startDate={startDate ?? undefined} endDate={endDate ?? undefined} chartType={chartType} />
        </div>
        <div>
          <RecentMeetings meetingsProp={meetings} startDate={startDate ?? undefined} endDate={endDate ?? undefined} />
        </div>
      </div>

      {/* Funnel Chart */}
      <FunnelChart />
    </div>
  );
}
