import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useBusiness } from '@/contexts/BusinessContext';
import { Upload, Save, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { ThemeCustomizer } from '@/components/settings/ThemeCustomizer';
import { PipelineSettings } from '@/components/settings/PipelineSettings';
import { BlockedDate, BlockedTimeSlot, DaySchedule } from '@/types';

const weekDays = [
  { id: 0, label: 'Domingo' },
  { id: 1, label: 'Segunda' },
  { id: 2, label: 'Terça' },
  { id: 3, label: 'Quarta' },
  { id: 4, label: 'Quinta' },
  { id: 5, label: 'Sexta' },
  { id: 6, label: 'Sábado' },
];

const allHours = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minute}`;
});

const defaultDaySchedule: DaySchedule = {
  enabled: false,
  startTime: '09:00',
  endTime: '18:00',
};

export default function Configuracoes() {
  const { settings, updateSettings } = useBusiness();
  const [formData, setFormData] = useState({
    ...settings,
    daySchedules: settings.daySchedules || {
      0: { enabled: false, startTime: '09:00', endTime: '18:00' },
      1: { enabled: true, startTime: '09:00', endTime: '18:00' },
      2: { enabled: true, startTime: '09:00', endTime: '18:00' },
      3: { enabled: true, startTime: '09:00', endTime: '18:00' },
      4: { enabled: true, startTime: '09:00', endTime: '18:00' },
      5: { enabled: true, startTime: '09:00', endTime: '18:00' },
      6: { enabled: false, startTime: '09:00', endTime: '18:00' },
    },
  });

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const [lastSavedData, setLastSavedData] = useState(formData);

  // Auto-save com debounce (salva após 2 segundos sem mudanças)
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      if (JSON.stringify(formData) !== JSON.stringify(lastSavedData)) {
        updateSettings(formData);
        setLastSavedData(formData);
        toast.success('Configurações salvas automaticamente!', { duration: 2 });
      }
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData, lastSavedData, updateSettings]);

  // Sincroniza o estado local do formulário quando as configurações do contexto mudam
  useEffect(() => {
    const synced = {
      ...settings,
      daySchedules: settings.daySchedules || {
        0: { enabled: false, startTime: '09:00', endTime: '18:00' },
        1: { enabled: true, startTime: '09:00', endTime: '18:00' },
        2: { enabled: true, startTime: '09:00', endTime: '18:00' },
        3: { enabled: true, startTime: '09:00', endTime: '18:00' },
        4: { enabled: true, startTime: '09:00', endTime: '18:00' },
        5: { enabled: true, startTime: '09:00', endTime: '18:00' },
        6: { enabled: false, startTime: '09:00', endTime: '18:00' },
      },
    };

    setFormData(synced);
    setLastSavedData(synced);
  }, [settings]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleDay = (dayId: number) => {
    const currentSchedule = formData.daySchedules[dayId] || defaultDaySchedule;
    setFormData({
      ...formData,
      daySchedules: {
        ...formData.daySchedules,
        [dayId]: { ...currentSchedule, enabled: !currentSchedule.enabled },
      },
    });
  };

  const updateDaySchedule = (dayId: number, field: 'startTime' | 'endTime', value: string) => {
    const currentSchedule = formData.daySchedules[dayId] || defaultDaySchedule;
    setFormData({
      ...formData,
      daySchedules: {
        ...formData.daySchedules,
        [dayId]: { ...currentSchedule, [field]: value },
      },
    });
  };

  const [newBlockedDate, setNewBlockedDate] = useState({ date: '', reason: '' });
  const [newBlockedTime, setNewBlockedTime] = useState({ startTime: '', endTime: '', reason: '' });

  const addBlockedDate = () => {
    if (!newBlockedDate.date) return;
    const blockedDate: BlockedDate = {
      id: Math.random().toString(36).substr(2, 9),
      date: newBlockedDate.date,
      reason: newBlockedDate.reason,
    };
    setFormData({
      ...formData,
      blockedDates: [...(formData.blockedDates || []), blockedDate],
    });
    setNewBlockedDate({ date: '', reason: '' });
  };

  const removeBlockedDate = (id: string) => {
    setFormData({
      ...formData,
      blockedDates: (formData.blockedDates || []).filter((d) => d.id !== id),
    });
  };

  const addBlockedTimeSlot = () => {
    if (!newBlockedTime.startTime || !newBlockedTime.endTime) return;
    const blockedTime: BlockedTimeSlot = {
      id: Math.random().toString(36).substr(2, 9),
      startTime: newBlockedTime.startTime,
      endTime: newBlockedTime.endTime,
      reason: newBlockedTime.reason,
    };
    setFormData({
      ...formData,
      blockedTimeSlots: [...(formData.blockedTimeSlots || []), blockedTime],
    });
    setNewBlockedTime({ startTime: '', endTime: '', reason: '' });
  };

  const removeBlockedTimeSlot = (id: string) => {
    setFormData({
      ...formData,
      blockedTimeSlots: (formData.blockedTimeSlots || []).filter((t) => t.id !== id),
    });
  };

  const handleSave = () => {
    updateSettings(formData);
    setLastSavedData(formData);
    toast.success('Configurações salvas com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Personalize sua marca e configurações</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Negócio</CardTitle>
            <CardDescription>Configure as informações básicas da sua empresa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    {formData.logo ? (
                      <AvatarImage src={formData.logo} alt="Logo" />
                    ) : null}
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      {formData.businessName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="logo-upload"
                      onChange={handleLogoUpload}
                    />
                    <Button variant="outline" size="sm" asChild>
                      <label htmlFor="logo-upload" className="cursor-pointer gap-2">
                        <Upload className="h-4 w-4" />
                        Enviar Logo
                      </label>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Sua Foto</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    {formData.photo ? (
                      <AvatarImage src={formData.photo} alt="Foto" />
                    ) : null}
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xl">
                      {formData.ownerName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="photo-upload"
                      onChange={handlePhotoUpload}
                    />
                    <Button variant="outline" size="sm" asChild>
                      <label htmlFor="photo-upload" className="cursor-pointer gap-2">
                        <Upload className="h-4 w-4" />
                        Enviar Foto
                      </label>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome da Empresa</Label>
                <Input
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Seu Nome</Label>
                <Input
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configurações de Agenda</CardTitle>
            <CardDescription>Defina seus horários e dias disponíveis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Duração Padrão da Reunião</Label>
              <Select
                value={formData.meetingDuration.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, meetingDuration: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="90">1h 30min</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Horários por Dia da Semana</Label>
              <div className="space-y-2">
                {weekDays.map((day) => {
                  const schedule = formData.daySchedules[day.id] || defaultDaySchedule;
                  return (
                    <div key={day.id} className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center space-x-2 w-28">
                        <Checkbox
                          id={`day-${day.id}`}
                          checked={schedule.enabled}
                          onCheckedChange={() => toggleDay(day.id)}
                        />
                        <label
                          htmlFor={`day-${day.id}`}
                          className="text-sm font-medium leading-none"
                        >
                          {day.label}
                        </label>
                      </div>
                      {schedule.enabled && (
                        <div className="flex items-center gap-2">
                          <Select
                            value={schedule.startTime}
                            onValueChange={(value) => updateDaySchedule(day.id, 'startTime', value)}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {allHours.map((hour) => (
                                <SelectItem key={hour} value={hour}>
                                  {hour}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-muted-foreground">até</span>
                          <Select
                            value={schedule.endTime}
                            onValueChange={(value) => updateDaySchedule(day.id, 'endTime', value)}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {allHours.map((hour) => (
                                <SelectItem key={hour} value={hour}>
                                  {hour}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Períodos Bloqueados (não disponíveis todos os dias)</Label>
              <div className="flex gap-2 flex-wrap">
                <Select
                  value={newBlockedTime.startTime}
                  onValueChange={(value) => setNewBlockedTime({ ...newBlockedTime, startTime: value })}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Início" />
                  </SelectTrigger>
                  <SelectContent>
                    {allHours.map((hour) => (
                      <SelectItem key={hour} value={hour}>
                        {hour}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground self-center">até</span>
                <Select
                  value={newBlockedTime.endTime}
                  onValueChange={(value) => setNewBlockedTime({ ...newBlockedTime, endTime: value })}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Fim" />
                  </SelectTrigger>
                  <SelectContent>
                    {allHours.map((hour) => (
                      <SelectItem key={hour} value={hour}>
                        {hour}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Motivo (ex: Almoço)"
                  value={newBlockedTime.reason}
                  onChange={(e) => setNewBlockedTime({ ...newBlockedTime, reason: e.target.value })}
                  className="flex-1 min-w-32"
                />
                <Button onClick={addBlockedTimeSlot} size="icon" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {(formData.blockedTimeSlots || []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(formData.blockedTimeSlots || []).map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-sm"
                    >
                      <span>{slot.startTime} - {slot.endTime}</span>
                      {slot.reason && <span className="text-muted-foreground">({slot.reason})</span>}
                      <button onClick={() => removeBlockedTimeSlot(slot.id)} className="text-muted-foreground hover:text-foreground">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label>Datas Bloqueadas (feriados, folgas)</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={newBlockedDate.date}
                  onChange={(e) => setNewBlockedDate({ ...newBlockedDate, date: e.target.value })}
                  className="w-40"
                />
                <Input
                  placeholder="Motivo (ex: Feriado)"
                  value={newBlockedDate.reason}
                  onChange={(e) => setNewBlockedDate({ ...newBlockedDate, reason: e.target.value })}
                  className="flex-1"
                />
                <Button onClick={addBlockedDate} size="icon" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {(formData.blockedDates || []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(formData.blockedDates || []).map((blocked) => (
                    <div
                      key={blocked.id}
                      className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-sm"
                    >
                      <span>{new Date(blocked.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                      {blocked.reason && <span className="text-muted-foreground">({blocked.reason})</span>}
                      <button onClick={() => removeBlockedDate(blocked.id)} className="text-muted-foreground hover:text-foreground">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <PipelineSettings />

      <ThemeCustomizer />

      <div className="flex justify-end items-center gap-4">
        {JSON.stringify(formData) === JSON.stringify(lastSavedData) ? (
          <p className="text-sm text-green-600">✓ Todas as alterações foram salvas</p>
        ) : (
          <p className="text-sm text-amber-600">⏱ Salvando automaticamente...</p>
        )}
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}