export type UserRole = 'client' | 'barber' | 'admin';

export type Profile = {
  id: string;
  tenant_id: string | null;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
};

export type Tenant = {
  id: string;
  name: string;
  slug: string;
};

export type Service = {
  id: string;
  tenant_id: string;
  name: string;
  duration_minutes: number;
  price_cents: number;
  buffer_minutes: number;
};

export type Barber = {
  id: string;
  tenant_id: string;
  profile_id: string;
  bio: string | null;
};

export type BarberWithProfile = Barber & {
  profile: {full_name: string | null} | null;
};

export type WorkingHours = {
  id: string;
  barber_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
};

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type Appointment = {
  id: string;
  tenant_id: string;
  barber_id: string;
  service_id: string;
  client_id: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
};

export type AppointmentWithDetails = Appointment & {
  service: {name: string; price_cents: number} | null;
  barber: {profile: {full_name: string | null} | null} | null;
  client: {full_name: string | null} | null;
};
