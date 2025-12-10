import { useState, DragEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBusiness } from '@/contexts/BusinessContext';
import { ProjectTask } from '@/types';
import { Plus, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useTerminology } from '@/hooks/useTerminology';

interface ClientKanbanTabProps {
    clientId: string;
}

export function ClientKanbanTab({ clientId }: ClientKanbanTabProps) {
    const { projectTasks, projectStages, addProjectTask, updateProjectTask, deleteProjectTask, moveProjectTask } = useBusiness();
    const terms = useTerminology();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<string | null>(null);
    const [draggedTask, setDraggedTask] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        stageId: projectStages[0]?.id || 'planning',
        priority: 'medium' as 'low' | 'medium' | 'high',
        dueDate: '',
    });

    const clientTasks = projectTasks.filter(t => t.clientId === clientId);
    const sortedStages = [...projectStages].sort((a, b) => a.order - b.order);

    const getTasksForStage = (stageId: string) => clientTasks.filter(t => t.stageId === stageId);

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            stageId: projectStages[0]?.id || 'planning',
            priority: 'medium',
            dueDate: '',
        });
        setEditingTask(null);
    };

    const handleSubmit = () => {
        if (!formData.title) {
            toast.error('Digite um título para a tarefa');
            return;
        }

        if (editingTask) {
            updateProjectTask(editingTask, formData);
            toast.success(`${terms.task} atualizada!`);
        } else {
            addProjectTask({ ...formData, clientId });
            toast.success(`${terms.task} criada!`);
        }

        resetForm();
        setIsDialogOpen(false);
    };

    const handleEdit = (task: ProjectTask) => {
        setFormData({
            title: task.title,
            description: task.description || '',
            stageId: task.stageId,
            priority: task.priority || 'medium',
            dueDate: task.dueDate || '',
        });
        setEditingTask(task.id);
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        deleteProjectTask(id);
        toast.success(`${terms.task} removida!`);
    };

    const handleDragStart = (e: DragEvent, taskId: string) => {
        setDraggedTask(taskId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: DragEvent, stageId: string) => {
        e.preventDefault();
        if (draggedTask) {
            moveProjectTask(draggedTask, stageId);
            setDraggedTask(null);
            toast.success(`${terms.task} movida!`);
        }
    };

    const handleDragEnd = () => {
        setDraggedTask(null);
    };

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'high': return 'text-red-500';
            case 'medium': return 'text-yellow-500';
            case 'low': return 'text-green-500';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-250px)]">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">{terms.projects} e Tarefas</h3>
                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Nova {terms.task}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingTask ? `Editar ${terms.task}` : `Nova ${terms.task}`}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Título *</Label>
                                <Input
                                    placeholder="Ex: Criar layout inicial"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Descrição</Label>
                                <Textarea
                                    placeholder={`Detalhes da ${terms.task.toLowerCase()}...`}
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Estágio</Label>
                                    <Select value={formData.stageId} onValueChange={(value) => setFormData({ ...formData, stageId: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sortedStages.map((stage) => (
                                                <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Prioridade</Label>
                                    <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData({ ...formData, priority: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Baixa</SelectItem>
                                            <SelectItem value="medium">Média</SelectItem>
                                            <SelectItem value="high">Alta</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Data de Entrega</Label>
                                <Input
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                />
                            </div>
                            <Button onClick={handleSubmit} className="w-full">
                                {editingTask ? 'Salvar Alterações' : `Criar ${terms.task}`}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-max h-full">
                    {sortedStages.map((stage) => {
                        const stageTasks = getTasksForStage(stage.id);

                        return (
                            <div
                                key={stage.id}
                                className="w-80 flex flex-col bg-muted/30 rounded-lg"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, stage.id)}
                            >
                                <div className="p-3 border-b border-border">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                                        <h3 className="font-semibold text-foreground">{stage.name}</h3>
                                        <Badge variant="secondary" className="ml-auto">{stageTasks.length}</Badge>
                                    </div>
                                </div>

                                <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-350px)]">
                                    {stageTasks.map((task) => (
                                        <Card
                                            key={task.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, task.id)}
                                            onDragEnd={handleDragEnd}
                                            className={`cursor-grab active:cursor-grabbing transition-all ${draggedTask === task.id ? 'opacity-50 scale-95' : 'hover:shadow-md'
                                                }`}
                                        >
                                            <CardContent className="p-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-sm text-foreground">{task.title}</h4>
                                                        {task.description && (
                                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                                                        )}
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleEdit(task)}>
                                                                <Pencil className="h-4 w-4 mr-2" />
                                                                Editar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleDelete(task.id)} className="text-destructive">
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Excluir
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                                <div className="mt-2 flex items-center gap-2">
                                                    {task.priority && (
                                                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                                            {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                                                        </Badge>
                                                    )}
                                                    {task.dueDate && (
                                                        <span className="text-xs text-muted-foreground">{task.dueDate}</span>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}

                                    {stageTasks.length === 0 && (
                                        <div className="flex items-center justify-center h-24 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                                            <p className="text-sm text-muted-foreground">Arraste {terms.tasks.toLowerCase()} aqui</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
