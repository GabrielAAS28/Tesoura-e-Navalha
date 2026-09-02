-- A migration 0001 só criava policies de select/insert para appointments —
-- faltava update, então "Concluir"/"Cancelar" na Agenda do barbeiro não
-- alterava nada (RLS bloqueia silenciosamente, sem erro, 0 linhas afetadas).

create policy "staff update tenant appointments"
  on appointments for update
  to authenticated
  using (
    public.current_role() in ('admin', 'barber')
    and tenant_id = public.current_tenant_id()
  )
  with check (
    public.current_role() in ('admin', 'barber')
    and tenant_id = public.current_tenant_id()
  );

-- Cliente também pode cancelar o próprio agendamento (não usado na UI
-- ainda, mas é a policy correta pro caso).
create policy "clients cancel own appointments"
  on appointments for update
  to authenticated
  using (client_id = auth.uid())
  with check (client_id = auth.uid() and status = 'cancelled');
