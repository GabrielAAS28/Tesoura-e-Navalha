import {supabase} from '~/services/supabase';
import type {AppointmentStatus, AppointmentWithDetails} from '~/types';

export async function createAppointment(params: {
  barber_id: string;
  service_id: string;
  starts_at: string;
}): Promise<{appointment_id: string}> {
  const {data, error} = await supabase.functions.invoke('create_appointment', {
    body: params,
  });

  if (error) throw error;
  return data;
}

export async function fetchClientAppointments(clientId: string): Promise<AppointmentWithDetails[]> {
  const {data, error} = await supabase
    .from('appointments')
    .select('*, service:services(name, price_cents), barber:barbers(profile:profiles(full_name))')
    .eq('client_id', clientId)
    .order('starts_at', {ascending: false});

  if (error) throw error;
  return (data ?? []) as unknown as AppointmentWithDetails[];
}

export async function fetchBarberAppointments(
  barberId: string,
  dayStart: string,
  dayEnd: string,
): Promise<AppointmentWithDetails[]> {
  const {data, error} = await supabase
    .from('appointments')
    .select('*, service:services(name, price_cents), client:profiles!appointments_client_id_fkey(full_name)')
    .eq('barber_id', barberId)
    .gte('starts_at', dayStart)
    .lt('starts_at', dayEnd)
    .order('starts_at');

  if (error) throw error;
  return (data ?? []) as unknown as AppointmentWithDetails[];
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<void> {
  const {error} = await supabase.from('appointments').update({status}).eq('id', id);
  if (error) throw error;
}
