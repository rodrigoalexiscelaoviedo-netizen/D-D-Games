-- Aventura: La Posada del Camino (8 escenas con múltiples finales)
-- Estructura: intro → desarrollo → encuentros → 3 finales posibles

-- INSERT adventure (idempotent: check if exists)
INSERT INTO adventures (id, title, synopsis, suggested_level, author, origin)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'La Posada del Camino',
  'Un viaje ordinario se tuerce cuando los aventureros llegan a una posada de mala reputación. Intriga, traiciones y secretos políticos se tejen en las sombras.',
  3,
  'Master DM',
  'Original'
)
ON CONFLICT (id) DO NOTHING;

-- Scene 1: Intro (narración, sin opciones previas)
INSERT INTO scenes (id, adventure_id, scene_order, scene_type, title, dm_text, player_text)
VALUES (
  '550e8400-e29b-41d4-a716-446655440101',
  '550e8400-e29b-41d4-a716-446655440001',
  1,
  'narracion',
  'Llegada a la posada',
  'Los aventureros viajan por el Camino Real cuando llega el atardecer. Una tormenta se aproxima. A lo lejos ven una posada de piedra gris, la "Posada del Dragón Dormido". La posada tiene mala fama según los rumores del pueblo: dicen que el posadero, Aldus Krane, es un aprovechado que no duda en desplomar a los viajeros. Pero es el único refugio cercano.',
  'Tras horas de viaje, el cansancio pesa en vuestros huesos. La tormenta se aproxima, oscureciendo el cielo. Una posada de piedra emerge de la nada: la Posada del Dragón Dormido. Tienen que buscar refugio.'
)
ON CONFLICT (id) DO NOTHING;

-- Scene 2: Entrada a la posada (decision)
INSERT INTO scenes (id, adventure_id, scene_order, scene_type, title, dm_text, player_text)
VALUES (
  '550e8400-e29b-41d4-a716-446655440102',
  '550e8400-e29b-41d4-a716-446655440001',
  2,
  'decision',
  'En el umbral',
  'El interior es cálido pero inhóspito. Huele a cerveza rancia y humo de tabaco. Aldus Krane está detrás de la barra, un hombre gordo con cicatrices. Junto a la chimenea hay dos figuras misteriosas: un elfo de capa negra y una mujer con el uniforme de la Guardia Real. Se observan entre sí con tensión. Aldus sonríe falso cuando entran los aventureros. "Bienvenidos, viajeros. Habitaciones a 5 monedas de oro cada una. La cena cuesta extra."',
  'El calor del fuego contrasta con el frío de afuera. El aire es denso. Dos figuras en la posada llaman vuestra atención: un elfo encapuchado en la sombra, y una mujer con uniforme militar junto a la chimenea. Se observan entre sí. El posadero, Aldus, os saluda con falsa cordialidad.'
)
ON CONFLICT (id) DO NOTHING;

-- Scene 3a: Hablar con el elfo (combate)
INSERT INTO scenes (id, adventure_id, scene_order, scene_type, title, dm_text, player_text, encounter)
VALUES (
  '550e8400-e29b-41d4-a716-446655440103',
  '550e8400-e29b-41d4-a716-446655440001',
  3,
  'combate',
  'Traición en las sombras',
  'El elfo revela que es un asesino contratado para eliminar a la guardiana. Cuando los aventureros se acercan, saca sus armas. ¡Combate!',
  'El elfo desenrolla sus armas. Es una emboscada. ¡A la batalla!',
  '{"bestiary_name": "asesino_elfo", "count": 1, "note": "nivel 4"}'
)
ON CONFLICT (id) DO NOTHING;

