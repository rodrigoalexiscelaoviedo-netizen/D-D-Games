-- 005: alinea la base con lo que el código escribe.
-- Solo agrega columnas (nullable). No borra ni modifica datos existentes.

-- Partidas: la app guarda el dueño (DM) de cada partida.
alter table public.playthroughs
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists idx_playthroughs_user_id on public.playthroughs (user_id);

-- Aventuras: el instalador de módulos guarda el autor visible.
alter table public.adventures
  add column if not exists author text;

-- Origen: la base solo aceptaba preloaded/own/ai. Los módulos se identifican
-- como "module:<slug>". Se amplía la restricción (no se quita ningún valor).
alter table public.adventures drop constraint if exists adventures_origin_check;
alter table public.adventures add constraint adventures_origin_check
  check (origin = any (array['preloaded'::text, 'own'::text, 'ai'::text]) or origin like 'module:%');

-- Escenas y opciones: solo tenían lectura. Se agrega escritura para el dueño
-- de la aventura (el instalador de módulos y el editor de aventuras).
drop policy if exists scenes_owner_write on public.scenes;
create policy scenes_owner_write on public.scenes for all
  using (exists (select 1 from public.adventures a where a.id = scenes.adventure_id and a.user_id = auth.uid()))
  with check (exists (select 1 from public.adventures a where a.id = scenes.adventure_id and a.user_id = auth.uid()));

drop policy if exists scene_options_owner_write on public.scene_options;
create policy scene_options_owner_write on public.scene_options for all
  using (exists (select 1 from public.scenes s join public.adventures a on a.id = s.adventure_id where s.id = scene_options.scene_id and a.user_id = auth.uid()))
  with check (exists (select 1 from public.scenes s join public.adventures a on a.id = s.adventure_id where s.id = scene_options.scene_id and a.user_id = auth.uid()));

-- Bestiario Open5e: la app usa la tabla `creatures` (ver sql-migrations/001).
-- Nunca se había aplicado en la base. Se crea solo si no existe.
create extension if not exists pg_trgm;

create table if not exists public.creatures (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  type text not null,
  size text,
  cr numeric not null,
  hp integer not null,
  ac integer not null,
  str integer, dex integer, con integer, int integer, wis integer, cha integer,
  speed text, abilities text, actions text, reactions text, languages text,
  damage_resistances text, damage_immunities text,
  source text default 'custom',
  open5e_index text unique,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create index if not exists idx_creatures_name on public.creatures using gin (name gin_trgm_ops);
create index if not exists idx_creatures_type on public.creatures (type);
create index if not exists idx_creatures_cr on public.creatures (cr);
create index if not exists idx_creatures_source on public.creatures (source);

alter table public.creatures enable row level security;

drop policy if exists "Creatures are readable by everyone" on public.creatures;
create policy "Creatures are readable by everyone" on public.creatures for select using (true);

drop policy if exists "Authenticated users can create creatures" on public.creatures;
create policy "Authenticated users can create creatures" on public.creatures for insert with check (auth.role() = 'authenticated');

drop policy if exists "Users can update their own creatures" on public.creatures;
create policy "Users can update their own creatures" on public.creatures for update
  using (source = 'custom' or auth.role() = 'service_role')
  with check (source = 'custom' or auth.role() = 'service_role');
