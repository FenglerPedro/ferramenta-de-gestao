import { useState } from 'react';
import { Meeting } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { format, parseISO, addMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Pencil, Trash2, X, Clock, Mail, User, Calendar, AlignLeft } from 'lucide-react';
import { toast } from 'sonner';

interface AppointmentCardProps {
  meeting: Meeting;
  onUpdate: (id: string, data: Partial<Meeting>) => void;
  onDelete: (id: string) => void;
  children: React.ReactNode;
}

export function AppointmentCard({ meeting, onUpdate, onDelete, children }: AppointmentCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editData, setEditData] = useState({
    clientName: meeting.clientName,
    clientEmail: meeting.clientEmail,
    time: meeting.time,
    duration: meeting.duration,
  });

  const timeSlots = [];
  for (let hour = 9; hour <= 18; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 18) timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

  const formatEndTime = () => {
    const [hours, minutes] = meeting.time.split(':').map(Number);
    const startDate = new Date(2000, 0, 1, hours, minutes);
    const endDate = addMinutes(startDate, meeting.duration);
    return format(endDate, 'HH:mm');
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const handleSave = () => {
    if (!editData.clientName || !editData.clientEmail) {
      toast.error('Preencha todos os campos');
      return;
    }
    onUpdate(meeting.id, editData);
    setIsEditing(false);
    toast.success('Agendamento atualizado!');
  };

  const handleDelete = () => {
    onDelete(meeting.id);
    setShowDeleteConfirm(false);
    setIsOpen(false);
    toast.success('Agendamento excluído!');
  };

  const handleCancel = () => {
    setEditData({
      clientName: meeting.clientName,
      clientEmail: meeting.clientEmail,
      time: meeting.time,
      duration: meeting.duration,
    });
    setIsEditing(false);
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setIsEditing(false);
      }}>
        <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
          {children}
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start" side="right">
          {/* Header */}
          <div className="flex items-center justify-end gap-1 p-2 border-b">
            {!isEditing && (
              <>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditing(true)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowDeleteConfirm(true)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4">
            {isEditing ? (
              /* Edit Mode */
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome do Cliente</Label>
                  <Input
                    value={editData.clientName}
                    onChange={(e) => setEditData({ ...editData, clientName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editData.clientEmail}
                    onChange={(e) => setEditData({ ...editData, clientEmail: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Horário</Label>
                    <Select
                      value={editData.time}
                      onValueChange={(value) => setEditData({ ...editData, time: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Duração</Label>
                    <Select
                      value={editData.duration.toString()}
                      onValueChange={(value) => setEditData({ ...editData, duration: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="60">1 hora</SelectItem>
                        <SelectItem value="90">1h 30min</SelectItem>
                        <SelectItem value="120">2 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={handleCancel} className="flex-1">
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} className="flex-1">
                    Salvar
                  </Button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="space-y-4">
                {/* Title */}
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Agendamento ({meeting.clientName})
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(meeting.date), "EEEE, d 'de' MMMM", { locale: ptBR })} • {meeting.time} – {formatEndTime()}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Duração: {formatDuration(meeting.duration)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{meeting.clientName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${meeting.clientEmail}`} className="text-primary hover:underline">
                      {meeting.clientEmail}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(parseISO(meeting.date), "dd/MM/yyyy", { locale: ptBR })}</span>
                  </div>
                  {meeting.notes && (
                    <div className="flex items-start gap-3 text-sm">
                      <AlignLeft className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-muted-foreground italic">"{meeting.notes}"</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir agendamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O agendamento de {meeting.clientName} será permanentemente excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
