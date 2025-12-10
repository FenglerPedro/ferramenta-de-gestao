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
import { Plus, Search, Phone, Mail, MoreVertical, Pencil, Trash2, DollarSign, TrendingUp, Users } from 'lucide-react';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useTerminology } from '@/hooks/useTerminology';

export default function CRM() {
    const { deals, pipelineStages, addDeal, updateDeal, deleteDeal, moveDeal } = useBusiness();
    const terms = useTerminology();
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDeal, setEditingDeal] = useState<string | null>(null);
    const [draggedDeal, setDraggedDeal] = useState<string | null>(null);
    // closed and lost are always shown separately; kanban shows other stages
    const [formData, setFormData] = useState({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        title: '',
        value: 0,
        stageId: pipelineStages[0]?.id || 'lead',
        notes: '',
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
        <div className="h-full flex flex-col overflow-hidden">
            {/* Fixed Header - não rola horizontalmente */}
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
                    {/* closed/lost will be shown above the kanban; no toggle needed */}

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
                                    <Label>Título do {terms.deal} *</Label>
                                    <Input
                                        placeholder="Ex: Consultoria Mensal"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
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

            {/* Closed / Lost panels always visible above kanban */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Fechados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {deals.filter(d => d.stageId === 'closed').length === 0 ? (
                            <p className="text-sm text-muted-foreground">Nenhum deal fechado</p>
                        ) : (
                            <div className="space-y-2">
                                {deals.filter(d => d.stageId === 'closed').map(d => (
                                    <div key={d.id} className="p-2 bg-muted rounded flex items-center justify-between">
                                        <div>
                                            <div className="font-medium">{d.title}</div>
                                            <div className="text-xs text-muted-foreground">{d.clientName} — R$ {d.value.toLocaleString('pt-BR')}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" variant="ghost" onClick={() => moveDeal(d.id, 'lead')}>Reabrir</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Perdidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {deals.filter(d => d.stageId === 'lost').length === 0 ? (
                            <p className="text-sm text-muted-foreground">Nenhum deal perdido</p>
                        ) : (
                            <div className="space-y-2">
                                {deals.filter(d => d.stageId === 'lost').map(d => (
                                    <div key={d.id} className="p-2 bg-muted rounded flex items-center justify-between">
                                        <div>
                                            <div className="font-medium">{d.title}</div>
                                            <div className="text-xs text-muted-foreground">{d.clientName} — R$ {d.value.toLocaleString('pt-BR')}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" variant="ghost" onClick={() => moveDeal(d.id, 'lead')}>Reabrir</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Kanban (only non-closed/non-lost stages) */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <div className="flex gap-4 min-w-max h-full pb-4">
                    {sortedStages.filter(s => s.id !== 'closed' && s.id !== 'lost').map((stage) => {
                        const stageDeals = getDealsForStage(stage.id);
                        const stageValue = getTotalValueForStage(stage.id);

                        return (
                            <div
                                key={stage.id}
                                className="w-80 flex flex-col bg-muted/30 rounded-lg"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, stage.id)}
                            >
                                {/* Column Header */}
                                <div className="p-3 border-b border-border">
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

                                {/* Column Content */}
                                <div className="flex-1 p-2 space-y-2 overflow-y-auto">
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

                {/* Bottom drop targets for Closed / Lost */}
                <div className="mt-6 flex gap-4">
                    <div
                        className="flex-1 p-6 rounded-lg border border-border bg-red-50 text-center cursor-pointer"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'lost')}
                    >
                        <strong>Arraste aqui para marcar como Perdido</strong>
                    </div>
                    <div
                        className="flex-1 p-6 rounded-lg border border-border bg-green-50 text-center cursor-pointer"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'closed')}
                    >
                        <strong>Arraste aqui para marcar como Fechado</strong>
                    </div>
                </div>
            </div>
        </div>
    );
}
