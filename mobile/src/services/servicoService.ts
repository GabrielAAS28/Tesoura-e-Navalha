import {supabase} from '~/services/supabase';
import type {Service} from '~/types';

export async function fetchTenantServices(tenantId: string): Promise<Service[]> {
  const {data, error} = await supabase
    .from('services')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('name');

  if (error) throw error;
  return data ?? [];
}

export async function createService(params: {
  tenant_id: string;
  name: string;
  duration_minutes: number;
  price_cents: number;
}): Promise<Service> {
  const {data, error} = await supabase.from('services').insert(params).select().single();
  if (error) throw error;
  return data;
}

export async function deleteService(id: string): Promise<void> {
  const {error} = await supabase.from('services').delete().eq('id', id);
  if (error) throw error;
}
