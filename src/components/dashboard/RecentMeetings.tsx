import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBusiness } from '@/contexts/BusinessContext';
import { format, parseISO, isAfter, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function RecentMeetings({
  meetingsProp,
  startDate,
  endDate,
}: {
  meetingsProp?: any[];
  startDate?: string | null;
  endDate?: string | null;
}) {
  const { meetings: ctxMeetings } = useBusiness();
  const meetings = meetingsProp ?? ctxMeetings;

  const start = startDate ? parseISO(startDate) : null;
  const end = endDate ? parseISO(endDate) : null;

  const upcomingMeetings = meetings
    .filter((m) => m.status === 'scheduled')
    .filter((m) => {
      if (!m.date) return false;
      const dt = parseISO(m.date);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isBefore(dt, today)) return false;

      if (start && isBefore(dt, start)) return false;
      if (end && isAfter(dt, end)) return false;
      return true;
    })
    .slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="secondary">Agendada</Badge>;
      case 'completed':
        return <Badge variant="default">Concluída</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Próximas Reuniões</CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingMeetings.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhuma reunião agendada</p>
        ) : (
          <div className="space-y-4">
            {upcomingMeetings.map((meeting) => (
              <div key={meeting.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <p className="font-medium text-sm text-foreground">{meeting.clientName}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(meeting.date), "dd 'de' MMMM", { locale: ptBR })} às {meeting.time}
                  </p>
                </div>
                {getStatusBadge(meeting.status)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
