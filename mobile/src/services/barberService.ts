import {supabase} from '~/services/supabase';
import type {Barber, Profile} from '~/types';

export async function fetchBarberByProfileId(profileId: string): Promise<Barber | null> {
  const {data, error} = await supabase
    .from('barbers')
    .select('*')
    .eq('profile_id', profileId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const {data, error} = await supabase.from('profiles').select('*').eq('id', userId).single();

  if (error) throw error;
  return data;
}
