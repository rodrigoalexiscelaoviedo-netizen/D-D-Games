-- load_bestiary_srd.sql
-- Carga del Bestiario SRD 5.1 para D&D VTT
-- Requiere: índice único parcial + inserts idempotentes
-- Creado: 2026-08-23

-- Paso 1: Crear índice único parcial para garantizar nombres únicos en SRD
-- (permite duplicados si source != 'srd', evita re-inserts del SRD)
CREATE UNIQUE INDEX IF NOT EXISTS bestiary_srd_name_unique
  ON public.bestiary(name)
  WHERE source = 'srd';

-- Paso 2: Migración de 8 monstruos existentes a SRD
-- (garantiza que tengan source='srd' y user_id=NULL)
UPDATE public.bestiary
SET source = 'srd', user_id = NULL, challenge_rating = challenge_rating
WHERE name IN (
  'Goblin', 'Lobo', 'Bandido', 'Esqueleto',
  'Orco', 'Araña gigante', 'Ogro', 'Dragón joven'
)
AND source != 'srd';

-- Paso 3: Cargar monstruos SRD CR 0–5 desde 5e-SRD-Monsters.json
--
-- IMPORTANTE: Este template debe ser llenado con datos del repositorio:
-- https://github.com/5e-bits/5e-database/blob/main/src/2014/5e-SRD-Monsters.json
--
-- Formato de cada fila en VALUES:
-- (name_es, hp, armor_class, dexterity, damage_dice, attack_bonus, description, xp_value, challenge_rating, portrait_seed)
--
-- Ejemplo (reemplazar VALUES con datos reales del SRD):

INSERT INTO public.bestiary (
  name, hp, armor_class, dexterity, damage_dice, attack_bonus,
  description, xp_value, challenge_rating, source, user_id, portrait_seed
)
SELECT
  name, hp, armor_class, dexterity, damage_dice, attack_bonus,
  description, xp_value, challenge_rating, 'srd', NULL, portrait_seed
FROM (
  VALUES
    -- CR 0
    ('Hormiga gigante', 1, 12, 11, 1, 3, 'Hormiga monstruosamente grande', 10, 0, 'hormiga-gigante'),
    ('Sapo gigante', 4, 11, 12, 4, 4, 'Sapo depredador de tamaño colosal', 50, 0, 'sapo-gigante'),
    ('Araña diminuta', 1, 12, 14, 1, 4, 'Araña agresiva del tamaño de una mano', 10, 0, 'araña-diminuta'),

    -- CR 1
    ('Bandido de hierro', 11, 12, 12, 6, 2, 'Bandido experimentado con equipo militar', 50, 1, 'bandido-hierro'),
    ('Halcón gigante', 13, 13, 14, 6, 4, 'Halcón agresivo del tamaño de un lobo', 100, 1, 'halcón-gigante'),
    ('Goblin soldado', 7, 12, 11, 4, 3, 'Goblin entrenado en tácticas de combate', 50, 1, 'goblin-soldado'),
    ('Lobo dire', 37, 13, 16, 8, 5, 'Lobo monstruoso depredador', 1100, 3, 'lobo-dire'),

    -- CR 2
    ('Acolito oscuro', 27, 12, 11, 6, 3, 'Sacerdote corrupto con magia oscura', 450, 2, 'acolito-oscuro'),
    ('Animación de fuego', 22, 13, 12, 6, 5, 'Elemental de fuego voraz', 450, 2, 'animacion-fuego'),
    ('Ogro cazador', 59, 11, 10, 8, 6, 'Ogro entrenado para la cacería', 700, 2, 'ogro-cazador'),

    -- CR 3
    ('Animación de roca', 84, 15, 6, 6, 7, 'Elemental de tierra inmovible', 700, 3, 'animacion-roca'),
    ('Basilisco joven', 52, 15, 14, 6, 5, 'Basilisco no completamente adulto', 700, 3, 'basilisco-joven'),
    ('Caballero negro', 52, 15, 11, 8, 5, 'Guerrero maldito en armadura', 700, 3, 'caballero-negro'),

    -- CR 4
    ('Demilich guardián', 45, 16, 16, 6, 5, 'Nécromante desencarnado', 1100, 4, 'demilich-guardian'),
    ('Efreet mercenario', 150, 17, 12, 8, 6, 'Elemental Efreet contratado', 1100, 4, 'efreet-mercenario'),
    ('Gárgola voladora', 52, 15, 12, 6, 5, 'Estatua de piedra animada', 1100, 4, 'gargola-voladora'),

    -- CR 5
    ('Dragón azul joven', 142, 17, 14, 8, 7, 'Dragón color azul aún en desarrollo', 1800, 5, 'dragón-azul-joven'),
    ('Demonio tipo I', 110, 16, 16, 8, 7, 'Demonio menor servil a amos mayores', 1800, 5, 'demonio-tipo-i'),
    ('Gigante de fuego', 102, 15, 10, 8, 8, 'Gigante elementalista del fuego', 1800, 5, 'gigante-fuego')

    -- NOTA: Datos de ejemplo. Reemplazar con valores reales del 5e-SRD-Monsters.json
    -- Traducir nombres al español, usar portrait_seed = slug del nombre

) AS srd_data(name, hp, armor_class, dexterity, damage_dice, attack_bonus, description, xp_value, challenge_rating, portrait_seed)
WHERE NOT EXISTS (
  SELECT 1 FROM public.bestiary
  WHERE name = srd_data.name
    AND source = 'srd'
);

-- Paso 4: Verificación post-carga
-- Ejecutar después de cargar para confirmar:
SELECT
  COUNT(*) as total_bestiary,
  COUNT(CASE WHEN source = 'srd' THEN 1 END) as srd_monstruos,
  COUNT(CASE WHEN source != 'srd' THEN 1 END) as propios_monstruos,
  COUNT(CASE WHEN challenge_rating IS NOT NULL THEN 1 END) as con_cr
FROM public.bestiary;
