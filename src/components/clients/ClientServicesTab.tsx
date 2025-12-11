import { useState, useMemo } from 'react';
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
import { format, parseISO, addMonths, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, DollarSign, Calendar, CheckCircle2, AlertCircle, Trash2, Pencil, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { CurrencyInput } from '@/components/ui/currency-input';

interface ClientServicesTabProps {
    clientId: string;
}

export function ClientServicesTab({ clientId }: ClientServicesTabProps) {
    const { purchasedServices, addPurchasedService, updatePurchasedService, deletePurchasedService, addTransaction, transactions, services } = useBusiness();
    const [isNewServiceOpen, setIsNewServiceOpen] = useState(false);
    
    // Filter State
    const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

    // Installment Generation State
    const [generationCounts, setGenerationCounts] = useState<Record<string, number>>({});
    
    // Edit Installment State
    const [editingInstallment, setEditingInstallment] = useState<{ serviceId: string, installment: Installment } | null>(null);
    const [isEditInstallmentOpen, setIsEditInstallmentOpen] = useState(false);
    const [editInstallmentData, setEditInstallmentData] = useState({
        dueDate: '',
        status: 'pending' as 'pending' | 'paid' | 'overdue'
    });

    // Edit Service Name State
    const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
    const [newServiceName, setNewServiceName] = useState('');

    // Form State
    const [customService, setCustomService] = useState('');
    const [formData, setFormData] = useState<{
        selectedServices: string[];
        type: 'recurring' | 'one-time';
        value: number;
        startDate: string;
    }>({
        selectedServices: [],
        type: 'one-time',
        value: 0,
        startDate: format(new Date(), 'yyyy-MM-dd'),
    });

    const handleAddCustomService = () => {
        if (customService.trim()) {
            const newService = customService.trim();
            if (!formData.selectedServices.includes(newService)) {
                setFormData(prev => ({
                    ...prev,
                    selectedServices: [...prev.selectedServices, newService]
                }));
            }
            setCustomService('');
        }
    };

    const toggleService = (serviceName: string) => {
        setFormData(prev => ({
            ...prev,
            selectedServices: prev.selectedServices.includes(serviceName)
                ? prev.selectedServices.filter(s => s !== serviceName)
                : [...prev.selectedServices, serviceName]
        }));
    };

    const getPaidAmount = (service: PurchasedService) => {
        const serviceTransactions = transactions.filter(t => t.serviceId === service.id);
        return serviceTransactions.reduce((acc, t) => acc + t.amount, 0);
    };

    const getServiceFinancialStatus = (service: PurchasedService): 'paid' | 'pending' | 'overdue' => {
        if (service.type === 'one-time') {
            const paidAmount = getPaidAmount(service);
            return paidAmount >= service.value ? 'paid' : 'pending';
        } else {
            // Recurring
            if (!service.installments || service.installments.length === 0) return 'active' as any; // Default to pending/active logic
            
            const hasOverdue = service.installments.some(inst => inst.status === 'overdue');
            if (hasOverdue) return 'overdue';
            
            const hasPending = service.installments.some(inst => inst.status === 'pending');
            if (hasPending) return 'pending';
            
            // If all generated are paid
            return 'paid';
        }
    };

    const clientServices = useMemo(() => {
        const services = purchasedServices.filter(s => s.clientId === clientId);
        if (filterStatus === 'all') return services;
        
        return services.filter(service => {
            const status = getServiceFinancialStatus(service);
            return status === filterStatus;
        });
    }, [purchasedServices, clientId, filterStatus, transactions]);

    const handleCreateService = () => {
        // Add custom service if user forgot to click add button but typed something
        let finalServices = [...formData.selectedServices];
        if (customService.trim() && !finalServices.includes(customService.trim())) {
            finalServices.push(customService.trim());
        }

        if (finalServices.length === 0 || formData.value <= 0) {
            toast.error('Selecione pelo menos um serviço e informe o valor.');
            return;
        }

        const valuePerService = formData.value / finalServices.length;

        finalServices.forEach(serviceName => {
            const newService: Omit<PurchasedService, 'id'> = {
                clientId,
                serviceName: serviceName,
                type: formData.type,
                value: valuePerService,
                status: 'active',
                startDate: formData.startDate,
                installments: formData.type === 'recurring' ? [] : undefined,
            };
            addPurchasedService(newService);
        });

        toast.success(`${finalServices.length} serviço(s) adicionado(s)!`);
        setIsNewServiceOpen(false);
        setFormData({
            selectedServices: [],
            type: 'one-time',
            value: 0,
            startDate: format(new Date(), 'yyyy-MM-dd'),
        });
        setCustomService('');
    };

    const handleDeleteService = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Tem certeza que deseja remover este serviço e todo o histórico associado?')) {
            deletePurchasedService(id);
            toast.success('Serviço removido.');
        }
    };

    const handleGenerateInstallments = (service: PurchasedService) => {
        // Generate for next N months based on start date or last installment
        const count = generationCounts[service.id] || 12;
        const installments: Installment[] = service.installments || [];
        const lastDate = installments.length > 0
            ? parseISO(installments[installments.length - 1].dueDate)
            : parseISO(service.startDate);

        const newInstallments: Installment[] = [];
        for (let i = 1; i <= count; i++) {
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
        toast.success(`${count} parcelas geradas!`);
    };

    const openEditInstallment = (serviceId: string, installment: Installment) => {
        setEditingInstallment({ serviceId, installment });
        setEditInstallmentData({
            dueDate: installment.dueDate,
            status: installment.status
        });
        setIsEditInstallmentOpen(true);
    };

    const handleSaveInstallmentEdit = () => {
        if (!editingInstallment) return;
        const { serviceId, installment } = editingInstallment;
        const service = purchasedServices.find(s => s.id === serviceId);
        if (!service || !service.installments) return;

        const updatedInstallments = service.installments.map(inst => 
            inst.id === installment.id 
                ? { ...inst, dueDate: editInstallmentData.dueDate, status: editInstallmentData.status }
                : inst
        );
        
        updatePurchasedService(serviceId, { installments: updatedInstallments });
        toast.success('Parcela atualizada!');
        setIsEditInstallmentOpen(false);
        setEditingInstallment(null);
    };

    const startEditingService = (service: PurchasedService) => {
        setEditingServiceId(service.id);
        setNewServiceName(service.serviceName);
    };

    const handleSaveServiceName = (serviceId: string) => {
        if (!newServiceName.trim()) return;
        updatePurchasedService(serviceId, { serviceName: newServiceName });
        toast.success('Nome do serviço atualizado!');
        setEditingServiceId(null);
    };

    const handleDeleteInstallment = (service: PurchasedService, installmentId: string) => {
        if (!service.installments) return;
        if (confirm('Tem certeza que deseja excluir esta parcela?')) {
            const updatedInstallments = service.installments.filter(i => i.id !== installmentId);
            updatePurchasedService(service.id, { installments: updatedInstallments });
            toast.success('Parcela removida!');
        }
    };

    const handlePayInstallment = (service: PurchasedService, installment: Installment) => {
        const today = format(new Date(), 'yyyy-MM-dd');
        // Create Transaction
        const transaction: Omit<Transaction, 'id'> = {
            clientId,
            date: today,
            amount: installment.value,
            description: `Parcela ${installment.number} - ${service.serviceName}`,
            status: 'paid',
            paymentMethod: 'pix',
            serviceId: service.id,
            installmentId: installment.id
        };

        addTransaction(transaction);

        // Update Installment Status
        const updatedInstallments = service.installments?.map(inst =>
            inst.id === installment.id
                ? { ...inst, status: 'paid' as const, paymentDate: today, transactionId: 'pending-link' }
                : inst
        );

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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-muted/20 p-4 rounded-lg gap-4">
                <div>
                    <h3 className="text-lg font-medium">Serviços Contratados</h3>
                    <p className="text-sm text-muted-foreground">Gerencie assinaturas e projetos pontuais</p>
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
                        <SelectTrigger className="w-[140px] bg-background">
                             <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder="Status" />
                             </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="paid">Pago</SelectItem>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="overdue">Atrasado</SelectItem>
                        </SelectContent>
                    </Select>

                    <Dialog open={isNewServiceOpen} onOpenChange={setIsNewServiceOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 whitespace-nowrap">
                                <Plus className="h-4 w-4" /> Novo Serviço
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Adicionar Novo Serviço</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Serviços *</Label>
                                    <div className="flex gap-2 mb-2">
                                        <Input 
                                            placeholder="Adicionar outro serviço..." 
                                            value={customService}
                                            onChange={(e) => setCustomService(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddCustomService();
                                                }
                                            }}
                                        />
                                        <Button type="button" variant="outline" onClick={handleAddCustomService}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg max-h-40 overflow-y-auto">
                                        {services.map((service) => (
                                            <div key={service.id} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id={`service-${service.id}`}
                                                    checked={formData.selectedServices.includes(service.name)}
                                                    onChange={() => toggleService(service.name)}
                                                    className="h-4 w-4 rounded border-gray-300"
                                                />
                                                <label
                                                    htmlFor={`service-${service.id}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                >
                                                    {service.name}
                                                </label>
                                            </div>
                                        ))}
                                        {formData.selectedServices
                                            .filter(s => !services.find(svc => svc.name === s))
                                            .map((serviceName, idx) => (
                                                <div key={`custom-${idx}`} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`custom-service-${idx}`}
                                                        checked={true}
                                                        onChange={() => toggleService(serviceName)}
                                                        className="h-4 w-4 rounded border-gray-300"
                                                    />
                                                    <label
                                                        htmlFor={`custom-service-${idx}`}
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                    >
                                                        {serviceName}
                                                    </label>
                                                </div>
                                            ))}
                                    </div>
                                    {formData.selectedServices.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {formData.selectedServices.map((serviceName) => (
                                                <Badge key={serviceName} variant="secondary" className="gap-1">
                                                    {serviceName}
                                                    <span 
                                                        className="cursor-pointer ml-1 hover:text-destructive"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleService(serviceName);
                                                        }}
                                                    >
                                                        ×
                                                    </span>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
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
                                        <Label>Valor Total (será dividido)</Label>
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
                                <Button onClick={handleCreateService} className="w-full">Salvar Serviços</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
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
                    
                    const lastPaymentDate = transactions
                        .filter(t => t.serviceId === service.id && t.status === 'paid')
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date;

                    return (
                        <AccordionItem key={service.id} value={service.id} className="border rounded-lg bg-card px-4">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <div className="flex items-center justify-between w-full pr-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${service.type === 'recurring' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                            {service.type === 'recurring' ? <Calendar className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                                        </div>
                                        <div className="text-left">
                                            {editingServiceId === service.id ? (
                                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <Input 
                                                        value={newServiceName} 
                                                        onChange={(e) => setNewServiceName(e.target.value)}
                                                        className="h-8 w-48"
                                                        autoFocus
                                                    />
                                                    <Button size="sm" onClick={() => handleSaveServiceName(service.id)}>Salvar</Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 group">
                                                    <h4 className="font-semibold">{service.serviceName}</h4>
                                                    <Pencil 
                                                        className="h-3 w-3 opacity-0 group-hover:opacity-100 cursor-pointer text-muted-foreground" 
                                                        onClick={(e) => { e.stopPropagation(); startEditingService(service); }}
                                                    />
                                                </div>
                                            )}
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
                                            {isPaid && lastPaymentDate && (
                                                <p className="text-[10px] text-muted-foreground">
                                                    em {format(parseISO(lastPaymentDate), 'dd/MM/yyyy', { locale: ptBR })}
                                                </p>
                                            )}
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
                                            <div className="flex justify-between items-center gap-4">
                                                <h5 className="text-sm font-medium">Parcelas / Mensalidades</h5>
                                                <div className="flex items-center gap-2">
                                                    <Input 
                                                        type="number" 
                                                        className="w-20 h-8" 
                                                        value={generationCounts[service.id] || 12}
                                                        onChange={(e) => setGenerationCounts({ ...generationCounts, [service.id]: parseInt(e.target.value) || 0 })}
                                                        placeholder="12"
                                                    />
                                                    <Button size="sm" variant="outline" onClick={() => handleGenerateInstallments(service)}>
                                                        Gerar Parcelas
                                                    </Button>
                                                </div>
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
                                                        <div className="flex items-center gap-2">
                                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditInstallment(service.id, installment)}>
                                                                <Pencil className="h-3 w-3" />
                                                            </Button>
                                                            {installment.status === 'paid' ? (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[10px] text-muted-foreground">
                                                                        {installment.paymentDate ? format(parseISO(installment.paymentDate), 'dd/MM/yyyy', { locale: ptBR }) : ''}
                                                                    </span>
                                                                    <Badge variant="secondary" className="gap-1 text-green-700 bg-green-50 hover:bg-green-100">
                                                                        <CheckCircle2 className="h-3 w-3" /> Pago
                                                                    </Badge>
                                                                </div>
                                                            ) : (
                                                                <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => handlePayInstallment(service, installment)}>
                                                                    Registrar Pagamento
                                                                </Button>
                                                            )}
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => handleDeleteInstallment(service, installment.id)}>
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
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

            <Dialog open={isEditInstallmentOpen} onOpenChange={setIsEditInstallmentOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Parcela</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Data de Vencimento</Label>
                            <Input
                                type="date"
                                value={editInstallmentData.dueDate}
                                onChange={(e) => setEditInstallmentData({ ...editInstallmentData, dueDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={editInstallmentData.status}
                                onValueChange={(val: 'pending' | 'paid' | 'overdue') => setEditInstallmentData({ ...editInstallmentData, status: val })}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pendente</SelectItem>
                                    <SelectItem value="paid">Pago</SelectItem>
                                    <SelectItem value="overdue">Atrasado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleSaveInstallmentEdit} className="w-full">Salvar Alterações</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