-- Scene 3b: Hablar con la guardia (narración)
INSERT INTO scenes (id, adventure_id, scene_order, scene_type, title, dm_text, player_text)
VALUES (
  '550e8400-e29b-41d4-a716-446655440104',
  '550e8400-e29b-41d4-a716-446655440001',
  3,
  'narracion',
  'Confidente inesperada',
  'La guardiana se presenta como Capitana Lyra Ashton de la Guardia Real. Ella ha sido perseguida por asesinos de la mafia local durante días. Si los aventureros la ayudan a llegar a la capital, hay una recompensa. El elfo en la esquina es uno de esos asesinos.',
  'Una mujer con uniforme se acerca sigilosamente. "Soy Lyra Ashton, Capitana de la Guardia Real. Estoy en peligro. Esos hombres me buscan por información que poseo. ¿Me ayudarán?"'
)
ON CONFLICT (id) DO NOTHING;

-- Scene 4: Aldus ofrece información (narración)
INSERT INTO scenes (id, adventure_id, scene_order, scene_type, title, dm_text, player_text)
VALUES (
  '550e8400-e29b-41d4-a716-446655440105',
  '550e8400-e29b-41d4-a716-446655440001',
  4,
  'narracion',
  'El secreto del posadero',
  'Si los aventureros ganaron el combate o hablaron con Lyra, pueden presionar a Aldus. Revela que él trabaja para la mafia, facilitando asesinatos. Pero también guarda un secreto: la mafia tiene un almacén secreto en el sótano de la posada con pruebas de corrupción en la capital.',
  'Aldus, asustado, susurra: "Hay un almacén en el sótano. Documentos, dinero... Todo lo que necesitan para destruir a los jefes de la mafia. Pero si me delatan, me matan."'
)
ON CONFLICT (id) DO NOTHING;

-- Scene 5a: Investigar el sótano (tirada de dados/exploración)
INSERT INTO scenes (id, adventure_id, scene_order, scene_type, title, dm_text, player_text)
VALUES (
  '550e8400-e29b-41d4-a716-446655440106',
  '550e8400-e29b-41d4-a716-446655440001',
  5,
  'tirada',
  'El sótano oscuro',
  'El sótano es un laberinto de cajas y barriles. Hay documentos incriminadores, pero también trampas. Los aventureros deben hacer tiradas de Inteligencia (Investigación) para encontrar pruebas sin activar alarmas.',
  'Bajáis a la oscuridad. Polvo y humedad. Documentos dispersos entre cajas viejas. ¿Buscan con cuidado o rápido?'
)
ON CONFLICT (id) DO NOTHING;

-- Scene 5b: Escapar sin investigar (narración)
INSERT INTO scenes (id, adventure_id, scene_order, scene_type, title, dm_text, player_text)
VALUES (
  '550e8400-e29b-41d4-a716-446655440107',
  '550e8400-e29b-41d4-a716-446655440001',
  5,
  'narracion',
  'Huida urgente',
  'Sin tiempo para investigar, Lyra urge a los aventureros a partir. Ella tiene contactos en la capital que pueden ayudar. Abandonan la posada sin más pruebas que su testimonio.',
  'Lyra os apresura: "Debemos irnos. Ahora. Mi gente espera en la capital con soldados. Podemos esperar allá."'
)
ON CONFLICT (id) DO NOTHING;

-- Scene 6: Final A - Victoria Total (narración)
INSERT INTO scenes (id, adventure_id, scene_order, scene_type, title, dm_text, player_text)
VALUES (
  '550e8400-e29b-41d4-a716-446655440108',
  '550e8400-e29b-41d4-a716-446655440001',
  6,
  'narracion',
  'La capital librada del mal',
  'Con las pruebas en mano y Lyra viva, los aventureros llegan a la capital. La Guardia Real captura a los jefes de la mafia. Lyra se convierte en Comandante y ofrece a los aventureros un rango honorario en la Guardia. Aldus es arrestado, pero colabora y recibe clemencia.',
  'Las calles de la capital se llenan de soldados de la Guardia Real. Los criminales caen. Lyra os proclama héroes ante el rey. "Habéis salvado el reino."'
)
ON CONFLICT (id) DO NOTHING;

