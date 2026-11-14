-- 009: permisos para invitar jugadores y que el jugador vea su partida (aditivo).
-- Versión consolidada de lo que ya se ejecutó en Supabase, en orden:
--   1) el director ve los participantes de su partida,
--   2) el jugador lee la partida donde participa,
--   3) el jugador lee los personajes de la campaña de su partida.
-- Las funciones usan security definer para evitar la recursión entre tablas
-- (partidas <-> participantes), que dio "infinite recursion detected in policy".

create or replace function public.is_playthrough_member(p_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.playthrough_participants
                 where playthrough_id = p_id and user_id = auth.uid());
$$;

create or replace function public.is_playthrough_owner(p_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.playthroughs
                 where id = p_id and user_id = auth.uid());
$$;

drop policy if exists "El director ve los participantes de su partida" on public.playthrough_participants;
create policy "El director ve los participantes de su partida"
  on public.playthrough_participants for select
  using (public.is_playthrough_owner(playthrough_id));

drop policy if exists "Jugadores leen la partida donde participan" on public.playthroughs;
create policy "Jugadores leen la partida donde participan"
  on public.playthroughs for select
  using (public.is_playthrough_member(id));

drop policy if exists "Jugadores leen los personajes de la campaña de su partida" on public.characters;
create policy "Jugadores leen los personajes de la campaña de su partida"
  on public.characters for select
  using (
    exists (
      select 1 from public.playthroughs p
      where p.campaign_id = characters.campaign_id
        and public.is_playthrough_member(p.id)
    )
  );
