import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/types';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ClientFinancialCardProps {
    transactions: Transaction[];
    totalContractedValue?: number;
}

export function ClientFinancialCard({ transactions, totalContractedValue = 0 }: ClientFinancialCardProps) {
    const paidTransactions = transactions.filter(t => t.status === 'paid');

    const totalPaid = paidTransactions.reduce((acc, t) => acc + t.amount, 0);
    const avgTicket = paidTransactions.length > 0 ? totalPaid / paidTransactions.length : 0;

    const lastTransaction = paidTransactions.length > 0
        ? paidTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
        : null;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Contratado</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">R$ {totalContractedValue.toLocaleString('pt-BR')}</div>
                    <p className="text-xs text-muted-foreground">
                        em serviços
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
                    <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">R$ {totalPaid.toLocaleString('pt-BR')}</div>
                    <p className="text-xs text-muted-foreground">
                        em {paidTransactions.length} pagamentos
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
