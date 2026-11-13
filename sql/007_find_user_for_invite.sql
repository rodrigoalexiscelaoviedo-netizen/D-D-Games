-- 007: buscar un usuario por email para invitarlo a una partida (aditivo).
-- Solo el director de la partida puede usarla. No devuelve emails: solo el id del usuario.
-- Ejecutar en el SQL editor de Supabase.

create or replace function public.find_user_id_by_email(p_playthrough_id uuid, p_email text)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_owner uuid;
  v_found uuid;
begin
  select user_id into v_owner from public.playthroughs where id = p_playthrough_id;
  if v_owner is null or v_owner <> auth.uid() then
    raise exception 'Solo el director de la partida puede invitar jugadores';
  end if;

  select id into v_found
  from auth.users
  where lower(email) = lower(trim(p_email))
  limit 1;

  return v_found;
end;
$$;

revoke all on function public.find_user_id_by_email(uuid, text) from public;
grant execute on function public.find_user_id_by_email(uuid, text) to authenticated;
