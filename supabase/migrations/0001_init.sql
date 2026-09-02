-- Navalha MVP — schema inicial (multi-tenant)

create extension if not exists "btree_gist";
create extension if not exists "pgcrypto";

create table tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  tenant_id uuid references tenants (id) on delete cascade,
  role text not null default 'client' check (role in ('client', 'barber', 'admin')),
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

create table barbers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  profile_id uuid not null references profiles (id) on delete cascade,
  bio text,
  created_at timestamptz not null default now(),
  unique (tenant_id, profile_id)
);

create table services (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  name text not null,
  duration_minutes int not null check (duration_minutes > 0),
  price_cents int not null default 0 check (price_cents >= 0),
  buffer_minutes int not null default 0 check (buffer_minutes >= 0),
  created_at timestamptz not null default now()
);

create table working_hours (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid not null references barbers (id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null check (end_time > start_time)
);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  barber_id uuid not null references barbers (id) on delete cascade,
  service_id uuid not null references services (id),
  client_id uuid not null references profiles (id),
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  status text not null default 'confirmed'
    check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz not null default now(),
  -- Impede dois agendamentos sobrepostos para o mesmo barbeiro, garantido
  -- pelo banco mesmo sob concorrência (duas confirmações simultâneas).
  exclude using gist (
    barber_id with =,
    tstzrange(starts_at, ends_at) with &&
  ) where (status <> 'cancelled')
);

create index appointments_client_id_idx on appointments (client_id);
create index appointments_barber_starts_at_idx on appointments (barber_id, starts_at);
create index services_tenant_id_idx on services (tenant_id);
create index barbers_tenant_id_idx on barbers (tenant_id);

-- Cria a linha de profile automaticamente para todo novo usuário do Supabase
-- Auth (role default = 'client'; barbeiros são promovidos a 'admin' no
-- fluxo de cadastro de barbearia, ver app/(auth)/cadastro-barbeiro-etapa2).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.phone)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Row Level Security

alter table tenants enable row level security;
alter table profiles enable row level security;
alter table barbers enable row level security;
alter table services enable row level security;
alter table working_hours enable row level security;
alter table appointments enable row level security;

create function public.current_tenant_id()
returns uuid
language sql
security definer set search_path = public
stable
as $$
  select tenant_id from public.profiles where id = auth.uid();
$$;

create function public.current_role()
returns text
language sql
security definer set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- tenants: qualquer usuário autenticado pode listar barbearias (para o
-- cliente escolher onde agendar); só o próprio admin edita seus dados.
create policy "tenants are readable by authenticated users"
  on tenants for select
  to authenticated
  using (true);

create policy "tenants are insertable by authenticated users (signup flow)"
  on tenants for insert
  to authenticated
  with check (true);

create policy "tenants are updatable by their own admin"
  on tenants for update
  to authenticated
  using (id = public.current_tenant_id() and public.current_role() = 'admin');

-- profiles: usuário lê/edita o próprio perfil; barbeiro/admin também lê
-- perfis de clientes do próprio tenant (necessário para ver quem agendou).
create policy "users read own profile"
  on profiles for select
  to authenticated
  using (id = auth.uid());

create policy "staff reads client profiles in same tenant"
  on profiles for select
  to authenticated
  using (
    public.current_role() in ('admin', 'barber')
    and tenant_id = public.current_tenant_id()
  );

create policy "users upsert own profile"
  on profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy "users update own profile"
  on profiles for update
  to authenticated
  using (id = auth.uid());

-- barbers/services/working_hours: leitura pública para clientes navegarem
-- o catálogo; escrita restrita ao admin/barbeiro do próprio tenant.
create policy "barbers are readable by authenticated users"
  on barbers for select
  to authenticated
  using (true);

create policy "barbers are writable by same-tenant staff"
  on barbers for all
  to authenticated
  using (tenant_id = public.current_tenant_id() and public.current_role() = 'admin')
  with check (tenant_id = public.current_tenant_id() and public.current_role() = 'admin');

create policy "services are readable by authenticated users"
  on services for select
  to authenticated
  using (true);

create policy "services are writable by same-tenant staff"
  on services for all
  to authenticated
  using (tenant_id = public.current_tenant_id() and public.current_role() in ('admin', 'barber'))
  with check (tenant_id = public.current_tenant_id() and public.current_role() in ('admin', 'barber'));

create policy "working hours are readable by authenticated users"
  on working_hours for select
  to authenticated
  using (true);

create policy "working hours are writable by owning barber or tenant admin"
  on working_hours for all
  to authenticated
  using (
    exists (
      select 1 from barbers b
      where b.id = working_hours.barber_id
        and b.tenant_id = public.current_tenant_id()
        and (b.profile_id = auth.uid() or public.current_role() = 'admin')
    )
  )
  with check (
    exists (
      select 1 from barbers b
      where b.id = working_hours.barber_id
        and b.tenant_id = public.current_tenant_id()
        and (b.profile_id = auth.uid() or public.current_role() = 'admin')
    )
  );

-- appointments: cliente só vê/cria os próprios; staff só vê os do próprio
-- tenant. Inserção real de agendamento acontece via Edge Function
-- (service role), que calcula ends_at no servidor — a policy de insert
-- aqui cobre apenas o caminho direto pelo client SDK, se usado.
create policy "clients read own appointments"
  on appointments for select
  to authenticated
  using (client_id = auth.uid());

create policy "staff reads tenant appointments"
  on appointments for select
  to authenticated
  using (
    public.current_role() in ('admin', 'barber')
    and tenant_id = public.current_tenant_id()
  );

create policy "clients create own appointments"
  on appointments for insert
  to authenticated
  with check (client_id = auth.uid());
