import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useBusiness } from '@/contexts/BusinessContext';
import { useTerminology } from '@/hooks/useTerminology';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Search, Pencil, Trash2, Kanban as KanbanIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Clientes() {
  const { clients, services, addClient, updateClient, deleteClient, purchasedServices } = useBusiness();
  const terms = useTerminology();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    services: string[];
    totalValue: number;
    purchaseDate: string;
    isRecurring: boolean;
    monthlyValue: number;
    status: 'active' | 'inactive' | 'pending';
  }>({
    name: '',
    email: '',
    phone: '',
    services: [],
    totalValue: 0,
    purchaseDate: format(new Date(), 'yyyy-MM-dd'),
    isRecurring: false,
    monthlyValue: 0,
    status: 'active',
  });

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      services: [],
      totalValue: 0,
      purchaseDate: format(new Date(), 'yyyy-MM-dd'),
      isRecurring: false,
      monthlyValue: 0,
      status: 'active',
    });
    setEditingClient(null);
  };

  const handleSubmit = () => {
    if (!formData.name || formData.services.length === 0) {
      toast.error(`Preencha o nome e selecione pelo menos um ${terms.service.toLowerCase()}`);
      return;
    }

    const clientData = {
      ...formData,
      service: formData.services[0], // Compatibilidade
    };

    if (editingClient) {
      updateClient(editingClient, clientData);
      toast.success(`${terms.client} atualizado com sucesso!`);
    } else {
      addClient(clientData);
      toast.success(`${terms.client} adicionado com sucesso!`);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (client: typeof clients[0]) => {
    // Sync services from PurchasedServices
    const clientPurchasedServices = purchasedServices
      .filter(s => s.clientId === client.id)
      .map(s => s.serviceName);
    
    const allServices = Array.from(new Set([
      ...(client.services || [client.service]),
      ...clientPurchasedServices
    ])).filter(Boolean);

    setFormData({
      name: client.name,
      email: client.email || '',
      phone: client.phone,
      services: allServices,
      totalValue: client.totalValue,
      purchaseDate: client.purchaseDate,
      isRecurring: client.isRecurring,
      monthlyValue: client.monthlyValue || 0,
      status: client.status,
    });
    setEditingClient(client.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteClient(id);
    toast.success(`${terms.client} removido com sucesso!`);
  };

  const toggleService = (serviceName: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(serviceName)
        ? prev.services.filter(s => s !== serviceName)
        : [...prev.services, serviceName]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{terms.clients}</h1>
          <p className="text-muted-foreground">Gerencie seus {terms.clients.toLowerCase()} e contratos</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Buscar ${terms.clients.toLowerCase()}...`}
              className="pl-9 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2 whitespace-nowrap">
                <Plus className="h-4 w-4" />
                Novo {terms.client}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingClient ? `Editar ${terms.client}` : `Novo ${terms.client}`}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome *</Label>
                    <Input
                      placeholder="Nome completo"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="email@exemplo.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                      placeholder="(11) 99999-9999"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor Total *</Label>
                    <CurrencyInput
                      value={formData.totalValue}
                      onChange={(value) => setFormData({ ...formData, totalValue: value })}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{terms.services} *</Label>
                  <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg">
                    {services.map((service) => (
                      <div key={service.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`service-${service.id}`}
                          checked={formData.services.includes(service.name)}
                          onChange={() => toggleService(service.name)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <label
                          htmlFor={`service-${service.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {service.name}
                        </label>
                      </div>
                    ))}
                  </div>
                  {formData.services.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.services.map((serviceName) => (
                        <Badge key={serviceName} variant="secondary">
                          {serviceName}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data da Compra</Label>
                    <Input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: 'active' | 'inactive' | 'pending') =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Serviço Recorrente</Label>
                      <p className="text-xs text-muted-foreground">Esta opção foi movida para os detalhes do serviço.</p>
                    </div>
                    {/* Switch removed as requested */}
                  </div>
                </div>
                <Button onClick={handleSubmit} className="w-full">
                  {editingClient ? 'Salvar Alterações' : `Adicionar ${terms.client}`}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de {terms.clients}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Nome</TableHead>
                <TableHead className="w-[150px]">Telefone</TableHead>
                <TableHead className="hidden lg:table-cell w-[200px]">E-mail</TableHead>
                <TableHead className="hidden sm:table-cell">Valor Pago</TableHead>
                <TableHead className="hidden md:table-cell">Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => {
                const clientTransactions = useBusiness().transactions.filter(t => t.clientId === client.id && t.status === 'paid');
                const paidValue = clientTransactions.reduce((acc, t) => acc + t.amount, 0);

                return (
                  <TableRow key={client.id}>
                    <TableCell className="max-w-[200px]">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="font-medium truncate cursor-default">{client.name}</p>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{client.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="max-w-[150px]">
                      <span className="text-sm truncate block">{client.phone || '-'}</span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell max-w-[200px]">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-sm text-muted-foreground truncate block cursor-default">
                              {client.email || '-'}
                            </span>
                          </TooltipTrigger>
                          {client.email && (
                            <TooltipContent>
                              <p>{client.email}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-green-600 font-medium whitespace-nowrap">
                        R$ {paidValue.toLocaleString('pt-BR')}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell whitespace-nowrap">
                      {format(parseISO(client.purchaseDate), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          client.status === 'active'
                            ? 'default'
                            : client.status === 'inactive'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {client.status === 'active' ? 'Ativo' : client.status === 'inactive' ? 'Inativo' : 'Pendente'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/clientes/${client.id}`)}
                          title="Ver Detalhes"
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(client)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(client.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
