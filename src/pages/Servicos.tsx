import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CurrencyInput } from '@/components/ui/currency-input';
import { useBusiness } from '@/contexts/BusinessContext';
import { Plus, Pencil, Trash2, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { useTerminology } from '@/hooks/useTerminology';

export default function Servicos() {
  const { services, addService, updateService, deleteService } = useBusiness();
  const terms = useTerminology();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    duration: '',
    isRecurring: false,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      duration: '',
      isRecurring: false,
    });
    setEditingService(null);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.description || !formData.price) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    if (editingService) {
      updateService(editingService, formData);
      toast.success(`${terms.service} atualizado com sucesso!`);
    } else {
      addService(formData);
      toast.success(`${terms.service} adicionado com sucesso!`);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (service: typeof services[0]) => {
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      isRecurring: service.isRecurring,
    });
    setEditingService(service.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteService(id);
    toast.success(`${terms.service} removido com sucesso!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{terms.services}</h1>
          <p className="text-muted-foreground">Gerencie seus {terms.services.toLowerCase()} e preços</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo {terms.service}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingService ? `Editar ${terms.service}` : `Adicionar ${terms.service}`}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Nome do {terms.service} *</Label>
                <Input
                  placeholder={`Ex: ${terms.service} Premium`}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição *</Label>
                <Textarea
                  placeholder={`Descreva seu ${terms.service.toLowerCase()}...`}
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preço *</Label>
                  <CurrencyInput
                    value={formData.price}
                    onChange={(value) => setFormData({ ...formData, price: value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duração</Label>
                  <Input
                    placeholder="Ex: 1 mês, 3 meses"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="space-y-1">
                  <Label>{terms.service} Recorrente</Label>
                  <p className="text-xs text-muted-foreground">Ative se for um {terms.service.toLowerCase()} por assinatura</p>
                </div>
                <Switch
                  checked={formData.isRecurring}
                  onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked })}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingService ? 'Salvar Alterações' : `Adicionar ${terms.service}`}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    {service.isRecurring && (
                      <Badge variant="secondary" className="gap-1">
                        <RefreshCw className="h-3 w-3" />
                        Recorrente
                      </Badge>
                    )}
                    {service.duration && (
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        {service.duration}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(service)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(service.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive-foreground" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-sm">{service.description}</CardDescription>
              <div className="pt-4 border-t border-border">
                <p className="text-2xl font-bold text-foreground">
                  R$ {service.price.toLocaleString('pt-BR')}
                  {service.isRecurring && (
                    <span className="text-sm font-normal text-muted-foreground">/mês</span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
