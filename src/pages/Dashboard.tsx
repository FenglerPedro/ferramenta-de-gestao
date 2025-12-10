import { DollarSign, Users, Calendar, TrendingUp, Kanban, Target } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentMeetings } from '@/components/dashboard/RecentMeetings';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { FunnelChart } from '@/components/dashboard/FunnelChart';
import { useBusiness } from '@/contexts/BusinessContext';

import { useTerminology } from '@/hooks/useTerminology';

export default function Dashboard() {
  const { clients, meetings, deals, pipelineStages } = useBusiness();
  const terms = useTerminology();

  const totalRevenue = clients.reduce((acc, client) => acc + client.totalValue, 0);
  const activeClients = clients.filter(c => c.status === 'active').length;
  const scheduledMeetings = meetings.filter(m => m.status === 'scheduled').length;

  // CRM Stats
  const totalDeals = deals.length;
  const pipelineValue = deals.reduce((acc, deal) => acc + deal.value, 0);

  // Encontrar estágios "fechado" ou "won" para calcular conversões
  const closedStages = pipelineStages.filter(s =>
    s.name.toLowerCase().includes('fechado') ||
    s.name.toLowerCase().includes('ganho') ||
    s.id === 'closed' ||
    s.id === 'won'
  );
  const closedDeals = deals.filter(d => closedStages.some(s => s.id === d.stageId));
  const closedValue = closedDeals.reduce((acc, deal) => acc + deal.value, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{terms.dashboard}</h1>
        <p className="text-muted-foreground">Visão geral do seu negócio</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Faturamento Total"
          value={`R$ ${totalRevenue.toLocaleString('pt-BR')}`}
          subtitle={`Valor total de ${terms.clients.toLowerCase()}`}
          icon={DollarSign}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title={`${terms.clients} Ativos`}
          value={activeClients}
          subtitle={`${clients.length} total`}
          icon={Users}
          trend={{ value: 5, isPositive: true }}
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
          subtitle="No funil de vendas"
          icon={Kanban}
        />
        <StatsCard
          title="Valor no Funil"
          value={`R$ ${pipelineValue.toLocaleString('pt-BR')}`}
          subtitle={`Total de ${terms.deals.toLowerCase()}`}
          icon={Target}
        />
        <StatsCard
          title="Fechados"
          value={`R$ ${closedValue.toLocaleString('pt-BR')}`}
          subtitle={`${closedDeals.length} ${terms.deals.toLowerCase()} fechados`}
          icon={DollarSign}
          trend={closedDeals.length > 0 ? { value: closedDeals.length, isPositive: true } : undefined}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <RecentMeetings />
        </div>
      </div>

      {/* Funnel Chart */}
      <FunnelChart />
    </div>
  );
}
