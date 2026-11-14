-- 015: posiciones de los participantes en el mapa del combate (aditivo).
-- Después de 014. El mapa es una cuadrícula de 8 columnas por 6 filas (0 a 7 y 0 a 5).
-- Cada participante tiene pos_x y pos_y. Si quedan vacías, la app le asigna lugar al empezar.

alter table public.combat_participants
  add column if not exists pos_x int,
  add column if not exists pos_y int;
