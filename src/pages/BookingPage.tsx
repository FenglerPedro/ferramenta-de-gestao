import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useBusiness } from '@/contexts/BusinessContext';
import { format, isBefore, startOfToday, parseISO, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, Check, ChevronLeft, Calendar as CalendarIcon, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { validateEmail } from '@/utils/masks';

export default function BookingPage() {
  const { settings, meetings, addMeeting } = useBusiness();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'form' | 'success'>('select');
  const [formData, setFormData] = useState({ name: '', email: '', notes: '' });

  // Validate if a date is generally available (not checking specific times yet)
  const isDateAvailable = (date: Date) => {
    // Cannot book past dates
    if (isBefore(date, startOfToday())) return false;

    // Check specific blocked dates from settings
    const dateStr = format(date, 'yyyy-MM-dd');
    if (settings.blockedDates?.some(bd => bd.date === dateStr)) return false;

    // Check if day of week is enabled in schedule
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday...
    const schedule = settings.daySchedules?.[dayOfWeek];

    // If we have detailed schedule, use it
    if (schedule) {
      return schedule.enabled;
    }

    // Fallback to legacy array if daySchedules is missing (backwards compat)
    return settings.availableDays.includes(dayOfWeek);
  };

  // Check strict availability for a specific time slot
  const checkAvailability = (date: Date, time: string, duration: number) => {
    const [h, m] = time.split(':').map(Number);
    const slotStart = h * 60 + m;
    const slotEnd = slotStart + duration;

    // 1. Check existing meetings for this day
    const dayMeetings = meetings.filter(m => isSameDay(parseISO(m.date), date));
    for (const meeting of dayMeetings) {
      if (meeting.status === 'cancelled') continue;

      const [mh, mm] = meeting.time.split(':').map(Number);
      const mStart = mh * 60 + mm;
      const mEnd = mStart + meeting.duration;

      // Check for overlap: max(start1, start2) < min(end1, end2)
      if (Math.max(slotStart, mStart) < Math.min(slotEnd, mEnd)) {
        return false; // Overlaps with an existing meeting
      }
    }

    // 2. Check blocked time slots (Lunch breaks, etc.)
    if (settings.blockedTimeSlots) {
      for (const block of settings.blockedTimeSlots) {
        const [bh, bm] = block.startTime.split(':').map(Number);
        const [eh, em] = block.endTime.split(':').map(Number);
        const bStart = bh * 60 + bm;
        const bEnd = eh * 60 + em;

        if (Math.max(slotStart, bStart) < Math.min(slotEnd, bEnd)) {
          return false; // Overlaps with a blocked period
        }
      }
    }

    return true;
  };

  // Generate available time slots for the selected date
  const timeSlots = useMemo(() => {
    if (!selectedDate || !isDateAvailable(selectedDate)) return [];

    const dayOfWeek = selectedDate.getDay();
    const schedule = settings.daySchedules?.[dayOfWeek];

    // Determine start/end times for this specific day
    let startStr = settings.availableHours.start;
    let endStr = settings.availableHours.end;

    if (schedule && schedule.enabled) {
      startStr = schedule.startTime;
      endStr = schedule.endTime;
    }

    const [startH, startM] = startStr.split(':').map(Number);
    const [endH, endM] = endStr.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    const slots: string[] = [];
    let current = startMinutes;
    const step = 30; // 30 minute granularity for starting times

    // Loop until the meeting would end after the closing time
    while (current + settings.meetingDuration <= endMinutes) {
      const h = Math.floor(current / 60);
      const m = current % 60;
      const timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

      if (checkAvailability(selectedDate, timeString, settings.meetingDuration)) {
        slots.push(timeString);
      }

      current += step;
    }
    return slots;
  }, [selectedDate, settings, meetings]);

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep('form');
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email) {
      toast.error('Por favor, preencha todos os campos.');
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error('Email inválido');
      return;
    }

    if (!selectedDate || !selectedTime) return;

    addMeeting({
      clientName: formData.name,
      clientEmail: formData.email,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime,
      duration: settings.meetingDuration,
      status: 'scheduled',
      notes: formData.notes,
    });

    setStep('success');
    toast.success('Agendamento realizado com sucesso!');
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-xl border-none overflow-hidden h-[90vh] max-h-[700px] flex flex-col md:flex-row">
        {/* Sidebar / Info */}
        <div className="w-full md:w-1/3 bg-white border-r p-6 flex flex-col h-full overflow-y-auto">
          <div className="mb-6 flex flex-col items-center text-center">
            <Avatar className="h-20 w-20 mb-4 shadow-sm">
              {settings.logo ? (
                <AvatarImage src={settings.logo} alt={settings.businessName} />
              ) : null}
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                {settings.businessName?.substring(0, 2).toUpperCase() || 'E'}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold text-gray-800">{settings.ownerName}</h2>
            <p className="text-sm text-gray-500 font-medium">{settings.businessName}</p>
          </div>

          <div className="space-y-4 text-sm text-gray-600 flex-1">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800">{settings.meetingDuration} min</p>
                <p>Duração da reunião</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800">Videoconferência</p>
                <p>Detalhes enviados após confirmação</p>
              </div>
            </div>
            {selectedDate && selectedTime && (
              <div className="flex items-start gap-3 mt-6 pt-6 border-t font-medium text-primary">
                <CalendarIcon className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="capitalize">
                    {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                  </p>
                  <p>{selectedTime}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-auto text-xs text-gray-400 text-center pt-4">
            Desenvolvido por Ferramenta de Gestão
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white p-6 md:p-8 flex flex-col h-full overflow-y-auto">

          {step === 'select' && (
            <div className="h-full flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Selecione uma data e horário</h3>

              <div className="flex flex-col md:flex-row gap-8 flex-1">
                {/* Calendar Column */}
                <div className="flex-shrink-0 mx-auto md:mx-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) setSelectedDate(date);
                      setSelectedTime(null);
                    }}
                    disabled={(date) => !isDateAvailable(date)}
                    locale={ptBR}
                    className="rounded-lg border shadow-sm p-3"
                  />
                </div>

                {/* Time Slots Column */}
                <div className="flex-1 flex flex-col h-full min-h-[300px]">
                  <p className="text-sm font-medium text-gray-500 mb-3 text-center md:text-left">
                    {format(selectedDate || new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
                  </p>

                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto pr-2 max-h-[400px]">
                    {timeSlots.length > 0 ? (
                      timeSlots.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          className={`w-full justify-center ${selectedTime === time ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                          onClick={() => handleTimeSelect(time)}
                        >
                          {time}
                        </Button>
                      ))
                    ) : (
                      <div className="col-span-full h-full flex flex-col items-center justify-center text-gray-400 space-y-2 py-10">
                        <Clock className="w-10 h-10 opacity-20" />
                        <p>Não há horários disponíveis para esta data.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'form' && (
            <div className="max-w-md mx-auto w-full animate-in fade-in slide-in-from-right-4 duration-300">
              <Button variant="ghost" className="mb-6 -ml-4" onClick={() => setStep('select')}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>

              <h3 className="text-xl font-bold text-gray-900 mb-6">Seus dados</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: João da Silva"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="joao@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">O que você precisa?</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Descreva brevemente o motivo da reunião..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="pt-4">
                  <Button onClick={handleSubmit} className="w-full text-lg h-12">
                    Confirmar Agendamento
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                <Check className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Agendamento Confirmado!</h3>
              <p className="text-gray-500 max-w-sm mb-8">
                Obrigado por agendar. Em breve entraremos em contato para confirmar os detalhes.
              </p>

              <div className="bg-gray-50 p-6 rounded-xl border w-full max-w-sm">
                <p className="font-semibold text-gray-900">
                  {format(selectedDate!, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
                <p className="text-xl text-primary font-bold mt-1 mb-1">
                  {selectedTime}
                </p>
                <p className="text-sm text-gray-500">
                  {settings.meetingDuration} minutos
                </p>
              </div>

              <Button variant="outline" className="mt-8" onClick={() => {
                setStep('select');
                setFormData({ name: '', email: '', notes: '' });
                setSelectedTime(null);
              }}>
                Agendar Outra Reunião
              </Button>
            </div>
          )}

        </div>
      </Card>
    </div>
  );
}
