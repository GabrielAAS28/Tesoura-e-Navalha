-- Nomes de perfil precisam ser visíveis em mais contextos do que a policy
-- original previa: cliente vendo nome do barbeiro ao escolher/revisar um
-- agendamento, e barbeiro vendo nome do cliente na própria agenda. Como
-- clientes não têm tenant_id, a policy "staff reads client profiles in
-- same tenant" nunca cobre esse caso — por isso duas policies adicionais
-- (aditivas: RLS faz OR entre policies do mesmo comando).

create policy "staff profiles are publicly readable"
  on profiles for select
  to authenticated
  using (role in ('admin', 'barber'));

create policy "barbers read client profiles via shared appointments"
  on profiles for select
  to authenticated
  using (
    exists (
      select 1 from appointments a
      join barbers b on b.id = a.barber_id
      where a.client_id = profiles.id
        and b.profile_id = auth.uid()
    )
  );
