-- 014: avanzar el turno del combate con validación en la base (aditivo).
-- Después de 013. Solo puede avanzar el turno:
--   - el director de la partida, o
--   - el dueño del personaje que tiene el turno actual.
-- Si el turno ya cambió (otra persona actuó antes), la función rechaza la acción.

create or replace function public.combat_advance(
  p_combat_id uuid,
  p_expected_turn int,
  p_new_turn int,
  p_new_round int,
  p_log text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_combat record;
  v_actor record;
  v_is_dm boolean;
begin
  select * into v_combat from public.combats where id = p_combat_id;
  if not found then
    raise exception 'El combate no existe';
  end if;

  if not public.is_playthrough_member(v_combat.playthrough_id) then
    raise exception 'No sos parte de esta partida';
  end if;

  if coalesce(v_combat.turn_index, 0) <> p_expected_turn then
    raise exception 'El turno ya cambió. Refrescá la pantalla.';
  end if;

  select exists (
    select 1 from public.playthrough_participants
    where playthrough_id = v_combat.playthrough_id and user_id = auth.uid() and role = 'dm'
  ) into v_is_dm;

  -- Participante que tiene el turno actual (según el orden de iniciativa).
  select cp.* into v_actor
  from public.combat_participants cp
  where cp.combat_id = p_combat_id
  order by cp.turn_order
  offset p_expected_turn limit 1;

  if not v_is_dm then
    -- Un jugador solo avanza si el turno es de uno de sus personajes.
    if v_actor.is_player is not true or v_actor.character_id is null then
      raise exception 'Solo el director puede avanzar el turno de los enemigos';
    end if;
    if not exists (
      select 1 from public.characters ch
      where ch.id = v_actor.character_id and ch.player_user_id = auth.uid()
    ) then
      raise exception 'Todavía no es el turno de tu personaje';
    end if;
  end if;

  update public.combats
    set turn_index = p_new_turn,
        round = p_new_round,
        log = p_log
    where id = p_combat_id;
end;
$$;

revoke all on function public.combat_advance(uuid, int, int, int, text) from public;
grant execute on function public.combat_advance(uuid, int, int, int, text) to authenticated;
