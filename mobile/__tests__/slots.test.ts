import {computeFreeSlots} from '~/services/slots';
import type {WorkingHours, Appointment} from '~/types';

const wh = (weekday: number, start: string, end: string): WorkingHours => ({
  id: `${weekday}-${start}`,
  barber_id: 'b1',
  weekday,
  start_time: start,
  end_time: end,
});

describe('computeFreeSlots', () => {
  // 2026-09-07 é uma segunda-feira (weekday 1)
  const date = new Date(2026, 8, 7);

  it('gera slots de 15min dentro da janela de trabalho', () => {
    const slots = computeFreeSlots({
      date,
      durationMinutes: 30,
      workingHours: [wh(1, '09:00', '10:00')],
      appointments: [],
    });
    // 09:00 e 09:30 cabem (30min); 09:45 não (termina 10:15 > 10:00)
    expect(slots.map(s => s.getHours() * 60 + s.getMinutes())).toEqual([540, 555, 570]);
  });

  it('remove slots que sobrepõem um agendamento existente', () => {
    const appt: Appointment = {
      id: 'a1',
      client_id: 'c1',
      barber_id: 'b1',
      service_id: 's1',
      starts_at: new Date(2026, 8, 7, 9, 0).toISOString(),
      ends_at: new Date(2026, 8, 7, 9, 30).toISOString(),
      status: 'confirmed',
    };
    const slots = computeFreeSlots({
      date,
      durationMinutes: 30,
      workingHours: [wh(1, '09:00', '10:00')],
      appointments: [appt],
    });
    expect(slots.map(s => s.getHours() * 60 + s.getMinutes())).not.toContain(540);
  });

  it('ignora agendamentos cancelados', () => {
    const appt: Appointment = {
      id: 'a1',
      client_id: 'c1',
      barber_id: 'b1',
      service_id: 's1',
      starts_at: new Date(2026, 8, 7, 9, 0).toISOString(),
      ends_at: new Date(2026, 8, 7, 9, 30).toISOString(),
      status: 'cancelled',
    };
    const slots = computeFreeSlots({
      date,
      durationMinutes: 30,
      workingHours: [wh(1, '09:00', '10:00')],
      appointments: [appt],
    });
    expect(slots.map(s => s.getHours() * 60 + s.getMinutes())).toContain(540);
  });

  it('retorna vazio quando não há horário de trabalho no weekday', () => {
    const slots = computeFreeSlots({
      date,
      durationMinutes: 30,
      workingHours: [wh(2, '09:00', '18:00')],
      appointments: [],
    });
    expect(slots).toEqual([]);
  });
});
