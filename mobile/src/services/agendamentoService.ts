import {FunctionsHttpError} from '@supabase/supabase-js';
import {supabase} from '~/services/supabase';
import type {AppointmentStatus, AppointmentWithDetails} from '~/types';

// supabase-js's `error.message` on a non-2xx Edge Function response is
// always the generic "Edge Function returned a non-2xx status code" — the
// real message the function sent (e.g. "Esse horário acabou de ser
// reservado." on a 409 conflict, see
// supabase/functions/create_appointment/index.ts's `{ error: ... }` body)
// only lives in the raw HTTP Response object at `error.context`, which has
// to be parsed as JSON separately. Returns null (never throws) if the body
// can't be read/parsed, so a parsing failure never crashes the error path
// itself — callers fall back to the generic error in that case.
async function extractFunctionsErrorMessage(error: FunctionsHttpError): Promise<string | null> {
  try {
    const body = await error.context.json();
    return typeof body?.error === 'string' ? body.error : null;
  } catch {
    return null;
  }
}

export async function createAppointment(params: {
  barber_id: string;
  service_id: string;
  starts_at: string;
}): Promise<{appointment_id: string}> {
  const {data, error} = await supabase.functions.invoke('create_appointment', {
    body: params,
  });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const message = await extractFunctionsErrorMessage(error);
      if (message) throw new Error(message);
    }
    throw error;
  }
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
