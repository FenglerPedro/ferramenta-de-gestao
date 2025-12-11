import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useBusiness } from '@/contexts/BusinessContext';
import { PurchasedService, Installment, Transaction } from '@/types';
import { format, parseISO, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, DollarSign, Calendar, CheckCircle2, AlertCircle, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { CurrencyInput } from '@/components/ui/currency-input';

interface ClientServicesTabProps {
    clientId: string;
}

export function ClientServicesTab({ clientId }: ClientServicesTabProps) {
    const { purchasedServices, addPurchasedService, updatePurchasedService, deletePurchasedService, addTransaction, transactions } = useBusiness();
    const [isNewServiceOpen, setIsNewServiceOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState<{
        serviceName: string;
        type: 'recurring' | 'one-time';
        value: number;
        startDate: string;
    }>({
        serviceName: '',
        type: 'one-time',
        value: 0,
        startDate: format(new Date(), 'yyyy-MM-dd'),
    });

    const clientServices = purchasedServices.filter(s => s.clientId === clientId);

    const handleCreateService = () => {
        if (!formData.serviceName || formData.value <= 0) {
            toast.error('Preencha o nome e o valor do serviço.');
            return;
        }

        const newService: Omit<PurchasedService, 'id'> = {
            clientId,
            serviceName: formData.serviceName,
            type: formData.type,
            value: formData.value,
            status: 'active',
            startDate: formData.startDate,
            installments: formData.type === 'recurring' ? [] : undefined,
        };

        // If recurring and we want to auto-generate first installment? 
        // Let's keep it empty and let user generate.

        addPurchasedService(newService);
        toast.success('Serviço adicionado!');
        setIsNewServiceOpen(false);
        setFormData({
            serviceName: '',
            type: 'one-time',
            value: 0,
            startDate: format(new Date(), 'yyyy-MM-dd'),
        });
    };

    const handleDeleteService = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Tem certeza que deseja remover este serviço e todo o histórico associado?')) {
            deletePurchasedService(id);
            toast.success('Serviço removido.');
        }
    };

    const handleGenerateInstallments = (service: PurchasedService) => {
        // Generate for next 12 months based on start date or last installment
        const installments: Installment[] = service.installments || [];
        const lastDate = installments.length > 0
            ? parseISO(installments[installments.length - 1].dueDate)
            : parseISO(service.startDate);

        const newInstallments: Installment[] = [];
        for (let i = 1; i <= 12; i++) {
            const dueDate = addMonths(lastDate, i);
            newInstallments.push({
                id: Math.random().toString(36).substr(2, 9),
                serviceId: service.id,
                dueDate: format(dueDate, 'yyyy-MM-dd'),
                value: service.value,
                status: 'pending',
                number: (installments.length + i)
            });
        }

        const updatedInstallments = [...installments, ...newInstallments];
        updatePurchasedService(service.id, { installments: updatedInstallments });
        toast.success('Parcelas geradas!');
    };

    const handlePayInstallment = (service: PurchasedService, installment: Installment) => {
        // Create Transaction
        const transaction: Omit<Transaction, 'id'> = {
            clientId,
            date: format(new Date(), 'yyyy-MM-dd'),
            amount: installment.value,
            description: `Parcela ${installment.number} - ${service.serviceName}`,
            status: 'paid',
            paymentMethod: 'pix', // Default or ask?
            serviceId: service.id,
            installmentId: installment.id
        };

        addTransaction(transaction);

        // Update Installment Status
        const updatedInstallments = service.installments?.map(inst =>
            inst.id === installment.id
                ? { ...inst, status: 'paid' as const, transactionId: 'pending-link' } // We don't have transaction ID yet until after addTransaction... 
                // Wait, addTransaction is sync but ID generation is internal inside BusinessContext.
                // We can't link readily unless we generate ID here.
                : inst
        );

        // Simple fix: update status to paid. Link is implicitly by Logic matching or we refactor addTransaction to return ID.
        // For now, let's mark as paid.
        updatePurchasedService(service.id, { installments: updatedInstallments });
        toast.success('Pagamento registrado!');
    };

    const handlePayOneTime = (service: PurchasedService) => {
        const transaction: Omit<Transaction, 'id'> = {
            clientId,
            date: format(new Date(), 'yyyy-MM-dd'),
            amount: service.value,
            description: `Pagamento à vista - ${service.serviceName}`,
            status: 'paid',
            serviceId: service.id
        };
        addTransaction(transaction);
        updatePurchasedService(service.id, { status: 'completed' }); // Mark service as completed/paid
        toast.success('Pagamento registrado!');
    };

    // Calculate total paid for this service for display
    const getPaidAmount = (service: PurchasedService) => {
        // Look up transactions linked to this service
        // Since we didn't store transactionId reliably in installments yet (due to ID generation), 
        // we can look at transactions filtered by serviceId.
        const serviceTransactions = transactions.filter(t => t.serviceId === service.id);
        return serviceTransactions.reduce((acc, t) => acc + t.amount, 0);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-muted/20 p-4 rounded-lg">
                <div>
                    <h3 className="text-lg font-medium">Serviços Contratados</h3>
                    <p className="text-sm text-muted-foreground">Gerencie assinaturas e projetos pontuais</p>
                </div>
                <Dialog open={isNewServiceOpen} onOpenChange={setIsNewServiceOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> Novo Serviço
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Adicionar Novo Serviço</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Nome do Serviço</Label>
                                <Input
                                    placeholder="Ex: Consultoria Mensal"
                                    value={formData.serviceName}
                                    onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tipo</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(val: 'recurring' | 'one-time') => setFormData({ ...formData, type: val })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="one-time">Pontual (À vista)</SelectItem>
                                            <SelectItem value="recurring">Recorrente (Mensal)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Valor {formData.type === 'recurring' ? '(Mensal)' : '(Total)'}</Label>
                                    <CurrencyInput
                                        value={formData.value}
                                        onChange={(val) => setFormData({ ...formData, value: val })}
                                        placeholder="R$ 0,00"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Data de Início/Venda</Label>
                                <Input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                            <Button onClick={handleCreateService} className="w-full">Salvar Serviço</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {clientServices.length === 0 && (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    Nenhum serviço registrado.
                </div>
            )}

            <Accordion type="single" collapsible className="w-full space-y-2">
                {clientServices.map((service) => {
                    const paidAmount = getPaidAmount(service);
                    const isPaid = paidAmount >= service.value && service.type === 'one-time';

                    return (
                        <AccordionItem key={service.id} value={service.id} className="border rounded-lg bg-card px-4">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <div className="flex items-center justify-between w-full pr-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${service.type === 'recurring' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                            {service.type === 'recurring' ? <Calendar className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                                        </div>
                                        <div className="text-left">
                                            <h4 className="font-semibold">{service.serviceName}</h4>
                                            <p className="text-xs text-muted-foreground">
                                                {service.type === 'recurring' ? 'Recorrente' : 'Pontual'} • Iniciado em {format(parseISO(service.startDate), 'dd/MM/yyyy', { locale: ptBR })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-sm font-medium">R$ {service.value.toLocaleString('pt-BR')}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Pago: R$ {paidAmount.toLocaleString('pt-BR')}
                                            </p>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={(e) => handleDeleteService(service.id, e)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-4 pt-2">
                                <div className="pl-14">
                                    {service.type === 'one-time' ? (
                                        <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                {isPaid ? (
                                                    <Badge className="bg-green-500 hover:bg-green-600">Pago</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="border-orange-300 text-orange-600">Pendente</Badge>
                                                )}
                                                <span className="text-sm">
                                                    Valor Total: R$ {service.value.toLocaleString('pt-BR')}
                                                </span>
                                            </div>
                                            {!isPaid && (
                                                <Button size="sm" onClick={() => handlePayOneTime(service)}>
                                                    Registrar Pagamento
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h5 className="text-sm font-medium">Parcelas / Mensalidades</h5>
                                                <Button size="sm" variant="outline" onClick={() => handleGenerateInstallments(service)}>
                                                    Gerar Próximas 12 Parcelas
                                                </Button>
                                            </div>

                                            <div className="space-y-2">
                                                {(!service.installments || service.installments.length === 0) && (
                                                    <p className="text-sm text-muted-foreground italic">Nenhuma parcela gerada.</p>
                                                )}

                                                {service.installments?.map((installment) => (
                                                    <div key={installment.id} className="flex items-center justify-between p-3 border rounded-md bg-background">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                                                                #{installment.number}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium">Vencimento: {format(parseISO(installment.dueDate), 'dd/MM/yyyy', { locale: ptBR })}</p>
                                                                <p className="text-xs text-muted-foreground">R$ {installment.value.toLocaleString('pt-BR')}</p>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            {installment.status === 'paid' ? (
                                                                <Badge variant="secondary" className="gap-1 text-green-700 bg-green-50 hover:bg-green-100">
                                                                    <CheckCircle2 className="h-3 w-3" /> Pago
                                                                </Badge>
                                                            ) : (
                                                                <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => handlePayInstallment(service, installment)}>
                                                                    Registrar Pagamento
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </div>
    );
}
