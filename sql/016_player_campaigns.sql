-- 016: los jugadores ven la campaña de la partida en la que participan (aditivo).
-- Después de 015. Solo lectura: el jugador ve el nombre y datos básicos de la campaña,
-- no puede editarla ni verla si no participa en una partida suya.

drop policy if exists "Jugadores leen la campaña de sus partidas" on public.campaigns;
create policy "Jugadores leen la campaña de sus partidas"
  on public.campaigns for select
  using (
    exists (
      select 1 from public.playthroughs p
      where p.campaign_id = campaigns.id and public.is_playthrough_member(p.id)
    )
  );
