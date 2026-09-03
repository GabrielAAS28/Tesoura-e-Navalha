import {supabase} from '~/services/supabase';
import type {WorkingHours} from '~/types';

export async function fetchBarberWorkingHours(barberId: string): Promise<WorkingHours[]> {
  const {data, error} = await supabase
    .from('working_hours')
    .select('*')
    .eq('barber_id', barberId)
    .order('weekday');

  if (error) throw error;
  return data ?? [];
}

export async function createWorkingHours(params: {
  barber_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
}): Promise<WorkingHours> {
  const {data, error} = await supabase.from('working_hours').insert(params).select().single();
  if (error) throw error;
  return data;
}

export async function deleteWorkingHours(id: string): Promise<void> {
  const {error} = await supabase.from('working_hours').delete().eq('id', id);
  if (error) throw error;
}
