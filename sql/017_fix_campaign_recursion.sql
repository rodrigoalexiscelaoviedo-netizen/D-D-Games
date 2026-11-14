-- 017: corrige la recursión introducida por 016 (aditivo, reemplaza esa regla).
-- Síntoma: "Partida no encontrada" en el lobby, para todos.
-- Causa: la regla de campañas consultaba partidas, y la de partidas consultaba campañas.
-- Solución: la comprobación pasa por una función con security definer, que no vuelve a
-- aplicar las reglas.

create or replace function public.is_campaign_player(p_campaign_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.playthroughs p
    join public.playthrough_participants pp on pp.playthrough_id = p.id
    where p.campaign_id = p_campaign_id and pp.user_id = auth.uid()
  );
$$;

grant execute on function public.is_campaign_player(uuid) to authenticated;

drop policy if exists "Jugadores leen la campaña de sus partidas" on public.campaigns;
create policy "Jugadores leen la campaña de sus partidas"
  on public.campaigns for select
  using (public.is_campaign_player(campaigns.id));
