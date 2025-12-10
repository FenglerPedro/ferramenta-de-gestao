import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
} from 'recharts';
import { Transaction } from '@/types';
import { format, parseISO } from 'date-fns';

type ChartType = 'area' | 'bar' | 'line';

function monthKey(date: Date) {
  return format(date, 'yyyy-MM');
}

function monthLabel(key: string) {
  const [y, m] = key.split('-');
  const date = new Date(Number(y), Number(m) - 1, 1);
  return format(date, 'MMM', { locale: undefined });
}

export function RevenueChart({
  transactions,
  startDate,
  endDate,
  chartType = 'area',
}: {
  transactions: Transaction[];
  startDate?: string | null;
  endDate?: string | null;
  chartType?: ChartType;
}) {
  // Filter transactions by date range and status 'paid'
  const start = startDate ? parseISO(startDate) : null;
  const end = endDate ? parseISO(endDate) : null;

  const filtered = transactions.filter((t) => {
    if (t.status !== 'paid') return false;
    const dt = parseISO(t.date);
    if (start && dt < start) return false;
    if (end && dt > end) return false;
    return true;
  });

  // Aggregate revenue per month
  const map = new Map<string, number>();
  filtered.forEach((t) => {
    const k = monthKey(parseISO(t.date));
    map.set(k, (map.get(k) || 0) + (t.amount || 0));
  });

  // Build sorted data
  const sortedKeys = Array.from(map.keys()).sort();
  const data = sortedKeys.map((k) => ({ month: monthLabel(k), revenue: map.get(k) || 0 }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Faturamento</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `R$${v / 1000}k`} />
                <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Faturamento']} />
                <Bar dataKey="revenue" fill="hsl(var(--chart-1))" />
              </BarChart>
            ) : chartType === 'line' ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `R$${v / 1000}k`} />
                <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Faturamento']} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2} />
              </LineChart>
            ) : (
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `R$${v / 1000}k`} />
                <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Faturamento']} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" fill="url(#colorRevenue)" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
