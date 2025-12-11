import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBusiness } from '@/contexts/BusinessContext';
import { useTerminology } from '@/hooks/useTerminology';
import { Archive, XCircle, Search, RefreshCcw, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Deal } from '@/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface HistoryViewsProps {
    onEdit: (deal: Deal) => void;
}

export function HistoryViews({ onEdit }: HistoryViewsProps) {
    const { deals, moveDeal, deleteDeal } = useBusiness();
    const terms = useTerminology();
    const [searchTerm, setSearchTerm] = useState('');

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este item permanentemente?')) {
            deleteDeal(id);
            toast.success(`${terms.deal} removido permanentemente!`);
        }
    };

    const closedDeals = deals.filter(d => d.stageId === 'closed');
    const lostDeals = deals.filter(d => d.stageId === 'lost');

    const filteredClosed = closedDeals.filter(d =>
        d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredLost = lostDeals.filter(d =>
        d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex gap-2">
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200">
                        <Archive className="h-4 w-4" />
                        Fechamentos ({closedDeals.length})
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Histórico de Fechamentos</DialogTitle>
                    </DialogHeader>

                    <div className="relative my-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar fechamentos..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                        {filteredClosed.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">Nenhum negócio fechado encontrado.</p>
                        ) : (
                            filteredClosed.map(deal => (
                                <Card key={deal.id}>
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold">{deal.title}</h4>
                                            <p className="text-sm text-muted-foreground">{deal.clientName} • R$ {deal.value.toLocaleString('pt-BR')}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => moveDeal(deal.id, 'lead')}
                                                className="gap-2"
                                            >
                                                <RefreshCcw className="h-3 w-3" />
                                                Reabrir
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => onEdit(deal)}>
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
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2 bg-red-50 hover:bg-red-100 text-red-700 border-red-200">
                        <XCircle className="h-4 w-4" />
                        Perdas ({lostDeals.length})
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Histórico de Perdas</DialogTitle>
                    </DialogHeader>

                    <div className="relative my-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar perdas..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                        {filteredLost.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">Nenhum negócio perdido encontrado.</p>
                        ) : (
                            filteredLost.map(deal => (
                                <Card key={deal.id}>
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold">{deal.title}</h4>
                                            <p className="text-sm text-muted-foreground">{deal.clientName} • R$ {deal.value.toLocaleString('pt-BR')}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => moveDeal(deal.id, 'lead')}
                                                className="gap-2"
                                            >
                                                <RefreshCcw className="h-3 w-3" />
                                                Reabrir
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => onEdit(deal)}>
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
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
