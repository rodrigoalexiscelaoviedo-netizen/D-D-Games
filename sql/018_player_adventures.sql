-- 018: los jugadores leen la aventura de su partida (aditivo, solo lectura).
-- Después de 017. La app necesita el origen de la aventura para mostrar el módulo
-- (ilustraciones, pruebas, documentos) en la vista del jugador.

create or replace function public.is_adventure_player(p_adventure_id uuid)
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
    where p.adventure_id = p_adventure_id and pp.user_id = auth.uid()
  );
$$;

grant execute on function public.is_adventure_player(uuid) to authenticated;

drop policy if exists "Jugadores leen la aventura de sus partidas" on public.adventures;
create policy "Jugadores leen la aventura de sus partidas"
  on public.adventures for select
  using (public.is_adventure_player(adventures.id));
