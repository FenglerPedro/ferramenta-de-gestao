import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBusiness } from '@/contexts/BusinessContext';
import { format, parseISO, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isToday, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { AppointmentCard } from '@/components/agenda/AppointmentCard';
import { validateEmail } from '@/utils/masks';

import { useTerminology } from '@/hooks/useTerminology';

export default function Agenda() {
  const { meetings, addMeeting, updateMeeting, deleteMeeting, settings } = useBusiness();
  const terms = useTerminology();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    time: '09:00',
    duration: 60,
  });

  const timeSlots: string[] = [];
  const startHour = parseInt(settings.availableHours.start.split(':')[0]);
  const endHour = parseInt(settings.availableHours.end.split(':')[0]);

  for (let hour = startHour; hour <= endHour; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < endHour) timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

  const getOccupiedSlots = (date: Date) => {
    const dayMeetings = meetings.filter((m) => isSameDay(parseISO(m.date), date));
    const occupied = new Set<string>();

    // 1. Mark slots from scheduled meetings
    dayMeetings.forEach((meeting) => {
      const [startHour, startMin] = meeting.time.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = startMinutes + meeting.duration;

      // Mark all 30-min slots that overlap with this meeting
      timeSlots.forEach((slot) => {
        const [slotHour, slotMin] = slot.split(':').map(Number);
        const slotStart = slotHour * 60 + slotMin;
        const slotEnd = slotStart + 30;

        if (slotStart < endMinutes && slotEnd > startMinutes) {
          occupied.add(slot);
        }
      });
    });

    // 2. Mark slots from blocked time periods (User Settings)
    if (settings.blockedTimeSlots && settings.blockedTimeSlots.length > 0) {
      settings.blockedTimeSlots.forEach((blocked) => {
        const [startHour, startMin] = blocked.startTime.split(':').map(Number);
        const endHourPart = blocked.endTime.split(':').map(Number);

        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHourPart[0] * 60 + endHourPart[1];

        timeSlots.forEach((slot) => {
          const [slotHour, slotMin] = slot.split(':').map(Number);
          const slotStart = slotHour * 60 + slotMin;
          const slotEnd = slotStart + 30;

          // If the slot simply OVERLAPS with the blocked period
          // Standard overlap logic: max(start1, start2) < min(end1, end2)
          if (Math.max(slotStart, startMinutes) < Math.min(slotEnd, endMinutes)) {
            occupied.add(slot);
          }
        });
      });
    }

    return occupied;
  };

  const getAvailableSlots = (date: Date) => {
    const occupied = getOccupiedSlots(date);
    return timeSlots.filter((slot) => !occupied.has(slot));
  };

  const handleAddMeeting = () => {
    if (!newMeeting.clientName) {
      toast.error('Preencha o nome do cliente');
      return;
    }

    if (newMeeting.clientEmail && !validateEmail(newMeeting.clientEmail)) {
      toast.error('Email inválido');
      return;
    }

    const occupied = getOccupiedSlots(selectedDate);
    if (occupied.has(newMeeting.time)) {
      toast.error('Este horário já está ocupado. Escolha outro horário.');
      return;
    }

    addMeeting({
      ...newMeeting,
      title: `Reunião - ${newMeeting.clientName}`,
      date: format(selectedDate, 'yyyy-MM-dd'),
      status: 'scheduled',
    });

    setNewMeeting({ clientName: '', clientEmail: '', clientPhone: '', time: '09:00', duration: 60 });
    setIsDialogOpen(false);
    toast.success(`${terms.meeting} agendada com sucesso!`);
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weekDays = ['DOM.', 'SEG.', 'TER.', 'QUA.', 'QUI.', 'SEX.', 'SÁB.'];

  const getMeetingsForDay = (date: Date) => {
    return meetings.filter((m) => isSameDay(parseISO(m.date), date));
  };

  const isDayBlocked = (date: Date) => {
    // Check blocked days of week
    const dayOfWeek = parseInt(format(date, 'i')) % 7; // 0=Sunday, 6=Saturday

    // Check if day is enabled in schedule
    if (settings.daySchedules[dayOfWeek] && !settings.daySchedules[dayOfWeek].enabled) return true;

    // Check specific blocked dates
    const dateStr = format(date, 'yyyy-MM-dd');
    if (settings.blockedDates.some(bd => bd.date === dateStr)) return true;

    return false;
  };

  const handleDayClick = (date: Date) => {
    if (isDayBlocked(date)) {
      toast.error('Este dia não está disponível para atendimentos.');
      return;
    }

    setSelectedDate(date);
    const availableSlots = getAvailableSlots(date);
    const firstAvailable = availableSlots.length > 0 ? availableSlots[0] : settings.availableHours.start;
    setNewMeeting({ clientName: '', clientEmail: '', clientPhone: '', time: firstAvailable, duration: 60 });
    setIsDialogOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={goToToday} size="sm">
            Hoje
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <h1 className="text-xl font-semibold text-foreground capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mr-2 gap-2"
          onClick={() => {
            const url = `${window.location.origin}/agendar`;
            navigator.clipboard.writeText(url);
            toast.success('Link de agendamento copiado para a área de transferência!');
          }}
        >
          <Share2 className="h-4 w-4" />
          Link de Agendamento
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Nova {terms.meeting}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Agendar {terms.meeting} - {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Nome do {terms.client}</Label>
                <Input
                  placeholder="Nome completo"
                  value={newMeeting.clientName}
                  onChange={(e) => setNewMeeting({ ...newMeeting, clientName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  placeholder="(11) 99999-9999"
                  value={newMeeting.clientPhone}
                  onChange={(e) => setNewMeeting({ ...newMeeting, clientPhone: e.target.value })}
                  maxLength={15}
                />
              </div>
              <div className="space-y-2">
                <Label>Email (opcional)</Label>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={newMeeting.clientEmail}
                  onChange={(e) => setNewMeeting({ ...newMeeting, clientEmail: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Horário</Label>
                  <Select
                    value={newMeeting.time}
                    onValueChange={(value) => setNewMeeting({ ...newMeeting, time: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        const occupied = getOccupiedSlots(selectedDate);
                        return timeSlots.map((slot) => {
                          const isOccupied = occupied.has(slot);
                          return (
                            <SelectItem
                              key={slot}
                              value={slot}
                              disabled={isOccupied}
                              className={isOccupied ? 'text-muted-foreground line-through' : ''}
                            >
                              {slot} {isOccupied && '(ocupado)'}
                            </SelectItem>
                          );
                        });
                      })()}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Duração</Label>
                  <Select
                    value={newMeeting.duration.toString()}
                    onValueChange={(value) => setNewMeeting({ ...newMeeting, duration: parseInt(value) })}
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
              <Button onClick={handleAddMeeting} className="w-full">
                Agendar {terms.meeting}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 mt-4">
        {/* Week days header */}
        <div className="grid grid-cols-7 border-b">
          {weekDays.map((weekDay) => (
            <div
              key={weekDay}
              className="py-2 text-center text-xs font-medium text-muted-foreground border-r last:border-r-0"
            >
              {weekDay}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 flex-1" style={{ minHeight: 'calc(100vh - 220px)' }}>
          {days.map((dayDate, index) => {
            const dayMeetings = getMeetingsForDay(dayDate);
            const isCurrentMonth = isSameMonth(dayDate, currentMonth);
            const isSelected = isSameDay(dayDate, selectedDate);
            const isTodayDate = isToday(dayDate);

            const isBlocked = isDayBlocked(dayDate);

            return (
              <div
                key={index}
                onClick={() => handleDayClick(dayDate)}
                className={`border-b border-r last:border-r-0 p-1 min-h-[100px] transition-colors 
                  ${!isCurrentMonth ? 'bg-muted/20' : ''}
                  ${isBlocked ? 'bg-red-50/50 dark:bg-red-900/10 cursor-not-allowed' : 'cursor-pointer hover:bg-muted/50'}
                `}
              >
                <div className="flex justify-center mb-1">
                  <span
                    className={`text-sm w-7 h-7 flex items-center justify-center rounded-full ${isTodayDate
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : isSelected
                        ? 'bg-accent text-accent-foreground'
                        : !isCurrentMonth
                          ? 'text-muted-foreground'
                          : 'text-foreground'
                      }`}
                  >
                    {format(dayDate, 'd')}
                  </span>
                  {isBlocked && (
                    <span className="text-[10px] text-red-500 font-medium ml-1">Fechado</span>
                  )}
                </div>
                <div className="space-y-0.5 overflow-y-auto max-h-[calc(100%-28px)]">
                  {dayMeetings.map((meeting) => (
                    <AppointmentCard
                      key={meeting.id}
                      meeting={meeting}
                      onUpdate={updateMeeting}
                      onDelete={deleteMeeting}
                    >
                      <div
                        className="text-xs px-1.5 py-0.5 rounded bg-primary/15 text-primary truncate cursor-pointer hover:bg-primary/25 transition-colors"
                      >
                        <span className="font-medium">{meeting.time}</span>{' '}
                        {meeting.clientName}
                      </div>
                    </AppointmentCard>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
