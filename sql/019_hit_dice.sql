-- 019: dados de golpe disponibles por personaje (aditivo).
-- Después de 018. Si la columna está vacía, la app usa el nivel del personaje.
-- Descanso corto: se gastan dados de golpe para curarse. Descanso largo: vuelve la mitad (mínimo 1).

alter table public.characters
  add column if not exists hit_dice_left int;
