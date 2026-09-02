-- Cria uma SEGUNDA barbearia de teste (tenant B) com seu próprio admin,
-- pra provar isolamento entre tenants via RLS (sem precisar de banco
-- separado). Rode isto UMA VEZ no SQL Editor do seu projeto Supabase.

do $$
declare
  admin_user_id uuid := gen_random_uuid();
  admin_email text := 'gagabri26+navalhaadminb@gmail.com';
  admin_password text := 'Navalha@2026';
  admin_tenant_id uuid;
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, confirmation_token, recovery_token,
    email_change_token_new, email_change,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  ) values (
    '00000000-0000-0000-0000-000000000000',
    admin_user_id, 'authenticated', 'authenticated', admin_email,
    crypt(admin_password, gen_salt('bf')),
    now(), '', '', '', '',
    jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
    jsonb_build_object('full_name', 'Admin Barbearia B'),
    now(), now()
  );

  insert into auth.identities (
    id, provider_id, user_id, identity_data, provider, created_at, updated_at
  ) values (
    gen_random_uuid(), admin_user_id::text, admin_user_id,
    jsonb_build_object('sub', admin_user_id::text, 'email', admin_email),
    'email', now(), now()
  );

  insert into public.tenants (name, slug)
  values ('Barbearia Concorrente (Teste B)', 'barbearia-concorrente-teste-b')
  returning id into admin_tenant_id;

  update public.profiles
    set role = 'admin', tenant_id = admin_tenant_id, full_name = 'Admin Barbearia B'
    where id = admin_user_id;

  insert into public.barbers (tenant_id, profile_id)
  values (admin_tenant_id, admin_user_id);

  insert into public.services (tenant_id, name, duration_minutes, price_cents)
  values (admin_tenant_id, 'Corte da Barbearia B (sigiloso)', 30, 9999);

  raise notice 'Barbearia B criada — email: %, password: %, tenant_id: %',
    admin_email, admin_password, admin_tenant_id;
end $$;
