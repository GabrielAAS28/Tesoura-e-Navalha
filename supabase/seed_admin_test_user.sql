-- Cria um usuário admin de teste (barbearia + barbeiro) direto no banco,
-- pulando o fluxo de cadastro por telefone/OTP da UI. Rode isto UMA VEZ no
-- SQL Editor do seu projeto Supabase (depois de já ter rodado
-- migrations/0001_init.sql).
--
-- Login no app: aba "Sou Barbeiro" > "Entrar com senha"
--   Telefone: +5571999682826
--   Senha:    Navalha@2026
--
-- Troque o telefone/senha abaixo antes de rodar se quiser outros valores.

do $$
declare
  admin_user_id uuid := gen_random_uuid();
  admin_phone text := '+5571999682826';
  admin_password text := 'Navalha@2026';
  admin_tenant_id uuid;
begin
  insert into auth.users (
    instance_id, id, aud, role, phone, encrypted_password,
    phone_confirmed_at, confirmation_token, recovery_token,
    email_change_token_new, email_change,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  ) values (
    '00000000-0000-0000-0000-000000000000',
    admin_user_id, 'authenticated', 'authenticated', admin_phone,
    crypt(admin_password, gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"phone","providers":["phone"]}'::jsonb, '{}'::jsonb,
    now(), now()
  );

  insert into auth.identities (
    id, provider_id, user_id, identity_data, provider, created_at, updated_at
  ) values (
    gen_random_uuid(), admin_phone, admin_user_id,
    jsonb_build_object('sub', admin_user_id::text, 'phone', admin_phone),
    'phone', now(), now()
  );

  insert into public.tenants (name, slug)
  values ('Barbearia do Bairro (Teste)', 'barbearia-do-bairro-teste')
  returning id into admin_tenant_id;

  -- A trigger on_auth_user_created (migration 0001) já criou uma linha em
  -- public.profiles com role='client' para este usuário; promovemos aqui.
  insert into public.profiles (id, tenant_id, role, full_name, phone)
  values (admin_user_id, admin_tenant_id, 'admin', 'Admin de Teste', admin_phone)
  on conflict (id) do update
    set tenant_id = excluded.tenant_id,
        role = excluded.role,
        full_name = excluded.full_name;

  insert into public.barbers (tenant_id, profile_id)
  values (admin_tenant_id, admin_user_id);

  raise notice 'Admin de teste criado — phone: %, password: %, tenant_id: %',
    admin_phone, admin_password, admin_tenant_id;
end $$;
