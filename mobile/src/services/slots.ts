import type {Appointment, WorkingHours} from '~/types';

/**
 * Builds the list of free start times (as Date objects) for a given day,
 * given the barber's working hours for that weekday and their existing
 * appointments. Pure client-side preview only — the source of truth for
 * conflict prevention is the DB EXCLUDE constraint hit by createAppointment.
 */
export function computeFreeSlots(params: {
  date: Date;
  durationMinutes: number;
  workingHours: WorkingHours[];
  appointments: Appointment[];
  stepMinutes?: number;
}): Date[] {
  const {date, durationMinutes, workingHours, appointments, stepMinutes = 15} = params;
  const weekday = date.getDay();
  const hours = workingHours.filter(wh => wh.weekday === weekday);
  if (hours.length === 0) return [];

  // Só filtra horários já passados quando `date` é o dia de hoje — uma data
  // futura deve oferecer a janela de trabalho completa normalmente. Nada
  // depois disso (nem o client, nem a Edge Function create_appointment)
  // rejeita um starts_at no passado, então esse filtro é a única barreira.
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const slots: Date[] = [];

  for (const wh of hours) {
    const [startH, startM] = wh.start_time.split(':').map(Number);
    const [endH, endM] = wh.end_time.split(':').map(Number);

    const windowStart = new Date(date);
    windowStart.setHours(startH, startM, 0, 0);
    const windowEnd = new Date(date);
    windowEnd.setHours(endH, endM, 0, 0);

    for (
      let candidate = new Date(windowStart);
      candidate.getTime() + durationMinutes * 60_000 <= windowEnd.getTime();
      candidate = new Date(candidate.getTime() + stepMinutes * 60_000)
    ) {
      if (isToday && candidate.getTime() <= now.getTime()) continue;

      const candidateEnd = new Date(candidate.getTime() + durationMinutes * 60_000);

      const overlaps = appointments.some(appt => {
        if (appt.status === 'cancelled') return false;
        const apptStart = new Date(appt.starts_at);
        const apptEnd = new Date(appt.ends_at);
        return candidate < apptEnd && candidateEnd > apptStart;
      });

      if (!overlaps) slots.push(new Date(candidate));
    }
  }

  return slots;
}
