import {supabase} from '~/services/supabase';
import type {BarberWithProfile, Tenant} from '~/types';

export async function fetchTenants(): Promise<Tenant[]> {
  const {data, error} = await supabase.from('tenants').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function fetchTenantBarbers(tenantId: string): Promise<BarberWithProfile[]> {
  const {data, error} = await supabase
    .from('barbers')
    .select('*, profile:profiles(full_name)')
    .eq('tenant_id', tenantId);

  if (error) throw error;
  return (data ?? []) as unknown as BarberWithProfile[];
}
