import { useNavigate, useParams } from 'react-router-dom';
import { useBusiness } from '@/contexts/BusinessContext';
import { useTerminology } from '@/hooks/useTerminology';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Phone, Calendar, ArrowUpRight, Camera } from 'lucide-react';
import { useRef } from 'react';
import { ClientFinancialCard } from '@/components/clients/ClientFinancialCard';
import { ClientServicesTab } from '@/components/clients/ClientServicesTab';
import { ClientTimelineTab } from '@/components/clients/ClientTimelineTab';
import { ClientKanbanTab } from '@/components/clients/ClientKanbanTab';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ClientDetails() {
    const { clientId } = useParams();
    const navigate = useNavigate();
    const { clients, transactions, activities, updateClient } = useBusiness();
    const terms = useTerminology();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const client = clients.find((c) => c.id === clientId);

    if (!client) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <h2 className="text-2xl font-bold">{terms.client} não encontrado</h2>
                <Button onClick={() => navigate('/clientes')}>Voltar para {terms.clients}</Button>
            </div>
        );
    }

    const clientTransactions = transactions.filter(t => t.clientId === clientId);
    const clientActivities = activities.filter(a => a.clientId === clientId);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateClient(clientId!, { photo: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Button variant="ghost" className="w-fit pl-0 hover:bg-transparent" onClick={() => navigate('/clientes')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar para Lista
                </Button>

                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Avatar className="h-24 w-24 border-2 border-primary/20 cursor-pointer">
                                <AvatarImage src={client.photo} className="object-cover" />
                                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                    {client.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div
                                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Camera className="h-6 w-6 text-white" />
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-bold text-foreground">{client.name}</h1>
                                <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                                    {client.status === 'active' ? 'Ativo' : 'Inativo'}
                                </Badge>
                            </div>
                            <div className="flex flex-wrap gap-4 mt-2 text-muted-foreground text-sm">
                                {client.email && (
                                    <div className="flex items-center gap-1">
                                        <Mail className="h-4 w-4" />
                                        {client.email}
                                    </div>
                                )}
                                {client.phone && (
                                    <div className="flex items-center gap-1">
                                        <Phone className="h-4 w-4" />
                                        {client.phone}
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Cliente desde {format(parseISO(client.purchaseDate), 'MMM yyyy', { locale: ptBR })}
                                </div>
                            </div>
                        </div>
                    </div>
                    <Button onClick={() => navigate(`/agendar`)} variant="outline" className="gap-2">
                        <ArrowUpRight className="h-4 w-4" />
                        Novo Agendamento
                    </Button>
                </div>
            </div>

            {/* Financial Stats */}
            <ClientFinancialCard transactions={clientTransactions} />

            {/* Main Content Tabs */}
            <Tabs defaultValue="projects" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="projects">Projetos & Tarefas</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="history">Serviços Contratados</TabsTrigger>
                </TabsList>

                <TabsContent value="projects" className="pt-4">
                    <ClientKanbanTab clientId={client.id} />
                </TabsContent>

                <TabsContent value="timeline" className="pt-4">
                    <ClientTimelineTab clientId={client.id} activities={clientActivities} />
                </TabsContent>

                <TabsContent value="history" className="pt-4">
                    <ClientServicesTab clientId={client.id} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
