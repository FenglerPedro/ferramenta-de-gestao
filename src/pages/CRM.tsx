import { useState, DragEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBusiness } from '@/contexts/BusinessContext';
import { Deal } from '@/types';
import { Plus, Search, Phone, Mail, MoreVertical, Pencil, Trash2, Settings } from 'lucide-react';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useTerminology } from '@/hooks/useTerminology';
import { HistoryViews } from '@/components/crm/HistoryViews';
import { PipelineSettings } from '@/components/settings/PipelineSettings';

export default function CRM() {
    const { deals, pipelineStages, addDeal, updateDeal, deleteDeal, moveDeal, services } = useBusiness();
    const terms = useTerminology();
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDeal, setEditingDeal] = useState<string | null>(null);
    const [draggedDeal, setDraggedDeal] = useState<string | null>(null);
    // closed and lost are always shown separately; kanban shows other stages
    const [formData, setFormData] = useState<{
        clientName: string;
        clientEmail: string;
        clientPhone: string;
        title: string;
        value: number;
        stageId: string;
        notes: string;
        type: 'one-time' | 'recurring';
    }>({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        title: '',
        value: 0,
        stageId: pipelineStages[0]?.id || 'lead',
        notes: '',
        type: 'one-time',
    });

    const sortedStages = [...pipelineStages].sort((a, b) => a.order - b.order);

    const filteredDeals = deals.filter(
        (deal) =>
            deal.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            deal.clientEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getDealsForStage = (stageId: string) =>
        filteredDeals.filter((deal) => deal.stageId === stageId);

    const getTotalValueForStage = (stageId: string) =>
        getDealsForStage(stageId).reduce((sum, deal) => sum + deal.value, 0);

    const resetForm = () => {
        setFormData({
            clientName: '',
            clientEmail: '',
            clientPhone: '',
            title: '',
            value: 0,
            stageId: pipelineStages[0]?.id || 'lead',
            notes: '',
            type: 'one-time',
        });
        setEditingDeal(null);
    };

    const handleSubmit = () => {
        if (!formData.clientName || !formData.title) {
            toast.error('Preencha os campos obrigatórios');
            return;
        }

        if (editingDeal) {
            updateDeal(editingDeal, formData);
            toast.success(`${terms.deal} atualizado!`);
        } else {
            addDeal(formData);
            toast.success(`${terms.deal} criado!`);
        }

        resetForm();
        setIsDialogOpen(false);
    };

    const handleEdit = (deal: Deal) => {
        setFormData({
            clientName: deal.clientName,
            clientEmail: deal.clientEmail,
            clientPhone: deal.clientPhone,
            title: deal.title,
            value: deal.value,
            stageId: deal.stageId,
            notes: deal.notes || '',
            type: deal.type || 'one-time',
        });
        setEditingDeal(deal.id);
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        deleteDeal(id);
        toast.success(`${terms.deal} removido!`);
    };

    // Drag and Drop handlers
    const handleDragStart = (e: DragEvent, dealId: string) => {
        setDraggedDeal(dealId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: DragEvent, stageId: string) => {
        e.preventDefault();
        if (draggedDeal) {
            moveDeal(draggedDeal, stageId);
            setDraggedDeal(null);
            toast.success(`${terms.deal} movido!`);
        }
    };

    const handleDragEnd = () => {
        setDraggedDeal(null);
    };

    // Estatísticas
    const totalDeals = deals.length;
    const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
    const activeDeals = deals.filter(d => d.stageId !== 'closed' && d.stageId !== 'lost').length;

    return (
        <div className="h-full flex flex-col overflow-hidden w-full relative">
            {/* Fixed Header */}
            <div className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">{terms.crm}</h1>
                    <p className="text-muted-foreground">Gerencie seus {terms.deals.toLowerCase()} e processo comercial</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar..."
                            className="pl-9 w-full sm:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <HistoryViews />

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" title="Configurar Funil">
                                <Settings className="h-5 w-5" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl">
                            <PipelineSettings />
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 whitespace-nowrap">
                                <Plus className="h-4 w-4" />
                                Novo {terms.deal}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>{editingDeal ? `Editar ${terms.deal}` : `Novo ${terms.deal}`}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Nome do {terms.client} *</Label>
                                        <Input
                                            placeholder="Nome completo"
                                            value={formData.clientName}
                                            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input
                                            type="email"
                                            placeholder="email@exemplo.com"
                                            value={formData.clientEmail}
                                            onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Telefone</Label>
                                        <Input
                                            placeholder="(11) 99999-9999"
                                            value={formData.clientPhone}
                                            onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tipo de Serviço</Label>
                                        <Select
                                            value={formData.type}
                                            onValueChange={(value: 'one-time' | 'recurring') => setFormData({ ...formData, type: value })}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="one-time">Serviço Pontual</SelectItem>
                                                <SelectItem value="recurring">Serviço Recorrente</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Selecionar de Lista (Opcional)</Label>
                                    <Select onValueChange={(serviceId) => {
                                        const service = services.find(s => s.id === serviceId);
                                        if (service) {
                                            setFormData({
                                                ...formData,
                                                title: service.name,
                                                value: service.price,
                                                type: service.isRecurring ? 'recurring' : 'one-time'
                                            });
                                        }
                                    }}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione um serviço..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {services.map((service) => (
                                                <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Serviço *</Label>
                                        <Input
                                            placeholder="Nome do serviço..."
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Valor (R$)</Label>
                                        <Input
                                            type="number"
                                            placeholder="0,00"
                                            value={formData.value}
                                            onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Estágio</Label>
                                    <Select
                                        value={formData.stageId}
                                        onValueChange={(value) => setFormData({ ...formData, stageId: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sortedStages.map((stage) => (
                                                <SelectItem key={stage.id} value={stage.id}>
                                                    {stage.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Notas</Label>
                                    <Textarea
                                        placeholder={`Observações sobre este ${terms.deal.toLowerCase()}...`}
                                        rows={3}
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </div>
                                <Button onClick={handleSubmit} className="w-full">
                                    {editingDeal ? 'Salvar Alterações' : `Criar ${terms.deal}`}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Main Content Area: Kanban + Bottom Drop Zones */}
            <div className="flex-1 relative overflow-hidden">

                {/* Kanban Scrollable Area */}
                <div className="absolute inset-0 overflow-x-auto overflow-y-hidden">
                    <div className="flex gap-4 h-full p-4 pb-48 min-w-max">
                        {sortedStages.filter(s => s.id !== 'closed' && s.id !== 'lost').map((stage) => {
                            const stageDeals = getDealsForStage(stage.id);
                            const stageValue = getTotalValueForStage(stage.id);

                            return (
                                <div
                                    key={stage.id}
                                    className="w-80 flex flex-col bg-muted/30 rounded-lg h-full"
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, stage.id)}
                                >
                                    {/* Column Header */}
                                    <div className="p-3 border-b border-border shrink-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: stage.color }}
                                                />
                                                <h3 className="font-semibold text-foreground">{stage.name}</h3>
                                                <Badge variant="secondary" className="ml-1">
                                                    {stageDeals.length}
                                                </Badge>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            R$ {stageValue.toLocaleString('pt-BR')}
                                        </p>
                                    </div>

                                    {/* Column Content - Scrollable */}
                                    <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-0 pb-40">
                                        {stageDeals.map((deal) => (
                                            <Card
                                                key={deal.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, deal.id)}
                                                onDragEnd={handleDragEnd}
                                                className={`cursor-grab active:cursor-grabbing transition-all ${draggedDeal === deal.id ? 'opacity-50 scale-95' : 'hover:shadow-md'
                                                    }`}
                                            >
                                                <CardContent className="p-3">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-medium text-sm text-foreground truncate">
                                                                {deal.title}
                                                            </h4>
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {deal.clientName}
                                                            </p>
                                                        </div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => handleEdit(deal)}>
                                                                    <Pencil className="h-4 w-4 mr-2" />
                                                                    Editar
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDelete(deal.id)}
                                                                    className="text-destructive"
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Excluir
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                                                        {deal.clientEmail && (
                                                            <span className="flex items-center gap-1">
                                                                <Mail className="h-3 w-3" />
                                                                <span className="truncate max-w-24">{deal.clientEmail}</span>
                                                            </span>
                                                        )}
                                                        {deal.clientPhone && (
                                                            <span className="flex items-center gap-1">
                                                                <Phone className="h-3 w-3" />
                                                                {deal.clientPhone}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-2 pt-2 border-t border-border">
                                                        <span className="text-sm font-semibold text-foreground">
                                                            R$ {deal.value.toLocaleString('pt-BR')}
                                                        </span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}

                                        {stageDeals.length === 0 && (
                                            <div className="flex items-center justify-center h-24 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                                                <p className="text-sm text-muted-foreground">Arraste cards aqui</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Drop Targets - Fixed/Absolute Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t z-50">
                    <div className="grid grid-cols-2 gap-4">
                        <div
                            className="p-6 rounded-lg border-2 border-dashed border-red-200 bg-red-50/50 hover:bg-red-50 hover:border-red-300 text-center cursor-pointer transition-colors"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, 'lost')}
                        >
                            <div className="flex flex-col items-center gap-2 text-red-700">
                                <span className="font-semibold text-lg">Perdido</span>
                                <span className="text-sm opacity-80">Arraste aqui para marcar como perdido</span>
                            </div>
                        </div>
                        <div
                            className="p-6 rounded-lg border-2 border-dashed border-green-200 bg-green-50/50 hover:bg-green-50 hover:border-green-300 text-center cursor-pointer transition-colors"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, 'closed')}
                        >
                            <div className="flex flex-col items-center gap-2 text-green-700">
                                <span className="font-semibold text-lg">Fechado</span>
                                <span className="text-sm opacity-80">Arraste aqui para marcar como ganho</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
