-- 020: mejoras de característica y conjuros pendientes por subida de nivel (aditivo).
-- Después de 019. Se corre una sola vez en el SQL Editor de Supabase.
-- No cambia ningún dato existente: las columnas nuevas arrancan en 0.

alter table public.characters
  add column if not exists pending_asi int not null default 0,
  add column if not exists pending_spells int not null default 0;
