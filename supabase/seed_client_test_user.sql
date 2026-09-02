-- Cria um usuário CLIENTE de teste direto no banco, sem passar pelo envio
-- de e-mail de confirmação (não é afetado pelo rate limit de e-mail do
-- Supabase). Rode isto UMA VEZ no SQL Editor do seu projeto Supabase.
--
-- Login no app: aba "Sou Cliente" > "ou entrar com e-mail"
--   E-mail: gagabri26+navalhacliente2@gmail.com
--   Senha:  Navalha@2026

do $$
declare
  client_user_id uuid := gen_random_uuid();
  client_email text := 'gagabri26+navalhacliente2@gmail.com';
  client_password text := 'Navalha@2026';
  client_name text := 'Cliente Teste';
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, confirmation_token, recovery_token,
    email_change_token_new, email_change,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  ) values (
    '00000000-0000-0000-0000-000000000000',
    client_user_id, 'authenticated', 'authenticated', client_email,
    crypt(client_password, gen_salt('bf')),
    now(), '', '', '', '',
    jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
    jsonb_build_object('full_name', client_name),
    now(), now()
  );

  insert into auth.identities (
    id, provider_id, user_id, identity_data, provider, created_at, updated_at
  ) values (
    gen_random_uuid(), client_user_id::text, client_user_id,
    jsonb_build_object('sub', client_user_id::text, 'email', client_email),
    'email', now(), now()
  );

  -- A trigger on_auth_user_created (migration 0001) já cria a linha em
  -- public.profiles com role='client' — aqui só garantimos o full_name.
  update public.profiles set full_name = client_name where id = client_user_id;

  raise notice 'Cliente de teste criado — email: %, password: %', client_email, client_password;
end $$;
