import { useState } from 'react';
import { ClientActivity } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Phone, Mail, Users, FileText, Monitor, MoreHorizontal, Pencil, Trash2, Check, X } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useBusiness } from '@/contexts/BusinessContext';

interface ClientTimelineTabProps {
    clientId: string;
    activities: ClientActivity[];
}

const iconMap = {
    call: Phone,
    email: Mail,
    meeting: Users,
    note: FileText,
    system: Monitor,
};

const colorMap = {
    call: 'bg-blue-100 text-blue-600',
    email: 'bg-yellow-100 text-yellow-600',
    meeting: 'bg-purple-100 text-purple-600',
    note: 'bg-gray-100 text-gray-600',
    system: 'bg-slate-100 text-slate-600',
};

export function ClientTimelineTab({ clientId, activities }: ClientTimelineTabProps) {
    const { addActivity, updateActivity, deleteActivity } = useBusiness();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [newActivity, setNewActivity] = useState({
        type: 'note',
        content: '',
    });

    const sortedActivities = [...activities].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const handleAddActivity = () => {
        if (!newActivity.content) return;

        addActivity({
            clientId,
            type: newActivity.type as any,
            title: newActivity.type === 'note' ? 'Nota adicionada' : 'Interação registrada',
            description: newActivity.content,
            date: new Date().toISOString(),
        });

        setNewActivity({ type: 'note', content: '' });
    };

    const handleEditStart = (activity: ClientActivity) => {
        setEditingId(activity.id);
        setEditContent(activity.description || '');
    };

    const handleEditSave = (id: string) => {
        if (!editContent.trim()) return;
        updateActivity(id, { description: editContent });
        setEditingId(null);
        setEditContent('');
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditContent('');
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta atividade?')) {
            deleteActivity(id);
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-[1fr,300px]">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Linha do Tempo</CardTitle>
                        <CardDescription>Histórico de interações e notas</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative border-l border-muted ml-4 space-y-8 pb-4">
                            {sortedActivities.length > 0 ? (
                                sortedActivities.map((activity) => {
                                    const Icon = iconMap[activity.type] || FileText;
                                    return (
                                        <div key={activity.id} className="relative pl-8">
                                            <span className={`absolute -left-4 top-0 flex h-8 w-8 items-center justify-center rounded-full border bg-background ${colorMap[activity.type] || 'text-muted-foreground'}`}>
                                                <Icon className="h-4 w-4" />
                                            </span>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 justify-between w-full">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold">{activity.title}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {format(parseISO(activity.date), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                                                        </span>
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                                <MoreHorizontal className="h-3 w-3" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleEditStart(activity)}>
                                                                <Pencil className="mr-2 h-3 w-3" />
                                                                Editar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleDelete(activity.id)} className="text-destructive">
                                                                <Trash2 className="mr-2 h-3 w-3" />
                                                                Excluir
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                                {editingId === activity.id ? (
                                                    <div className="mt-2 space-y-2">
                                                        <Textarea
                                                            value={editContent}
                                                            onChange={(e) => setEditContent(e.target.value)}
                                                            className="min-h-[80px]"
                                                        />
                                                        <div className="flex gap-2 justify-end">
                                                            <Button size="sm" variant="outline" onClick={handleEditCancel}>
                                                                <X className="h-3 w-3 mr-1" /> Cancelar
                                                            </Button>
                                                            <Button size="sm" onClick={() => handleEditSave(activity.id)}>
                                                                <Check className="h-3 w-3 mr-1" /> Salvar
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-foreground bg-muted/40 p-3 rounded-md mt-1">
                                                        {activity.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="pl-8 py-4 text-muted-foreground">Nenhuma atividade registrada ainda.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Nova Interação</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Select
                            value={newActivity.type}
                            onValueChange={(v) => setNewActivity({ ...newActivity, type: v })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="note">Nota</SelectItem>
                                <SelectItem value="call">Ligação</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="meeting">Reunião</SelectItem>
                            </SelectContent>
                        </Select>

                        <Textarea
                            placeholder="Descreva a interação..."
                            className="resize-none min-h-[100px]"
                            value={newActivity.content}
                            onChange={(e) => setNewActivity({ ...newActivity, content: e.target.value })}
                        />

                        <Button onClick={handleAddActivity} className="w-full">
                            Registrar
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
