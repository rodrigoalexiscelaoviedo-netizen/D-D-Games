-- 012: roles de la partida (aditivo).
-- El rol de cada persona sale de playthrough_participants.role ('dm' o 'player').
-- Ejecutar en el SQL editor de Supabase, después de 009.

-- Pasar la dirección: solo el director actual puede hacerlo, y el nuevo director tiene que ser
-- un jugador de la misma partida. Quien pasa la dirección queda como jugador.
create or replace function public.set_playthrough_dm(p_playthrough_id uuid, p_new_dm uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.playthrough_participants
    where playthrough_id = p_playthrough_id and user_id = auth.uid() and role = 'dm'
  ) then
    raise exception 'Solo el director actual puede pasar la dirección';
  end if;

  if not exists (
    select 1 from public.playthrough_participants
    where playthrough_id = p_playthrough_id and user_id = p_new_dm and role = 'player'
  ) then
    raise exception 'El nuevo director tiene que ser un jugador de la partida';
  end if;

  update public.playthrough_participants
    set role = 'player'
    where playthrough_id = p_playthrough_id and role = 'dm';

  update public.playthrough_participants
    set role = 'dm'
    where playthrough_id = p_playthrough_id and user_id = p_new_dm;

  update public.playthroughs
    set user_id = p_new_dm
    where id = p_playthrough_id;
end;
$$;

revoke all on function public.set_playthrough_dm(uuid, uuid) from public;
grant execute on function public.set_playthrough_dm(uuid, uuid) to authenticated;

-- Todos los miembros de la partida ven a los demás participantes (lobby y lista de jugadores).
drop policy if exists "Miembros leen los participantes de su partida" on public.playthrough_participants;
create policy "Miembros leen los participantes de su partida"
  on public.playthrough_participants for select
  using (public.is_playthrough_member(playthrough_id));

-- Todos los miembros ven el registro de la partida: así cada uno sabe qué pasó y quién lo hizo.
drop policy if exists "Miembros leen el registro de su partida" on public.playthrough_log;
create policy "Miembros leen el registro de su partida"
  on public.playthrough_log for select
  using (public.is_playthrough_member(playthrough_id));