-- Scene 6b: Final B - Victoria Pírrica (narración)
INSERT INTO scenes (id, adventure_id, scene_order, scene_type, title, dm_text, player_text)
VALUES (
  '550e8400-e29b-41d4-a716-446655440109',
  '550e8400-e29b-41d4-a716-446655440001',
  6,
  'narracion',
  'Testimonios sin pruebas',
  'Sin documentos, Lyra debe confiar solo en su palabra. Llega a la capital herida y acorralada. El consejo real duda. Sin evidencia, la mafia negocia un acuerdo: se disuelven sus operaciones legales pero escapan con sus riquezas. Es una victoria a medias, amargada.',
  'Lyra llega a la capital con cicatrices. "Sin pruebas, no pueden condenar a los jefes. Hemos ganado batalla, no guerra. Pero al menos sobrevivimos."'
)
ON CONFLICT (id) DO NOTHING;

-- Scene 6c: Final C - Tragedia (narración)
INSERT INTO scenes (id, adventure_id, scene_order, scene_type, title, dm_text, player_text)
VALUES (
  '550e8400-e29b-41d4-a716-446655440110',
  '550e8400-e29b-41d4-a716-446655440001',
  6,
  'narracion',
  'La mafia triunfa',
  'Si los aventureros fallaron el combate o traicionaron a Lyra, la mafia los alcanza en la posada. Lyra muere. Los documentos arden. La mafia consolida su poder en la capital. Los aventureros huyen, perseguidos, con la culpa de haber fracasado.',
  'El fuego consume la posada. Lyra cae. La mafia les persigue. Sois fugitivos en un reino corrupto.'
)
ON CONFLICT (id) DO NOTHING;

-- Scene options (decision points linking scenes)
-- From Scene 2: enter
INSERT INTO scene_options (id, scene_id, option_order, player_label, dm_note, leads_to_scene_id)
VALUES (
  '550e8400-e29b-41d4-a716-446655440201',
  '550e8400-e29b-41d4-a716-446655440102',
  1,
  'Hablar con el elfo encapuchado',
  'Combate inminente si no logran persuadir',
  '550e8400-e29b-41d4-a716-446655440103'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO scene_options (id, scene_id, option_order, player_label, dm_note, leads_to_scene_id)
VALUES (
  '550e8400-e29b-41d4-a716-446655440202',
  '550e8400-e29b-41d4-a716-446655440102',
  2,
  'Acercarse a la guardiana',
  'Lyra revela su situación',
  '550e8400-e29b-41d4-a716-446655440104'
)
ON CONFLICT (id) DO NOTHING;

-- From Scene 3: after combat/dialogue, go to Scene 4
INSERT INTO scene_options (id, scene_id, option_order, player_label, dm_note, leads_to_scene_id)
VALUES (
  '550e8400-e29b-41d4-a716-446655440203',
  '550e8400-e29b-41d4-a716-446655440103',
  1,
  'Presionar a Aldus',
  'Si ganaron el combate',
  '550e8400-e29b-41d4-a716-446655440105'
),
(
  '550e8400-e29b-41d4-a716-446655440204',
  '550e8400-e29b-41d4-a716-446655440104',
  1,
  'Investigar el sótano',
  'Buscan pruebas',
  '550e8400-e29b-41d4-a716-446655440106'
),
(
  '550e8400-e29b-41d4-a716-446655440205',
  '550e8400-e29b-41d4-a716-446655440104',
  2,
  'Escapar ahora',
  'Huida sin investigación',
  '550e8400-e29b-41d4-a716-446655440107'
),
(
  '550e8400-e29b-41d4-a716-446655440206',
  '550e8400-e29b-41d4-a716-446655440106',
  1,
  'Partir hacia la capital',
  'Con las pruebas en mano',
  '550e8400-e29b-41d4-a716-446655440108'
),
(
  '550e8400-e29b-41d4-a716-446655440207',
  '550e8400-e29b-41d4-a716-446655440107',
  1,
  'Llegar a la capital',
  'Sin documentos',
  '550e8400-e29b-41d4-a716-446655440109'
)
ON CONFLICT (id) DO NOTHING;
