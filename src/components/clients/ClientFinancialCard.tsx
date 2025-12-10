import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/types';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ClientFinancialCardProps {
    transactions: Transaction[];
}

export function ClientFinancialCard({ transactions }: ClientFinancialCardProps) {
    const paidTransactions = transactions.filter(t => t.status === 'paid');

    const totalValue = paidTransactions.reduce((acc, t) => acc + t.amount, 0);
    const avgTicket = paidTransactions.length > 0 ? totalValue / paidTransactions.length : 0;

    const lastTransaction = paidTransactions.length > 0
        ? paidTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
        : null;

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">R$ {totalValue.toLocaleString('pt-BR')}</div>
                    <p className="text-xs text-muted-foreground">
                        em {paidTransactions.length} compras
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">R$ {avgTicket.toLocaleString('pt-BR')}</div>
                    <p className="text-xs text-muted-foreground">
                        por transação
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Última Compra</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {lastTransaction
                            ? format(parseISO(lastTransaction.date), 'dd/MM/yyyy', { locale: ptBR })
                            : '-'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {lastTransaction ? lastTransaction.description : 'Nenhuma compra recente'}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
