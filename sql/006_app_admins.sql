-- 006: lista de administradores de la app (aditivo).
-- Ejecutar en el SQL editor de Supabase. Después agregar tu usuario con:
--   insert into public.app_admins (user_id)
--   select id from auth.users where email = 'TU_EMAIL' on conflict do nothing;

create table if not exists public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.app_admins enable row level security;

-- Cada usuario solo puede leer su propia fila. Nadie puede agregar admins desde la app:
-- se agregan a mano desde el SQL editor.
drop policy if exists "Users can read their own admin row" on public.app_admins;
create policy "Users can read their own admin row"
  on public.app_admins for select
  using (auth.uid() = user_id);

create or replace function public.is_app_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.app_admins where user_id = auth.uid());
$$;

grant execute on function public.is_app_admin() to authenticated;
