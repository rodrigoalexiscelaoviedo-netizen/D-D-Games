-- 008: el CR del bestiario admite fracciones (1/8, 1/4, 1/2). Aditivo y reversible.
-- Antes era entero, y 1/8 se guardaba como 0.
-- Ejecutar en el SQL editor de Supabase. El UPDATE de abajo corrige las filas de los
-- módulos ya cargados; no hace falta volver a instalar los módulos.

alter table public.bestiary
  alter column challenge_rating type numeric
  using challenge_rating::numeric;

update public.bestiary as b
set challenge_rating = v.cr
from (values
  ('Kobold', 0.125),
  ('Rata gigante', 0.125),
  ('Bandido', 0.125),
  ('Lobo', 0.25),
  ('Esqueleto', 0.25),
  ('Necrófago', 1),
  ('Armadura animada', 1),
  ('Capitán bandido', 2),
  ('Gárgola', 2)
) as v(name, cr)
where b.name = v.name
  and b.source = 'module';
