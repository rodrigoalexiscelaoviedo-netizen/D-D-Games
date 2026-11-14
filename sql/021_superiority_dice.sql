-- 021: dados de superioridad del Maestro de batalla, por participante de combate (aditivo).
-- Después de 020. Se corre una sola vez en el SQL Editor de Supabase.
-- Los dados se preparan al empezar cada combate; no cambia ningún dato existente.

alter table public.combat_participants
  add column if not exists superiority_dice int;
