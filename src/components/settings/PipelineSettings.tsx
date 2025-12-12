import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBusiness } from '@/contexts/BusinessContext';
import { PipelineStage } from '@/types';
import { Plus, GripVertical, Pencil, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

const colorOptions = [
    '#6366f1', // Indigo
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#ef4444', // Red
    '#f59e0b', // Amber
    '#22c55e', // Green
    '#14b8a6', // Teal
    '#3b82f6', // Blue
    '#6b7280', // Gray
];

export function PipelineSettings() {
    const { pipelineStages, addPipelineStage, updatePipelineStage, deletePipelineStage, reorderPipelineStages } = useBusiness();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ name: '', color: '' });
    const [newStage, setNewStage] = useState({ name: '', color: '#6366f1' });
    const [showNewForm, setShowNewForm] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const sortedStages = [...pipelineStages]
        .filter(s => s.id !== 'closed' && s.id !== 'lost')
        .sort((a, b) => a.order - b.order);

    const handleEdit = (stage: PipelineStage) => {
        setEditingId(stage.id);
        setEditForm({ name: stage.name, color: stage.color });
    };

    const handleSaveEdit = () => {
        if (!editForm.name.trim()) {
            toast.error('Nome da coluna é obrigatório');
            return;
        }
        if (editingId) {
            updatePipelineStage(editingId, editForm);
            setEditingId(null);
            toast.success('Coluna atualizada!');
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
    };

    const handleAddStage = () => {
        if (!newStage.name.trim()) {
            toast.error('Nome da coluna é obrigatório');
            return;
        }
        addPipelineStage(newStage);
        setNewStage({ name: '', color: '#6366f1' });
        setShowNewForm(false);
        toast.success('Coluna criada!');
    };

    const handleDelete = (id: string) => {
        if (id === 'closed' || id === 'lost') {
            toast.error('Estágios padrão não podem ser removidos');
            return;
        }

        if (pipelineStages.length <= 1) {
            toast.error('Você precisa ter pelo menos uma coluna');
            return;
        }
        deletePipelineStage(id);
        toast.success('Coluna removida!');
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newStages = [...sortedStages];
        const [removed] = newStages.splice(draggedIndex, 1);
        newStages.splice(index, 0, removed);

        reorderPipelineStages(newStages);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Funil de Vendas (CRM)</CardTitle>
                <CardDescription>Configure as colunas do seu Kanban</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    {sortedStages.map((stage, index) => (
                        <div
                            key={stage.id}
                            draggable={editingId !== stage.id}
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`flex items-center gap-3 p-3 rounded-lg border bg-card transition-all ${draggedIndex === index ? 'opacity-50' : ''
                                }`}
                        >
                            <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                                <GripVertical className="h-5 w-5" />
                            </div>

                            {editingId === stage.id ? (
                                <>
                                    <div
                                        className="w-5 h-5 rounded-full shrink-0 cursor-pointer ring-2 ring-offset-2 ring-offset-background"
                                        style={{ backgroundColor: editForm.color }}
                                    />
                                    <Input
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="flex-1"
                                        autoFocus
                                    />
                                    <div className="flex gap-1">
                                        {colorOptions.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setEditForm({ ...editForm, color })}
                                                className={`w-5 h-5 rounded-full transition-transform ${editForm.color === color ? 'scale-125 ring-2 ring-offset-1' : 'hover:scale-110'
                                                    }`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                    <Button size="icon" variant="ghost" onClick={handleSaveEdit}>
                                        <Check className="h-4 w-4 text-green-500" />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={handleCancelEdit}>
                                        <X className="h-4 w-4 text-red-500" />
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div
                                        className="w-5 h-5 rounded-full shrink-0"
                                        style={{ backgroundColor: stage.color }}
                                    />
                                    <span className="flex-1 font-medium">{stage.name}</span>
                                    <Button size="icon" variant="ghost" onClick={() => handleEdit(stage)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleDelete(stage.id)}
                                        disabled={stage.id === 'closed' || stage.id === 'lost'}
                                        title={stage.id === 'closed' || stage.id === 'lost' ? 'Este estágio não pode ser removido' : 'Remover estágio'}
                                    >
                                        <Trash2 className={`h-4 w-4 ${stage.id === 'closed' || stage.id === 'lost' ? 'text-muted-foreground opacity-50' : 'text-destructive'}`} />
                                    </Button>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {showNewForm ? (
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-dashed bg-muted/30">
                        <div
                            className="w-5 h-5 rounded-full shrink-0"
                            style={{ backgroundColor: newStage.color }}
                        />
                        <Input
                            placeholder="Nome da coluna"
                            value={newStage.name}
                            onChange={(e) => setNewStage({ ...newStage, name: e.target.value })}
                            className="flex-1"
                            autoFocus
                        />
                        <div className="flex gap-1">
                            {colorOptions.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setNewStage({ ...newStage, color })}
                                    className={`w-5 h-5 rounded-full transition-transform ${newStage.color === color ? 'scale-125 ring-2 ring-offset-1' : 'hover:scale-110'
                                        }`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                        <Button size="icon" variant="ghost" onClick={handleAddStage}>
                            <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setShowNewForm(false)}>
                            <X className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                ) : (
                    <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => setShowNewForm(true)}
                    >
                        <Plus className="h-4 w-4" />
                        Adicionar Coluna
                    </Button>
                )}

                <p className="text-xs text-muted-foreground">
                    Arraste as colunas para reordená-las. As alterações são salvas automaticamente.
                </p>
            </CardContent>
        </Card>
    );
}
