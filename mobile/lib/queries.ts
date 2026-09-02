import { supabase } from "./supabase";
import type { Appointment, Barber, Profile, Service, Tenant, WorkingHours } from "./types";

export async function fetchTenants(): Promise<Tenant[]> {
  const { data, error } = await supabase.from("tenants").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

export async function fetchTenantServices(tenantId: string): Promise<Service[]> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function fetchBarberByProfileId(profileId: string): Promise<Barber | null> {
  const { data, error } = await supabase
    .from("barbers")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function fetchTenantBarbers(tenantId: string): Promise<Barber[]> {
  const { data, error } = await supabase
    .from("barbers")
    .select("*")
    .eq("tenant_id", tenantId);

  if (error) throw error;
  return data ?? [];
}

export async function createService(params: {
  tenant_id: string;
  name: string;
  duration_minutes: number;
  price_cents: number;
}): Promise<Service> {
  const { data, error } = await supabase.from("services").insert(params).select().single();
  if (error) throw error;
  return data;
}

export async function deleteService(id: string): Promise<void> {
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw error;
}

export async function createWorkingHours(params: {
  barber_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
}): Promise<WorkingHours> {
  const { data, error } = await supabase.from("working_hours").insert(params).select().single();
  if (error) throw error;
  return data;
}

export async function deleteWorkingHours(id: string): Promise<void> {
  const { error } = await supabase.from("working_hours").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchBarberWorkingHours(barberId: string): Promise<WorkingHours[]> {
  const { data, error } = await supabase
    .from("working_hours")
    .select("*")
    .eq("barber_id", barberId)
    .order("weekday");

  if (error) throw error;
  return data ?? [];
}

export async function fetchClientAppointments(clientId: string): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("client_id", clientId)
    .order("starts_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchBarberAppointments(
  barberId: string,
  dayStart: string,
  dayEnd: string
): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("barber_id", barberId)
    .gte("starts_at", dayStart)
    .lt("starts_at", dayEnd)
    .order("starts_at");

  if (error) throw error;
  return data ?? [];
}

export async function createAppointment(params: {
  barber_id: string;
  service_id: string;
  starts_at: string;
}): Promise<{ appointment_id: string }> {
  const { data, error } = await supabase.functions.invoke("create_appointment", {
    body: params,
  });

  if (error) throw error;
  return data;
}
