import type { AdventureModule } from './types';
import { MONSTERS } from './monsters';

const IMG = '/modules/campanas-valdehierro';

export const campanasValdehierro: AdventureModule = {
  slug: 'campanas-valdehierro',
  title: 'Las Campanas de Valdehierro',
  subtitle: 'Una aventura de misterio y cripta',
  level: 1,
  players: '3–5 personajes',
  duration: '3–4 horas',
  accent: '#7c2d3a',
  cover: `${IMG}/portada.jpg`,
  synopsis:
    'Cada medianoche, las campanas de la capilla de Valdehierro tañen solas aunque el campanario está cerrado con llave. El viejo campanero ha desaparecido y en el pueblo faltan ollas, candelabros y herraduras: todo lo que sea de bronce. Algo bajo la aldea está fundiendo una campana nueva.',
  monsters: [MONSTERS.kobold, MONSTERS.rataGigante, MONSTERS.necrofago],
  scenes: [
    {
      key: 'llegada',
      order: 1,
      type: 'narracion',
      title: 'Llegada a Valdehierro',
      ambient: 'forest',
      readAloud:
        'El camino de herradura baja entre pinos negros hasta un valle encajonado. Valdehierro es poco más que treinta casas de piedra apiñadas alrededor de una capilla de torre cuadrada, con las bocas tapiadas de una mina vieja abiertas en la ladera como cuencas vacías.\n\nEl sol se esconde detrás del monte. Justo entonces, las tres campanas de la capilla empiezan a sonar. No es un toque de vísperas: es un repique desordenado, frenético, como si alguien las golpeara sin saber cómo. Las contraventanas del pueblo se cierran una tras otra. Nadie sale a mirar.',
      dmText:
        'Los personajes llegan al atardecer, ya sea por encargo (un pregón en la ciudad pide "gente capaz" en Valdehierro, 50 po) o de paso hacia otro lugar. El repique dura medio minuto y se corta en seco.\n\nVerdad oculta: Tobías, el campanero, encontró en la cripta un badajo de hierro negro, reliquia de un culto antiguo. Al tocarlo murió y se levantó como necrófago. Ahora vaga por la cripta y los túneles de la mina, tañendo las campanas desde abajo (las cuerdas bajan por un hueco hasta la cripta). Una tribu de kobolds de la mina cree que el sonido es la voz de su dios dragón y le lleva bronce para fundirle "una campana digna".',
      dmTips: [
        'Que el primer repique suene raro: golpea la mesa a destiempo mientras lees.',
        'Si alguien corre a la capilla ahora, la encuentra cerrada; el sonido ya ha parado.',
      ],
      options: [{ label: 'Entrar en el pueblo', to: 'plaza' }],
    },
    {
      key: 'plaza',
      order: 2,
      type: 'decision',
      title: 'La plaza del pozo',
      ambient: 'tavern',
      image: `${IMG}/plaza.jpg`,
      readAloud:
        'En la plaza solo hay una persona: una mujer alta con un farol y un abrigo de minero demasiado grande. "Sois los del pregón, ¿verdad? Soy Mirela Sanz, alcaldesa de lo que queda de esto." Señala la torre con la barbilla. "Lleva nueve noches así. Tobías, el campanero, desapareció la segunda. Y desde entonces nos roban: ollas, candelabros, la campanilla de la cabra de los Ferrán. Todo de bronce. Cincuenta monedas de oro si lo arregláis. Setenta si encontráis a Tobías vivo."',
      dmText:
        'Mirela es pragmática y está asustada. Sabe que la llave del campanario la tenía Tobías y que la herrera, Dunia, guarda una copia. Sospecha (mal) de unos mineros forasteros.\n\nRumores (tira 1d4 o elige si preguntan por ahí):\n1. "Las campanas suenan con las cuerdas quietas. Lo vio Ferrán." (cierto)\n2. "Por la mina vieja se oyen martillazos de noche." (cierto: los kobolds funden bronce)\n3. "Tobías se fue con una mujer de Puertoalto." (falso)\n4. "Debajo de la capilla hay muertos de antes del pueblo." (cierto)',
      npcs: [
        { name: 'Mirela Sanz', role: 'Alcaldesa', voice: 'Seca, directa, termina las frases mirando a la torre.' },
      ],
      handouts: [
        {
          id: 'pregon',
          title: 'Pregón clavado en el pozo',
          kind: 'poster',
          text: 'SE BUSCA GENTE CAPAZ\n\nEl concejo de Valdehierro pagará\nCINCUENTA MONEDAS DE ORO\na quien ponga fin al tañido nocturno\ny a los robos de bronce.\n\nSETENTA si se trae de vuelta a\nTOBÍAS ARNAU, campanero.\n\nPreguntad por la alcaldesa.',
          signature: 'M. Sanz, alcaldesa',
        },
      ],
      options: [
        { label: 'Ir directamente a la capilla', to: 'capilla' },
        { label: 'Visitar la forja de la herrera Dunia', to: 'forja' },
        { label: 'Esperar a medianoche en la taberna, vigilando', to: 'medianoche', dmNote: 'Lleva al combate en la taberna.' },
      ],
    },
    {
      key: 'capilla',
      order: 3,
      type: 'tirada',
      title: 'La capilla cerrada',
      ambient: 'dungeon',
      readAloud:
        'La capilla huele a cera vieja y a tierra mojada. Los bancos están cubiertos de polvo, salvo un pasillo limpio que va de la puerta lateral al altar, como si alguien lo recorriera cada noche. La puerta del campanario, al fondo, tiene un candado de hierro. Hace frío. Más del que debería.',
      dmText:
        'La puerta lateral de la capilla está forzada desde fuera (los kobolds). El altar de piedra se desplaza con una prueba de Fuerza CD 12 o encontrando el resorte, y revela una escalera que baja a la cripta.\n\nEl candado del campanario: Destreza con herramientas de ladrón CD 13, o la llave de Dunia.',
      checks: [
        { skill: 'Investigación', dc: 12, success: 'Huellas pequeñas con garras en el polvo, y virutas de bronce raspadas en el suelo junto al altar.', failure: 'Solo veis polvo y el pasillo limpio.' },
        { skill: 'Percepción', dc: 13, success: 'Una corriente de aire frío sale por la ranura de la base del altar. Hay algo debajo.', failure: 'Hace frío, sin más.' },
        { skill: 'Religión', dc: 10, success: 'Los relieves del altar son anteriores a la capilla: un culto que "llamaba a los muertos con bronce".', failure: 'Relieves viejos y gastados.' },
      ],
      map: {
        name: 'Capilla de Valdehierro',
        cols: 18, rows: 12, outside: 'grass',
        areas: [
          { id: 'nave', label: 'Nave', x: 2, y: 2, w: 11, h: 8, floor: 'tile' },
          { id: 'abside', label: 'Altar', x: 13, y: 3, w: 3, h: 6, floor: 'stone' },
          { id: 'torre', label: 'Campanario', x: 2, y: 10, w: 3, h: 2, floor: 'stone' },
        ],
        features: [
          { kind: 'altar', x: 14, y: 5, w: 1, h: 2 },
          { kind: 'door', x: 2, y: 5 },
          { kind: 'door', x: 8, y: 9 },
          { kind: 'door', x: 3, y: 9 },
          { kind: 'table', x: 4, y: 3, w: 6, h: 1 },
          { kind: 'table', x: 4, y: 5, w: 6, h: 1 },
          { kind: 'table', x: 4, y: 7, w: 6, h: 1 },
          { kind: 'pillar', x: 12, y: 2 },
          { kind: 'pillar', x: 12, y: 9 },
          { kind: 'bell', x: 3, y: 10 },
        ],
        dmMarkers: [
          { kind: 'secret', x: 15, y: 6, label: 'Escalera oculta bajo el altar' },
          { kind: 'trap', x: 8, y: 9, label: 'Puerta forzada (huellas kobold)' },
        ],
      },
      options: [
        { label: 'Mover el altar y bajar por la escalera oculta', to: 'bajo-altar' },
        { label: 'Abrir el campanario con la llave de Dunia', to: 'campanario', requiresFlag: 'llave_campanario' },
        { label: 'Seguir al kobold capturado hasta su túnel', to: 'tuneles', requiresFlag: 'kobold_interrogado', dmNote: 'Atajo: se saltan la cripta y llegan a los túneles.' },
        { label: 'Volver al pueblo a preguntar a la herrera', to: 'forja' },
      ],
    },
    {
      key: 'forja',
      order: 4,
      type: 'narracion',
      title: 'La forja de Dunia',
      ambient: 'tavern',
      image: `${IMG}/forja.jpg`,
      readAloud:
        'La forja es la única casa con luz. Dunia, una mujer ancha de brazos quemados, deja el martillo al veros. "A mí me han limpiado la trastienda: dos calderos y un yunque de bronce que pesaba más que un mulo. Eso no lo carga un ladrón, lo carga una cuadrilla." Saca de un cajón una llave larga y oxidada. "Tobías me la dejó por si se le perdía la suya. Decía que últimamente oía cantar debajo del suelo de la capilla. Pensé que era el vino."',
      dmText:
        'Dunia entrega la llave del campanario. Si los personajes le caen bien (o le prometen recuperar su yunque), les regala un frasco de aceite y una palanca.\n\nDato útil: el bronce es pesado; quien lo roba lo arrastra. Hay surcos en el barro que llevan de la forja a la capilla.',
      npcs: [
        { name: 'Dunia Roca', role: 'Herrera', voice: 'Habla alto, como si siguiera habiendo martillazos. Cariñosa con quien trabaja.' },
      ],
      treasure: ['Llave del campanario', 'Palanca (ventaja en Fuerza para mover el altar)', 'Frasco de aceite'],
      options: [
        { label: 'Ir a la capilla con la llave', to: 'capilla', setsFlag: 'llave_campanario' },
      ],
    },
    {
      key: 'medianoche',
      order: 5,
      type: 'combate',
      title: 'Medianoche: los ladrones',
      ambient: 'tavern',
      image: `${IMG}/medianoche.jpg`,
      readAloud:
        'La taberna se ha vaciado. El fuego es ya solo brasas. A medianoche las campanas vuelven a sonar, y bajo el estruendo oís otra cosa: un arañazo en la puerta de la cocina, risitas agudas, el tintineo de cazos. Tres figuras pequeñas, con escamas del color del óxido y sacos al hombro, se cuelan por la ventana trasera.',
      dmText:
        'Tres kobolds han venido a por las ollas de bronce de la cocina. Llevan sacos y cuerdas. Si uno queda con 2 PG o menos, intenta huir por la ventana.\n\nSi los personajes capturan a uno con vida, puede llevarles a los túneles (desbloquea un atajo en la capilla). Habla dracónico y un común muy roto: "¡Campana grande para el que canta abajo!"',
      encounter: { monster: 'Kobold', count: 3, note: 'Tácticas de manada; huyen a 2 PG.' },
      map: {
        name: 'Taberna El Candil',
        cols: 16, rows: 12, outside: 'void',
        areas: [
          { id: 'sala', label: 'Sala común', x: 1, y: 1, w: 10, h: 10, floor: 'wood' },
          { id: 'cocina', label: 'Cocina', x: 11, y: 1, w: 4, h: 6, floor: 'stone' },
          { id: 'almacen', label: 'Despensa', x: 11, y: 7, w: 4, h: 4, floor: 'stone' },
        ],
        features: [
          { kind: 'bar', x: 2, y: 2, w: 5, h: 1 },
          { kind: 'fire', x: 9, y: 9 },
          { kind: 'table', x: 3, y: 5, w: 2, h: 1 },
          { kind: 'table', x: 7, y: 5, w: 2, h: 1 },
          { kind: 'table', x: 3, y: 8, w: 2, h: 1 },
          { kind: 'door', x: 11, y: 4 },
          { kind: 'door', x: 1, y: 6 },
          { kind: 'barrel', x: 12, y: 8 },
          { kind: 'barrel', x: 13, y: 8 },
          { kind: 'crate', x: 12, y: 10 },
          { kind: 'table', x: 12, y: 3, w: 2, h: 1 },
        ],
        dmMarkers: [
          { kind: 'enemy', x: 14, y: 2, label: 'Kobold' },
          { kind: 'enemy', x: 13, y: 2, label: 'Kobold' },
          { kind: 'enemy', x: 14, y: 5, label: 'Kobold (vigía)' },
        ],
      },
      options: [
        { label: 'Victoria: atrapáis a los ladrones', to: 'capilla', setsFlag: 'kobold_interrogado', dmNote: 'Si ninguno sobrevive, ignora el atajo del kobold capturado.' },
        { label: 'Derrota: os arrastran inconscientes', to: 'despertar' },
      ],
    },
    {
      key: 'campanario',
      order: 6,
      type: 'tirada',
      title: 'El campanario',
      ambient: 'dungeon',
      image: `${IMG}/campanario.jpg`,
      readAloud:
        'La escalera de caracol cruje. Arriba, las tres campanas cuelgan quietas. Las cuerdas no bajan hacia la capilla: se meten por un agujero en el suelo de piedra, y están cubiertas de una costra de barro negro, como si alguien tirara de ellas desde muy abajo. Sobre un taburete hay un cuaderno de cuero.',
      dmText:
        'El tercer tramo de escalera está roto. El cuaderno es el diario de Tobías (handout). Si los personajes tiran de las cuerdas, algo tira de vuelta desde abajo con fuerza inhumana (Fuerza CD 14 o soltar la cuerda y recibir 1d4 de daño por roce).',
      checks: [
        { skill: 'Atletismo', dc: 10, success: 'Saltáis el tramo roto sin problema.', failure: 'Resbalas: 1d6 contundente y llegas arriba magullado.' },
        { skill: 'Percepción', dc: 12, success: 'Del agujero sube un olor dulzón a carne podrida. Muy abajo, un tintineo.', failure: 'Solo veis la oscuridad del agujero.' },
      ],
      handouts: [
        {
          id: 'diario-tobias',
          title: 'Diario de Tobías (última página)',
          kind: 'note',
          text: 'Día 2 de la siega.\nBajé otra vez a la cripta. El agua sube. Encontré detrás del muro caído una campana pequeña rota y su badajo, negro, frío como la nieve. Lo cogí.\n\nNo debí cogerlo.\n\nTengo hambre todo el rato. La carne del guiso no me sabe a nada. Oigo cantar en las tumbas y entiendo la letra.\n\nSi alguien lee esto: no toquéis el badajo. Y no me abráis si llamo.',
          signature: 'T. A.',
        },
      ],
      options: [
        { label: 'Bajar a la cripta por la capilla', to: 'bajo-altar' },
      ],
    },
    {
      key: 'bajo-altar',
      order: 7,
      type: 'narracion',
      title: 'Bajo el altar',
      ambient: 'dungeon',
      image: `${IMG}/cripta.jpg`,
      readAloud:
        'La escalera baja en espiral y el aire se vuelve húmedo y pesado. Al final, el agua os llega por los tobillos: la cripta está medio inundada. Nichos con huesos amarillos se alinean en las paredes. Del techo cuelgan las tres cuerdas de las campanas, tensas, perdiéndose en la oscuridad del fondo. Algo chapotea más allá de la luz de vuestras antorchas.',
      dmText:
        'La cripta es terreno difícil (agua hasta la rodilla). Las cuerdas bajan hasta una grieta en la pared del fondo que conecta con los túneles de la mina. Las ratas gigantes anidan en los nichos: atacarán cuando el grupo llegue al centro.',
      options: [{ label: 'Avanzar hacia el fondo de la cripta', to: 'cripta' }],
    },
    {
      key: 'cripta',
      order: 8,
      type: 'combate',
      title: 'La cripta inundada',
      ambient: 'dungeon',
      image: `${IMG}/cripta.jpg`,
      readAloud:
        'Los nichos se mueven. De entre los huesos salen ojos rojos, decenas al principio, luego solo tres pares, grandes como monedas. Ratas del tamaño de perros se lanzan al agua hacia vosotros.',
      dmText:
        'Tres ratas gigantes. El agua es terreno difícil para todos menos para ellas (nadan). Una rata herida intenta esconderse en un nicho.\n\nTesoro: en un nicho, entre huesos, una bolsa de cuero podrida con 23 po y un anillo de plata con el escudo de la familia Sanz (Mirela lo reconocerá: era de su bisabuela, 25 po).',
      encounter: { monster: 'Rata gigante', count: 3, note: 'Nadan; el grupo está en terreno difícil.' },
      treasure: ['23 po', 'Anillo de plata de los Sanz (25 po)'],
      map: {
        name: 'Cripta inundada',
        cols: 18, rows: 12, outside: 'cave',
        areas: [
          { id: 'escalera', label: 'Escalera', x: 1, y: 5, w: 2, h: 2, floor: 'stone' },
          { id: 'cripta', label: 'Cripta', x: 3, y: 2, w: 11, h: 8, floor: 'water' },
          { id: 'grieta', label: 'Grieta', x: 14, y: 5, w: 3, h: 2, floor: 'cave', hidden: true },
        ],
        features: [
          { kind: 'stairs', x: 1, y: 5, w: 2, h: 2 },
          { kind: 'coffin', x: 4, y: 2, w: 2, h: 1 },
          { kind: 'coffin', x: 7, y: 2, w: 2, h: 1 },
          { kind: 'coffin', x: 10, y: 2, w: 2, h: 1 },
          { kind: 'coffin', x: 4, y: 9, w: 2, h: 1 },
          { kind: 'coffin', x: 7, y: 9, w: 2, h: 1 },
          { kind: 'coffin', x: 10, y: 9, w: 2, h: 1 },
          { kind: 'pillar', x: 6, y: 5 },
          { kind: 'pillar', x: 10, y: 6 },
          { kind: 'rubble', x: 13, y: 4 },
          { kind: 'rubble', x: 13, y: 7 },
        ],
        dmMarkers: [
          { kind: 'enemy', x: 5, y: 3, label: 'Rata' },
          { kind: 'enemy', x: 9, y: 8, label: 'Rata' },
          { kind: 'enemy', x: 11, y: 3, label: 'Rata' },
          { kind: 'treasure', x: 10, y: 9, label: 'Bolsa y anillo' },
        ],
      },
      options: [
        { label: 'Victoria: la cripta queda en silencio', to: 'tuneles' },
        { label: 'Derrota: caéis en el agua negra', to: 'despertar' },
      ],
    },
    {
      key: 'despertar',
      order: 9,
      type: 'decision',
      title: 'Despertar en la oscuridad',
      ambient: 'dungeon',
      image: `${IMG}/despertar.jpg`,
      readAloud:
        'Despertáis atados con cuerdas de cáñamo, con la cabeza a punto de estallar. Estáis en una galería de mina iluminada por velas de sebo. Vuestro equipo está amontonado a pocos metros, junto a un montón de bronce robado. Dos kobolds discuten en su lengua. Uno de ellos lleva puesto vuestro casco, que le tapa media cara.',
      dmText:
        'Los personajes están a 1 PG, atados (Destreza CD 12 o Fuerza CD 14 para soltarse; ventaja si alguien tiene una cuchilla oculta). Los kobolds no quieren matarlos: quieren ofrecerlos "al que canta" esta medianoche. Hay tiempo para un plan.',
      options: [
        { label: 'Soltarse en silencio y recuperar el equipo', to: 'tuneles', dmNote: 'Combate en los túneles; los kobolds empiezan sorprendidos si superan Sigilo CD 12.' },
        { label: 'Hablar con los kobolds', to: 'santuario', dmNote: 'Alguien que hable dracónico tiene ventaja.' },
      ],
    },
    {
      key: 'tuneles',
      order: 10,
      type: 'combate',
      title: 'Los túneles de la mina',
      ambient: 'dungeon',
      image: `${IMG}/tuneles.jpg`,
      readAloud:
        'Las galerías de la mina vieja se retuercen como intestinos. Hay huellas de garras por todas partes y el suelo está lleno de virutas de metal. Delante, un resplandor anaranjado y el golpeteo rítmico de martillos. Una voz aguda chilla una alarma: os han visto.',
      dmText:
        'Cuatro kobolds defienden la galería de la fundición. Usan una trampa: un tramo de vigas podridas (marcado en el mapa) se hunde con más de 50 kg encima (Destreza CD 12 o caer 3 m, 1d6).\n\nSi el grupo hizo un pacto en el santuario, este combate no ocurre: el DM elige "Victoria" directamente.',
      encounter: { monster: 'Kobold', count: 4, note: 'Trampa de vigas podridas; luchan hasta que caen dos y luego huyen.' },
      map: {
        name: 'Galerías de la mina',
        cols: 20, rows: 12, outside: 'void',
        areas: [
          { id: 'entrada', label: 'Grieta de la cripta', x: 1, y: 5, w: 3, h: 2, floor: 'cave' },
          { id: 'galeria', label: 'Galería', x: 4, y: 4, w: 9, h: 4, floor: 'dirt' },
          { id: 'pozo', label: 'Pozo', x: 8, y: 8, w: 2, h: 3, floor: 'cave' },
          { id: 'fundicion', label: 'Fundición', x: 13, y: 2, w: 6, h: 8, floor: 'cave', hidden: true },
        ],
        features: [
          { kind: 'crate', x: 5, y: 4 },
          { kind: 'crate', x: 6, y: 7 },
          { kind: 'rubble', x: 11, y: 4 },
          { kind: 'fire', x: 16, y: 5 },
          { kind: 'chest', x: 17, y: 8 },
          { kind: 'barrel', x: 14, y: 2 },
          { kind: 'rock', x: 15, y: 9 },
        ],
        dmMarkers: [
          { kind: 'trap', x: 9, y: 5, label: 'Vigas podridas (DES CD 12)' },
          { kind: 'enemy', x: 12, y: 5, label: 'Kobold' },
          { kind: 'enemy', x: 12, y: 6, label: 'Kobold' },
          { kind: 'enemy', x: 15, y: 4, label: 'Kobold' },
          { kind: 'enemy', x: 15, y: 7, label: 'Kobold' },
          { kind: 'treasure', x: 17, y: 8, label: 'Bronce robado + yunque de Dunia' },
        ],
      },
      options: [
        { label: 'Victoria: la galería es vuestra', to: 'campana-huesos' },
        { label: 'Derrota: la oscuridad os traga', to: 'silencio' },
      ],
    },
    {
      key: 'santuario',
      order: 11,
      type: 'decision',
      title: 'El santuario kobold',
      ambient: 'dungeon',
      image: `${IMG}/tuneles.jpg`,
      readAloud:
        'Os llevan ante un kobold viejo, de escamas casi blancas, sentado sobre una pila de cazos abollados. Lleva un collar de llaves. "Yo, Ssnik el Remendador. Vosotros, cara blanda. El que canta abajo es dios dragón. Canta cada noche. Pide bronce. Nosotros damos. Cuando campana esté hecha, él nos llevará arriba, al sol, y nadie más nos echará."',
      dmText:
        'Ssnik no es malvado: su tribu fue expulsada de la mina por los humanos hace dos generaciones. Tiene un dibujo de "su dios" (handout): es claramente Tobías, con el badajo en la mano.\n\nPersuasión CD 13 (ventaja si le enseñan el diario de Tobías o hablan dracónico): Ssnik acepta que el "dios" es un muerto hambriento y les deja pasar; sus kobolds no lucharán. Si fallan, Ssnik se ofende y llama a la guardia.',
      npcs: [
        { name: 'Ssnik el Remendador', role: 'Anciano kobold', voice: 'Siseo suave, frases de tres palabras, se rasca las escamas cuando miente.' },
      ],
      handouts: [
        {
          id: 'dibujo-kobold',
          title: 'Dibujo de Ssnik: "el dios que canta"',
          kind: 'drawing',
          text: '[Un dibujo en carbón sobre una piel curtida: una figura humana encorvada, flaca, con los ojos como dos agujeros y una lengua larga. En la mano levanta un objeto negro con forma de badajo. Alrededor, tres campanas y muchas figuritas pequeñas arrodilladas.]',
        },
      ],
      options: [
        { label: 'Convencer a Ssnik de que su dios es un muerto hambriento', to: 'campana-huesos', setsFlag: 'aliados_kobold', dmNote: 'Persuasión CD 13. Si fallan, elige la otra opción.' },
        { label: 'Romper la negociación y luchar', to: 'tuneles' },
      ],
    },
    {
      key: 'campana-huesos',
      order: 12,
      type: 'decision',
      title: 'La campana de huesos',
      ambient: 'dungeon',
      image: `${IMG}/el-que-tane.jpg`,
      readAloud:
        'La fundición es una caverna alta, caliente como un horno. En el centro cuelga, a medio fundir, una campana enorme hecha de cazos, candelabros y herraduras derretidos. Junto a ella, de espaldas, una figura flaca con la camisa de campanero hecha jirones agarra las tres cuerdas que bajan del techo y tira. Arriba, muy lejos, las campanas de Valdehierro suenan. La figura se gira. Le faltan los labios. En su otra mano, un badajo de hierro negro.',
      dmText:
        'Tobías, convertido en necrófago, no reconoce a nadie. Si alguien le llama por su nombre, duda un turno (no ataca en su primer turno).\n\nEl badajo negro es la fuente de la maldición. Si se destruye (CA 15, 10 PG, solo daño radiante o mágico, o sumergirlo en agua bendita) o se arroja a la fundición, Tobías cae inerte y descansa.',
      options: [
        { label: 'Enfrentarse a Tobías', to: 'el-que-tane' },
        { label: 'Que los kobolds sujeten las cuerdas mientras atacáis', to: 'el-que-tane', requiresFlag: 'aliados_kobold', dmNote: 'Los kobolds lo enredan: Tobías empieza el combate apresado (desventaja en sus ataques la primera ronda).' },
      ],
    },
    {
      key: 'el-que-tane',
      order: 13,
      type: 'combate',
      title: 'El Que Tañe',
      ambient: 'dungeon',
      image: `${IMG}/el-que-tane.jpg`,
      readAloud:
        'Tobías suelta las cuerdas. Las campanas de arriba se callan de golpe. El silencio dura un latido. Luego salta hacia vosotros a cuatro patas, con un chillido que no es humano, y el badajo negro deja en el aire un rastro de escarcha.',
      dmText:
        'Necrófago (Tobías). Sus garras paralizan (CON CD 10). Si el grupo tiene problemas, recuerda que pueden destruir el badajo o tirarlo a la fundición como acción (Atletismo CD 12 para arrebatárselo).\n\nSi Tobías cae, el badajo se agrieta y se vuelve polvo.',
      encounter: { monster: 'Necrófago', count: 1, note: 'Tobías. Garras paralizantes (CON CD 10). El badajo se puede destruir.' },
      map: {
        name: 'La fundición',
        cols: 16, rows: 14, outside: 'void',
        areas: [
          { id: 'acceso', label: 'Acceso', x: 1, y: 6, w: 3, h: 2, floor: 'dirt' },
          { id: 'caverna', label: 'Fundición', x: 4, y: 1, w: 11, h: 12, floor: 'cave' },
        ],
        features: [
          { kind: 'bell', x: 9, y: 6, w: 2, h: 2 },
          { kind: 'fire', x: 12, y: 3 },
          { kind: 'fire', x: 12, y: 10 },
          { kind: 'rock', x: 6, y: 3 },
          { kind: 'rock', x: 6, y: 10 },
          { kind: 'rubble', x: 13, y: 7 },
          { kind: 'crate', x: 5, y: 7 },
        ],
        dmMarkers: [
          { kind: 'enemy', x: 10, y: 8, label: 'Tobías (necrófago)' },
          { kind: 'trap', x: 12, y: 3, label: 'Crisol: 2d6 fuego al caer dentro' },
          { kind: 'trap', x: 12, y: 10, label: 'Crisol: 2d6 fuego al caer dentro' },
        ],
      },
      options: [
        { label: 'Victoria: el badajo se hace polvo', to: 'campanas-callan' },
        { label: 'Derrota: el Que Tañe sigue tañendo', to: 'silencio' },
      ],
    },
    {
      key: 'silencio',
      order: 14,
      type: 'narracion',
      title: 'Silencio en Valdehierro',
      ambient: 'dungeon',
      image: `${IMG}/silencio.jpg`,
      ending: 'defeat',
      readAloud:
        'Despertáis días después en la forja de Dunia, vendados, con fiebre. Un minero os encontró en la boca de la mina. Las campanas siguen sonando cada medianoche, ahora con un cuarto tañido, más grave, que sube desde debajo de la tierra. La mitad del pueblo ya ha hecho el equipaje.',
      dmText:
        'Derrota, pero no el final de la historia. Los personajes sobreviven. Si quieren volver a intentarlo cuando se recuperen, el DM puede reiniciar la aventura desde la escena 12 (la campana ya está terminada: Tobías tiene +10 PG).',
      options: [],
    },
    {
      key: 'campanas-callan',
      order: 15,
      type: 'narracion',
      title: 'Las campanas callan',
      ambient: 'tavern',
      image: `${IMG}/plaza.jpg`,
      ending: 'victory',
      readAloud:
        'Esa medianoche, por primera vez en diez días, Valdehierro duerme. Por la mañana entierran a Tobías en el cementerio de arriba, bajo el sol, y Mirela os pone en la mano la bolsa prometida. Dunia recupera su yunque y jura que os hará algo con él.\n\nAl mediodía llega un carro cargado de cajas con el sello de una cruz verde, y una mujer con capa de viaje pregunta por "la gente que ha callado las campanas". Tiene un encargo urgente en el camino del norte.',
      dmText:
        'Recompensa: 50 po (70 si los personajes devuelven el cuerpo de Tobías para enterrarlo; Mirela lo cuenta como "traerlo de vuelta"). XP: los personajes deberían subir a nivel 2.\n\nSi hicieron un pacto con Ssnik, la tribu kobold pide un lugar en la mina vieja: Mirela acepta a regañadientes, a cambio de que los kobolds trabajen el mineral. Valdehierro tendrá un futuro.\n\nGancho: la mujer es Ilsabet Corvo, mercader de medicinas (ver "El Camino de los Ahorcados").',
      treasure: ['50–70 po del concejo', 'Una herramienta o arma sencilla forjada por Dunia', 'Gratitud de Valdehierro (alojamiento gratis)'],
      options: [],
    },
  ],
};
