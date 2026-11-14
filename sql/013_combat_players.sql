-- 013: los jugadores de la partida participan del combate (aditivo).
-- Después de 012. Los miembros de la partida leen y actualizan el combate, sus participantes,
-- los personajes de la campaña y las escenas de la aventura. La pantalla decide quién puede
-- actuar en cada momento (el turno), según el rol y el personaje.
-- Nota: la validación de turno está en la app. Más adelante conviene moverla a una función de base.

create or replace function public.is_combat_member(p_combat_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.combats c
    where c.id = p_combat_id and public.is_playthrough_member(c.playthrough_id)
  );
$$;

grant execute on function public.is_combat_member(uuid) to authenticated;

drop policy if exists "Miembros leen y actualizan el combate de su partida" on public.combats;
create policy "Miembros leen y actualizan el combate de su partida"
  on public.combats for all
  using (public.is_playthrough_member(playthrough_id))
  with check (public.is_playthrough_member(playthrough_id));

drop policy if exists "Miembros leen y actualizan los participantes del combate" on public.combat_participants;
create policy "Miembros leen y actualizan los participantes del combate"
  on public.combat_participants for all
  using (public.is_combat_member(combat_id))
  with check (public.is_combat_member(combat_id));

drop policy if exists "Miembros actualizan los personajes de su campaña" on public.characters;
create policy "Miembros actualizan los personajes de su campaña"
  on public.characters for update
  using (
    exists (
      select 1 from public.playthroughs p
      where p.campaign_id = characters.campaign_id and public.is_playthrough_member(p.id)
    )
  )
  with check (
    exists (
      select 1 from public.playthroughs p
      where p.campaign_id = characters.campaign_id and public.is_playthrough_member(p.id)
    )
  );

drop policy if exists "Miembros leen las escenas de su aventura" on public.scenes;
create policy "Miembros leen las escenas de su aventura"
  on public.scenes for select
  using (
    exists (
      select 1 from public.playthroughs p
      where p.adventure_id = scenes.adventure_id and public.is_playthrough_member(p.id)
    )
  );

drop policy if exists "Miembros leen las opciones de sus escenas" on public.scene_options;
create policy "Miembros leen las opciones de sus escenas"
  on public.scene_options for select
  using (
    exists (
      select 1 from public.scenes s
      join public.playthroughs p on p.adventure_id = s.adventure_id
      where s.id = scene_options.scene_id and public.is_playthrough_member(p.id)
    )
  );
