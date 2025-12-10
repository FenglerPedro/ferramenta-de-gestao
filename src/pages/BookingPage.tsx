import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useBusiness } from '@/contexts/BusinessContext';
import { format, addDays, isBefore, startOfToday, parseISO, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, CalendarDays, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function BookingPage() {
  const { settings, meetings, addMeeting } = useBusiness();
  const [step, setStep] = useState<'date' | 'time' | 'form' | 'success'>('date');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const generateTimeSlots = () => {
    const slots: string[] = [];
    const startHour = parseInt(settings.availableHours.start.split(':')[0]);
    const endHour = parseInt(settings.availableHours.end.split(':')[0]);

    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < endHour - 1 || settings.meetingDuration <= 30) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }

    return slots;
  };

  const isTimeSlotAvailable = (date: Date, time: string) => {
    return !meetings.some(
      (m) =>
        m.status === 'scheduled' &&
        isSameDay(parseISO(m.date), date) &&
        m.time === time
    );
  };

  const isDateAvailable = (date: Date) => {
    if (isBefore(date, startOfToday())) return false;
    const dayOfWeek = date.getDay();
    return settings.availableDays.includes(dayOfWeek);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date && isDateAvailable(date)) {
      setSelectedDate(date);
      setStep('time');
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep('form');
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email) {
      toast.error('Preencha todos os campos');
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
    });

    setStep('success');
    toast.success('Reunião agendada com sucesso!');
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Avatar className="h-20 w-20">
              {settings.logo ? (
                <AvatarImage src={settings.logo} alt={settings.businessName} />
              ) : null}
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {settings.businessName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-xl">{settings.businessName}</CardTitle>
          <CardDescription>
            Agende uma reunião com {settings.ownerName}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === 'date' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <CalendarDays className="h-4 w-4" />
                <span>Selecione uma data disponível</span>
              </div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => !isDateAvailable(date)}
                locale={ptBR}
                className="rounded-md border mx-auto pointer-events-auto"
              />
            </div>
          )}

          {step === 'time' && selectedDate && (
            <div className="space-y-4">
              <Button variant="ghost" size="sm" onClick={() => setStep('date')}>
                ← Voltar
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  Horários disponíveis para{' '}
                  {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((time) => {
                  const available = isTimeSlotAvailable(selectedDate, time);
                  return (
                    <Button
                      key={time}
                      variant={available ? 'outline' : 'ghost'}
                      disabled={!available}
                      onClick={() => handleTimeSelect(time)}
                      className={available ? 'hover:bg-primary hover:text-primary-foreground' : 'opacity-50'}
                    >
                      {time}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 'form' && selectedDate && selectedTime && (
            <div className="space-y-4">
              <Button variant="ghost" size="sm" onClick={() => setStep('time')}>
                ← Voltar
              </Button>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-sm text-muted-foreground">Data e horário selecionados</p>
                <p className="font-medium text-foreground">
                  {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às {selectedTime}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Duração: {settings.meetingDuration} minutos
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Seu Nome</Label>
                  <Input
                    placeholder="Nome completo"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Seu Email</Label>
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <Button onClick={handleSubmit} className="w-full">
                  Confirmar Agendamento
                </Button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4 py-8">
              <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center mx-auto">
                <Check className="h-8 w-8 text-accent-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Reunião Agendada!</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Você receberá um email de confirmação em breve.
                </p>
              </div>
              {selectedDate && selectedTime && (
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="font-medium text-foreground">
                    {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                  <p className="text-sm text-muted-foreground">às {selectedTime}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
