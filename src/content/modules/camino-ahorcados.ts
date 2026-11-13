import type { AdventureModule } from './types';
import { MONSTERS } from './monsters';

const IMG = '/modules/camino-ahorcados';

export const caminoAhorcados: AdventureModule = {
  slug: 'camino-ahorcados',
  title: 'El Camino de los Ahorcados',
  subtitle: 'Escolta, bandidos y una decisión difícil',
  level: 2,
  players: '3–5 personajes',
  duration: '3–4 horas',
  accent: '#5a6b3b',
  cover: `${IMG}/portada.jpg`,
  synopsis:
    'Fuenteclara se muere de fiebre gris y el único carro de medicinas en cien leguas tiene que cruzar el camino donde la banda de Rhoswen Garra cuelga espantapájaros con ropa de sus víctimas. La mercader Ilsabet paga bien por llegar. Pero los bandidos también tienen enfermos.',
  monsters: [MONSTERS.lobo, MONSTERS.bandido, MONSTERS.capitanBandido],
  scenes: [
    {
      key: 'encargo',
      order: 1,
      type: 'narracion',
      title: 'El encargo de Ilsabet',
      ambient: 'tavern',
      readAloud:
        'Ilsabet Corvo es menuda, de pelo gris recogido y manos manchadas de tinta. Golpea con los nudillos la lona de su carro: treinta cajas con el sello de la cruz verde. "Corteza de sauce negro, flor de lino, tres arrobas de sal de plata. Es todo lo que he podido comprar. En Fuenteclara la fiebre gris ya se ha llevado a cuarenta. Si esto llega en cuatro días, se salvan doscientos." Deja una bolsa sobre la mesa. "Cien de oro ahora. Cien al llegar. El camino del norte tiene mala fama; no os voy a mentir."',
      dmText:
        'Ilsabet es honrada y testaruda; viaja con el carro (no combate, 9 PG, CA 10). Dos mulas, Pimienta y Canela.\n\nLa "mala fama" es la banda de Rhoswen Garra, que asalta caravanas desde hace un mes. Lo que nadie sabe: la fiebre gris también ha llegado a su campamento, donde viven las familias de los bandidos.',
      npcs: [
        { name: 'Ilsabet Corvo', role: 'Mercader de medicinas', voice: 'Precisa, enumera las cosas con los dedos, no soporta el desperdicio.' },
      ],
      options: [{ label: 'Aceptar y salir al amanecer', to: 'ruta' }],
    },
    {
      key: 'ruta',
      order: 2,
      type: 'decision',
      title: 'La bifurcación',
      ambient: 'forest',
      image: `${IMG}/ruta.jpg`,
      readAloud:
        'Al segundo día el camino se divide junto a un mojón de piedra. A la izquierda sigue el Camino Real, ancho y llano, rodeando el páramo: dos jornadas más. A la derecha se mete en el bosque un sendero estrecho. Alguien ha clavado en el mojón una tabla con letras torcidas: "BOSQUE DE LOS AHORCADOS — ATAJO — BUENA SUERTE". Ilsabet os mira. "Vosotros decidís. Yo solo cuento días."',
      dmText:
        'Camino Real: más largo, lobos en el páramo, pero se llega a la posta abandonada (descanso y pistas). Atajo: un día más rápido, pero es territorio de la banda.\n\nAmbas rutas convergen en el vado del río Turbio, donde Rhoswen ha preparado la emboscada.',
      options: [
        { label: 'Tomar el Camino Real (más largo, más seguro)', to: 'lobos' },
        { label: 'Tomar el atajo por el Bosque de los Ahorcados', to: 'bosque', setsFlag: 'atajo' },
      ],
    },
    {
      key: 'lobos',
      order: 3,
      type: 'combate',
      title: 'Lobos del páramo',
      ambient: 'forest',
      readAloud:
        'El páramo es un mar de brezo que el viento peina. Al caer la tarde, las mulas se plantan y relinchan. Entre la niebla baja aparecen tres sombras grises, luego sus ojos. Los lobos no se acercan de frente: os rodean, sin prisa, buscando el carro.',
      dmText:
        'Tres lobos hambrientos. Van a por las mulas y por Ilsabet (los objetivos más débiles). Si dos lobos caen, el tercero huye.\n\nDerrota: no mueren los personajes; los lobos espantan a una mula y se pierde un tercio de la carga.',
      encounter: { monster: 'Lobo', count: 3, note: 'Táctica de manada, derriban (FUE CD 11). Huyen si caen dos.' },
      map: {
        name: 'Páramo de brezo',
        cols: 20, rows: 14, outside: 'grass',
        areas: [
          { id: 'camino', label: 'Camino Real', x: 0, y: 6, w: 20, h: 2, floor: 'dirt' },
        ],
        features: [
          { kind: 'wagon', x: 9, y: 6, w: 3, h: 2 },
          { kind: 'rock', x: 4, y: 3 },
          { kind: 'rock', x: 15, y: 10 },
          { kind: 'bush', x: 6, y: 10 },
          { kind: 'bush', x: 7, y: 11 },
          { kind: 'bush', x: 14, y: 2 },
          { kind: 'bush', x: 16, y: 3 },
          { kind: 'bush', x: 2, y: 11 },
          { kind: 'rock', x: 18, y: 1 },
        ],
        dmMarkers: [
          { kind: 'enemy', x: 5, y: 2, label: 'Lobo' },
          { kind: 'enemy', x: 16, y: 11, label: 'Lobo' },
          { kind: 'enemy', x: 13, y: 1, label: 'Lobo' },
        ],
      },
      options: [
        { label: 'Victoria: la manada se dispersa', to: 'posta' },
        { label: 'Derrota: los lobos se llevan una mula', to: 'posta', setsFlag: 'carga_perdida' },
      ],
    },
    {
      key: 'posta',
      order: 4,
      type: 'tirada',
      title: 'La posta abandonada',
      ambient: 'tavern',
      readAloud:
        'Al anochecer llegáis a una posta de piedra con el tejado medio hundido. Dentro hay una chimenea, camastros podridos y, en la pared, un cartel clavado con un cuchillo. Por la ventana se ve, a lo lejos, el resplandor de muchas hogueras pequeñas en la colina: demasiadas para una banda de salteadores.',
      dmText:
        'Las hogueras son el campamento de Rhoswen: unas sesenta personas, la mayoría familias. Un personaje que se acerque sigilosamente (Sigilo CD 12) oirá toses secas y niños llorando: la fiebre gris.\n\nUn descanso largo aquí es seguro.',
      checks: [
        { skill: 'Percepción', dc: 11, success: 'Las hogueras están en filas, como un campamento de refugiados, no de guerreros.', failure: 'Muchas hogueras. Mucha gente.' },
        { skill: 'Medicina', dc: 13, success: 'Toses secas, de las que acompañan a la fiebre gris. Allí también hay enfermos.', failure: 'No distinguís nada desde aquí.' },
        { skill: 'Investigación', dc: 10, success: 'Bajo un camastro, una carta a medio quemar (ver handout).', failure: 'Solo polvo y cagarrutas de ratón.' },
      ],
      handouts: [
        {
          id: 'se-busca',
          title: 'Cartel en la pared',
          kind: 'poster',
          text: 'SE BUSCA\n\nRHOSWEN «GARRA»\nantes Rhoswen Alder, sargento de la\nGuardia del Paso\n\nAsalto a caravanas, robo y deserción.\n\n200 MONEDAS DE ORO\nviva\n\nPor orden del Señor de Fuenteclara',
        },
        {
          id: 'carta-quemada',
          title: 'Carta a medio quemar',
          kind: 'letter',
          text: '...el Señor nos echó del Paso cuando cerró la mina, a todos, con los críos. Dijo que no había grano para bocas que no trabajan.\n\nLlevamos un mes robando para comer. Ahora han empezado las toses. Si no conseguimos corteza de sauce negro, Rhoswen dice que...\n\n[el resto está quemado]',
        },
      ],
      options: [
        { label: 'Descansar y seguir hacia el vado al amanecer', to: 'vado' },
      ],
    },
    {
      key: 'bosque',
      order: 5,
      type: 'tirada',
      title: 'El Bosque de los Ahorcados',
      ambient: 'forest',
      image: `${IMG}/bosque.jpg`,
      readAloud:
        'Las ramas se cierran sobre el sendero. De ellas cuelgan, con sogas, figuras vestidas con ropa de viajero: jubones, capas, un vestido azul. Se balancean con el viento. Cuando os acercáis veis que son espantapájaros rellenos de paja, con caras de saco pintadas. Uno lleva un cartel: "PAGAD Y PASAD".',
      dmText:
        'Los espantapájaros son una advertencia, no víctimas reales. El sendero tiene trampas de lazo para ralentizar caravanas.',
      checks: [
        { skill: 'Supervivencia', dc: 13, success: 'Detectáis los lazos y una zanja tapada con ramas. El carro pasa sin daño.', failure: 'Una rueda cae en una zanja: media jornada perdida y 1d6 de daño a quien empujaba.' },
        { skill: 'Percepción', dc: 14, success: 'Un vigía bandido os observa desde un árbol y sale corriendo hacia el río.', failure: 'Os sentís observados, pero no veis a nadie.' },
      ],
      options: [{ label: 'Salir del bosque hacia el vado del río Turbio', to: 'vado' }],
    },
    {
      key: 'vado',
      order: 6,
      type: 'combate',
      title: 'Emboscada en el vado',
      ambient: 'forest',
      image: `${IMG}/bosque.jpg`,
      readAloud:
        'El río Turbio baja crecido y marrón. El vado es la única forma de cruzar con el carro. Cuando las mulas tienen ya el agua por las rodillas, cae un tronco atravesado en la orilla de enfrente y cuatro figuras con pañuelos en la cara salen de los juncos con las ballestas tensas. "¡El carro y las mulas, y nadie se moja más de la cuenta!"',
      dmText:
        'Cuatro bandidos. No quieren matar: si un personaje cae, lo dejan en paz y van a por el carro. Si dos bandidos caen, el resto se rinde.\n\nEl agua del vado es terreno difícil. Un personaje derribado en el agua debe superar Atletismo CD 10 o ser arrastrado 3 m río abajo.',
      encounter: { monster: 'Bandido', count: 4, note: 'Se rinden si caen dos. No rematan a nadie.' },
      map: {
        name: 'Vado del río Turbio',
        cols: 20, rows: 14, outside: 'grass',
        areas: [
          { id: 'rio', label: 'Río Turbio', x: 7, y: 0, w: 6, h: 14, floor: 'water' },
          { id: 'vado', label: 'Vado', x: 7, y: 6, w: 6, h: 2, floor: 'dirt' },
          { id: 'orilla-este', label: 'Juncal', x: 13, y: 3, w: 4, h: 8, floor: 'grass', hidden: true },
        ],
        features: [
          { kind: 'wagon', x: 8, y: 6, w: 3, h: 2 },
          { kind: 'tree', x: 3, y: 2 },
          { kind: 'tree', x: 2, y: 10 },
          { kind: 'tree', x: 17, y: 1 },
          { kind: 'tree', x: 18, y: 12 },
          { kind: 'bush', x: 14, y: 4 },
          { kind: 'bush', x: 15, y: 9 },
          { kind: 'rock', x: 13, y: 7 },
          { kind: 'rubble', x: 13, y: 6 },
        ],
        dmMarkers: [
          { kind: 'enemy', x: 14, y: 5, label: 'Bandido (ballesta)' },
          { kind: 'enemy', x: 15, y: 8, label: 'Bandido (ballesta)' },
          { kind: 'enemy', x: 14, y: 7, label: 'Bandido' },
          { kind: 'enemy', x: 16, y: 6, label: 'Bandido' },
          { kind: 'trap', x: 13, y: 6, label: 'Tronco atravesado (bloquea el paso)' },
        ],
      },
      options: [
        { label: 'Victoria: los bandidos se rinden', to: 'interrogatorio', setsFlag: 'prisionero_bandido' },
        { label: 'Derrota: os desarman y os llevan', to: 'prisioneros' },
      ],
    },
    {
      key: 'interrogatorio',
      order: 7,
      type: 'decision',
      title: 'El interrogatorio',
      ambient: 'forest',
      image: `${IMG}/bosque.jpg`,
      readAloud:
        'El bandido que habéis atrapado se quita el pañuelo. Es un chaval de apenas dieciséis años, con la nariz rota y los ojos rojos de fiebre. "No queríamos el oro. Queríamos la corteza. Mi hermana pequeña lleva cinco días tosiendo sangre." Escupe al barro. "Rhoswen dijo que si llegaba otro carro de la cruz verde lo cogeríamos, aunque fuera a la fuerza. Está en la colina con todos los demás."',
      dmText:
        'El chaval se llama Bran. No miente (Perspicacia CD 10 lo confirma). Ilsabet duda: "Si reparto la carga, no llega para Fuenteclara." Un personaje con Medicina CD 12 calcula que, racionando, hay dosis para los dos sitios si nadie más pierde carga.\n\nSi el grupo perdió una mula en el páramo (carga_perdida), no hay suficiente para todos: alguien tendrá que elegir.',
      npcs: [
        { name: 'Bran', role: 'Bandido de 16 años', voice: 'Orgulloso y asustado a la vez; se le quiebra la voz al hablar de su hermana.' },
      ],
      options: [
        { label: 'Ir al campamento a negociar con Rhoswen', to: 'campamento' },
        { label: 'Ir al campamento a acabar con la banda', to: 'duelo', dmNote: 'Atacan el campamento: Rhoswen sale a recibirlos sola para proteger a los suyos.' },
        { label: 'Dejar a Bran atado y seguir directos a Fuenteclara', to: 'puertas' },
      ],
    },
    {
      key: 'prisioneros',
      order: 8,
      type: 'narracion',
      title: 'Prisioneros de Rhoswen',
      ambient: 'forest',
      image: `${IMG}/campamento.jpg`,
      readAloud:
        'Os llevan con las manos atadas a una colina llena de tiendas remendadas. No hay botín ni barriles de vino: hay ancianos al sol, niños con mantas y una tienda grande de la que salen toses. Una mujer alta con la armadura de la Guardia del Paso, sin escudo ni insignias, os mira largo rato. "Soy Rhoswen. Sé lo que pone en el cartel. Ahora mirad a vuestro alrededor y decidme quién es aquí el bandido."',
      dmText:
        'Rhoswen no quiere matarlos. Los ha traído porque necesita que alguien hable con Fuenteclara en su nombre. Devuelve el equipo si la escuchan.',
      npcs: [
        { name: 'Rhoswen Garra', role: 'Capitana bandida, antigua sargento', voice: 'Voz de mando, baja y lenta. Nunca levanta la voz. Cansadísima.' },
      ],
      options: [{ label: 'Escuchar a Rhoswen', to: 'campamento' }],
    },
    {
      key: 'campamento',
      order: 9,
      type: 'decision',
      title: 'El campamento de Garra',
      ambient: 'forest',
      image: `${IMG}/campamento.jpg`,
      readAloud:
        'Rhoswen os sienta junto al fuego de la tienda de los enfermos. "El Señor de Fuenteclara cerró la mina del Paso y nos echó a todos en invierno. Sesenta personas. He robado para que coman, y robaré para que vivan. Pero no soy una asesina." Mira el carro. "Dadme la mitad de esa corteza y os dejo pasar. Y si además le decís al Señor lo que habéis visto aquí, os deberé algo que no se paga con oro."',
      dmText:
        'Ilsabet acepta compartir si los personajes la convencen (Persuasión CD 12, ventaja si leyeron la carta quemada o hablaron con Bran). Con carga_perdida, la CD sube a 15: ella sabe que no llega para todos.\n\nSi exigen la rendición de Rhoswen, ella se niega y pide un duelo singular para no poner en peligro a las familias.',
      options: [
        { label: 'Compartir la medicina con el campamento', to: 'pacto', setsFlag: 'pacto_rhoswen', dmNote: 'Persuasión CD 12 (15 con carga perdida) para convencer a Ilsabet.' },
        { label: 'Exigir la rendición de Rhoswen', to: 'duelo' },
      ],
    },
    {
      key: 'duelo',
      order: 10,
      type: 'combate',
      title: 'Duelo con la Capitana',
      ambient: 'forest',
      image: `${IMG}/campamento.jpg`,
      readAloud:
        'Rhoswen se ata el pelo, desenvaina dos cimitarras y camina hasta el centro del claro. Detrás de ella, la gente del campamento mira en silencio. "Si gano, el carro se queda. Si gano, nadie más sale herido." Alza una hoja. "Venid todos. No me importa."',
      dmText:
        'Capitán bandido (Rhoswen). Pelea con honor y no remata a nadie que caiga. Si baja a 15 PG o menos, se rinde y suelta las armas.\n\nSi la derrotan, el campamento no se resiste. Rhoswen pide, como única condición, que sus familias no paguen por ella.',
      encounter: { monster: 'Capitán bandido', count: 1, note: 'Rhoswen. Se rinde a 15 PG. Parada (+2 CA, reacción).' },
      map: {
        name: 'Claro del campamento',
        cols: 18, rows: 14, outside: 'grass',
        areas: [
          { id: 'claro', label: 'Claro', x: 4, y: 3, w: 10, h: 8, floor: 'dirt' },
        ],
        features: [
          { kind: 'tent', x: 1, y: 1, w: 2, h: 2 },
          { kind: 'tent', x: 15, y: 1, w: 2, h: 2 },
          { kind: 'tent', x: 1, y: 11, w: 2, h: 2 },
          { kind: 'tent', x: 15, y: 11, w: 2, h: 2 },
          { kind: 'fire', x: 9, y: 7 },
          { kind: 'crate', x: 5, y: 4 },
          { kind: 'barrel', x: 12, y: 9 },
          { kind: 'tree', x: 8, y: 0 },
          { kind: 'tree', x: 9, y: 13 },
        ],
        dmMarkers: [
          { kind: 'enemy', x: 10, y: 6, label: 'Rhoswen' },
          { kind: 'npc', x: 15, y: 2, label: 'Tienda de los enfermos' },
        ],
      },
      options: [
        { label: 'Victoria: Rhoswen se rinde', to: 'puertas', setsFlag: 'rhoswen_derrotada' },
        { label: 'Derrota: la banda se queda el carro', to: 'medicina-perdida' },
      ],
    },
    {
      key: 'pacto',
      order: 11,
      type: 'narracion',
      title: 'Un pacto en el barro',
      ambient: 'forest',
      image: `${IMG}/campamento.jpg`,
      readAloud:
        'Ilsabet abre seis cajas con las manos temblando y enseña a dos mujeres del campamento a preparar la infusión. Esa noche, por primera vez en semanas, la tienda de los enfermos duerme. Rhoswen os acompaña hasta el límite del bosque. Se quita de la muñeca un brazalete de bronce con el emblema de la Guardia del Paso. "Enseñadle esto al Señor. Sabrá de quién viene. Y si quiere colgarme, que venga a buscarme él."',
      dmText:
        'El brazalete de Rhoswen es la prueba que permitirá abogar por el campamento en Fuenteclara. Bran, si sigue con el grupo, se queda con su hermana.',
      treasure: ['Brazalete de la Guardia del Paso (prueba)'],
      options: [{ label: 'Seguir hacia Fuenteclara', to: 'puertas' }],
    },
    {
      key: 'puertas',
      order: 12,
      type: 'decision',
      title: 'Las puertas de Fuenteclara',
      ambient: 'tavern',
      image: `${IMG}/puertas.jpg`,
      readAloud:
        'Las campanas de Fuenteclara tocan a muerto cuando el carro cruza la puerta. Las calles huelen a vinagre y humo de hierbas. Un capitán de la guardia con un pañuelo en la boca os para: "¿La cruz verde? ¡Gracias a los dioses!" Detrás de él, desde un balcón del castillo, un hombre grueso con capa de armiño observa el carro. Es el Señor de Fuenteclara.',
      dmText:
        'Si el grupo trae el brazalete de Rhoswen (pacto_rhoswen), puede abogar por el campamento ante el Señor (Persuasión CD 13, ventaja si Ilsabet les apoya, que lo hará). Si Rhoswen fue derrotada, el Señor exige que se la entreguen para colgarla.',
      npcs: [
        { name: 'Señor Aldric de Fuenteclara', role: 'Noble local', voice: 'Pomposo, habla en plural mayestático, se ablanda con los números y las deudas.' },
      ],
      options: [
        { label: 'Entregar la medicina y cobrar', to: 'fuenteclara' },
        { label: 'Pedir clemencia y trabajo para la gente del Paso', to: 'nuevo-comienzo', requiresFlag: 'pacto_rhoswen', dmNote: 'Persuasión CD 13 con ventaja.' },
      ],
    },
    {
      key: 'medicina-perdida',
      order: 13,
      type: 'narracion',
      title: 'La medicina perdida',
      ambient: 'forest',
      image: `${IMG}/bosque.jpg`,
      ending: 'defeat',
      readAloud:
        'Despertáis en el bosque, atados a un árbol con nudos flojos, a propósito. El carro no está. A vuestros pies, alguien ha dejado vuestras armas, un odre de agua y una nota escrita con carbón: "Lo siento. Mis niños primero." Ilsabet llora sin hacer ruido.',
      dmText:
        'Derrota. Fuenteclara sufrirá, y la reputación de los personajes también. Pero Rhoswen no ha matado a nadie, y los personajes saben dónde está el campamento: una aventura de seguimiento puede tratar de recuperar lo que quede de la carga o de mediar a la desesperada.',
      options: [],
    },
    {
      key: 'fuenteclara',
      order: 14,
      type: 'narracion',
      title: 'Fuenteclara respira',
      ambient: 'tavern',
      image: `${IMG}/puertas.jpg`,
      ending: 'neutral',
      readAloud:
        'En tres días las toses se apagan en Fuenteclara. Ilsabet os paga lo prometido y una ronda en cada taberna de la ciudad. El Señor os recibe y os da las gracias en plural. Pero cuando de noche miráis hacia el norte, la colina donde ardían las hogueras del Paso está a oscuras.',
      dmText:
        'Final ambiguo. Recompensa: 100 po más de Ilsabet; si entregaron a Rhoswen, 200 po de la recompensa del cartel. XP: subida a nivel 3.\n\nGancho: un astrónomo ha enviado un mensaje urgente al Señor: "Ha caído una estrella en la Torre de Oriel."',
      treasure: ['100 po (Ilsabet)', '200 po si entregan a Rhoswen'],
      options: [],
    },
    {
      key: 'nuevo-comienzo',
      order: 15,
      type: 'narracion',
      title: 'Un nuevo comienzo',
      ambient: 'tavern',
      image: `${IMG}/puertas.jpg`,
      ending: 'victory',
      readAloud:
        'El Señor de Fuenteclara gira el brazalete entre los dedos un buen rato. "Esta mujer nos debe muchas monedas", dice al fin. "Y nosotros le debemos una mina que reabrir. Que venga a trabajarla, ella y los suyos." Una semana después veis pasar por el camino del norte una columna de carros con familias, y al frente, con su vieja armadura limpia, a Rhoswen. Os saluda con la mano en alto.',
      dmText:
        'El mejor final. Recompensa: 100 po de Ilsabet y el favor de Rhoswen (una aliada leal con contactos en todo el norte). Ilsabet os ofrece trabajo fijo como escoltas. XP: subida a nivel 3.\n\nGancho: un astrónomo ha enviado un mensaje urgente al Señor: "Ha caído una estrella en la Torre de Oriel."',
      treasure: ['100 po (Ilsabet)', 'Favor de Rhoswen Garra', 'Alojamiento gratis en Fuenteclara'],
      options: [],
    },
  ],
};
