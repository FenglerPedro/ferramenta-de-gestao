import { useState } from 'react';
import { Transaction } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, MoreVertical } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useBusiness } from '@/contexts/BusinessContext';

interface ClientHistoryTabProps {
    clientId: string;
    transactions: Transaction[];
}

export function ClientHistoryTab({ clientId, transactions }: ClientHistoryTabProps) {
    const { addTransaction, updateTransaction, deleteTransaction } = useBusiness();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Transaction>>({
        date: format(new Date(), 'yyyy-MM-dd'),
        status: 'paid',
        paymentMethod: 'credit_card',
        amount: 0,
        description: '',
    });

    const sortedTransactions = [...transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const resetForm = () => {
        setFormData({
            date: format(new Date(), 'yyyy-MM-dd'),
            status: 'paid',
            paymentMethod: 'credit_card',
            amount: 0,
            description: '',
        });
        setEditingId(null);
    };

    const handleSave = () => {
        if (!formData.amount || !formData.description || !formData.date) return;

        const transactionData = {
            clientId,
            date: formData.date!,
            amount: Number(formData.amount),
            description: formData.description!,
            status: formData.status as 'paid' | 'pending' | 'cancelled',
            paymentMethod: formData.paymentMethod as any,
        };

        if (editingId) {
            updateTransaction(editingId, transactionData);
        } else {
            addTransaction(transactionData);
        }

        setIsDialogOpen(false);
        resetForm();
    };

    const handleEdit = (transaction: Transaction) => {
        setFormData({
            date: transaction.date,
            status: transaction.status,
            paymentMethod: transaction.paymentMethod,
            amount: transaction.amount,
            description: transaction.description,
        });
        setEditingId(transaction.id);
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta transação?')) {
            deleteTransaction(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Histórico de Transações</h3>
                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Nova Transação
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingId ? 'Editar Transação' : 'Adicionar Transação'}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Data</Label>
                                    <Input
                                        type="date"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Valor (R$)</Label>
                                    <Input
                                        type="number"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Descrição</Label>
                                <Input
                                    placeholder="Ex: Mensalidade Maio"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={v => setFormData({ ...formData, status: v as any })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="paid">Pago</SelectItem>
                                            <SelectItem value="pending">Pendente</SelectItem>
                                            <SelectItem value="cancelled">Cancelado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Forma de Pagamento</Label>
                                    <Select
                                        value={formData.paymentMethod}
                                        onValueChange={v => setFormData({ ...formData, paymentMethod: v as any })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                                            <SelectItem value="pix">PIX</SelectItem>
                                            <SelectItem value="boleto">Boleto</SelectItem>
                                            <SelectItem value="transfer">Transferência</SelectItem>
                                            <SelectItem value="cash">Dinheiro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button onClick={handleSave} className="w-full mt-2">
                                {editingId ? 'Salvar Alterações' : 'Adicionar Transação'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Transações Recentes</CardTitle>
                    <CardDescription>Lista de pagamentos e compras do cliente</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Método</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedTransactions.length > 0 ? (
                                sortedTransactions.map((t) => (
                                    <TableRow key={t.id}>
                                        <TableCell>
                                            {format(parseISO(t.date), 'dd/MM/yyyy', { locale: ptBR })}
                                        </TableCell>
                                        <TableCell>{t.description}</TableCell>
                                        <TableCell className="capitalize">
                                            {t.paymentMethod?.replace('_', ' ')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={t.status === 'paid' ? 'default' : t.status === 'pending' ? 'outline' : 'destructive'}>
                                                {t.status === 'paid' ? 'Pago' : t.status === 'pending' ? 'Pendente' : 'Cancelado'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            R$ {t.amount.toLocaleString('pt-BR')}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(t)}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(t.id)} className="text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                        Nenhuma transação registrada.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
