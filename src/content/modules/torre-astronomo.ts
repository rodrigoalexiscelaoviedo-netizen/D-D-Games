import type { AdventureModule } from './types';
import { MONSTERS } from './monsters';

const IMG = '/modules/torre-astronomo';

export const torreAstronomo: AdventureModule = {
  slug: 'torre-astronomo',
  title: 'La Torre del Astrónomo Ciego',
  subtitle: 'Mazmorra arcana con acertijo estelar',
  level: 3,
  players: '3–5 personajes',
  duration: '3–4 horas',
  accent: '#3b4a7c',
  cover: `${IMG}/portada.jpg`,
  synopsis:
    'Hace un mes cayó una estrella sobre la Torre de Oriel. Desde entonces, la torre brilla de noche, sus guardianes se mueven solos y el astrónomo Velkan Oriel no responde. Dicen que se arrancó los ojos para ver mejor el cielo. Dentro, una piedra caída del firmamento late como un corazón.',
  monsters: [MONSTERS.armaduraAnimada, MONSTERS.esqueleto, MONSTERS.gargola],
  scenes: [
    {
      key: 'estrella',
      order: 1,
      type: 'narracion',
      title: 'La estrella que cayó',
      ambient: 'forest',
      image: `${IMG}/estrella.jpg`,
      readAloud:
        'La torre se levanta sola en lo alto de un cerro pelado, delgada como una aguja. La mitad superior está reventada, como si algo la hubiera atravesado desde el cielo, y por las grietas sale una luz azul que no proyecta sombras. A su alrededor la hierba está quemada en círculos perfectos. En el aire, muy bajo, se oye un zumbido parecido al de un enjambre, o a una voz que canta muy lejos.',
      dmText:
        'Velkan Oriel, astrónomo y mago menor, llevaba años obsesionado con "la Lágrima", un meteorito que según sus cálculos caería sobre su torre. Cuando cayó, la Lágrima Estelar despertó a los guardianes de la torre y reanimó los huesos de sus aprendices, muertos en el impacto. Velkan sobrevivió, se cegó a sí mismo al mirarla, y ahora la "oye" hablar. Cree que la Lágrima le enseñará a ver el futuro.\n\nLa Lágrima no es malvada: es una fuente de energía arcana sin voluntad, pero amplifica las obsesiones de quien la toca.',
      dmTips: [
        'Describe la luz azul en cada escena: cambia de intensidad como una respiración.',
        'Velkan puede hablar a través de los tubos de latón de la torre ("tubos parlantes") desde cualquier escena.',
      ],
      options: [{ label: 'Subir el cerro hasta la torre', to: 'pie-torre' }],
    },
    {
      key: 'pie-torre',
      order: 2,
      type: 'decision',
      title: 'Al pie de la torre',
      ambient: 'forest',
      image: `${IMG}/estrella.jpg`,
      readAloud:
        'La puerta principal es de roble con remaches de bronce y está entreabierta. Encima, grabado en la piedra: "QUIEN MIRA ARRIBA NO TROPIEZA". A doce metros de altura, una ventana del observatorio ha perdido sus cristales; la hiedra quemada sube hasta ella. De un tubo de latón junto a la puerta sale una voz ronca: "¿Visitas? No... no las esperaba. Ella no me ha dicho que vendríais. Subid. Subid y mirad."',
      dmText:
        'Velkan habla por los tubos parlantes. No es hostil, pero tampoco desactiva a los guardianes (no puede: obedecen a la Lágrima).\n\nPuerta principal: vestíbulo con armaduras animadas. Ventana: Atletismo CD 13 para trepar por la hiedra (un fallo por 5 o más es una caída de 1d6 por cada 3 m subidos, máx. 4d6); entra directamente al observatorio, saltándose dos combates.',
      npcs: [
        { name: 'Velkan Oriel', role: 'Astrónomo ciego', voice: 'Susurra y se interrumpe para escuchar algo que nadie más oye. Muy educado.' },
      ],
      options: [
        { label: 'Entrar por la puerta principal', to: 'vestibulo' },
        { label: 'Trepar por la hiedra hasta el observatorio', to: 'observatorio', setsFlag: 'por_ventana', dmNote: 'Atletismo CD 13. Si fallan todos, que entren por la puerta.' },
      ],
    },
    {
      key: 'vestibulo',
      order: 3,
      type: 'combate',
      title: 'El vestíbulo de las armaduras',
      ambient: 'dungeon',
      image: `${IMG}/vestibulo.jpg`,
      readAloud:
        'El vestíbulo es redondo, con un suelo de mosaico que dibuja el cielo nocturno. Dos armaduras completas montan guardia a ambos lados de la escalera. Cuando el primero de vosotros pisa la estrella central del mosaico, las viseras se iluminan de azul por dentro y las armaduras dan un paso al frente con un chirrido de metal.',
      dmText:
        'Dos armaduras animadas. Se activan al pisar el mosaico central. No suben escaleras más allá del primer rellano: si el grupo huye escaleras arriba, el combate termina (cuenta como victoria, pero el vestíbulo queda bloqueado para salir).',
      encounter: { monster: 'Armadura animada', count: 2, note: 'No pasan del primer rellano. CA 18: recomienda maniobras y ataques mágicos.' },
      map: {
        name: 'Vestíbulo de la torre',
        cols: 14, rows: 14, outside: 'void',
        areas: [
          { id: 'vestibulo', label: 'Vestíbulo', x: 2, y: 2, w: 10, h: 10, floor: 'tile' },
          { id: 'escalera', label: 'Escalera', x: 5, y: 0, w: 4, h: 2, floor: 'stone' },
        ],
        features: [
          { kind: 'statue', x: 4, y: 3 },
          { kind: 'statue', x: 9, y: 3 },
          { kind: 'stairs', x: 5, y: 0, w: 4, h: 2 },
          { kind: 'door', x: 6, y: 11 },
          { kind: 'pillar', x: 2, y: 2 },
          { kind: 'pillar', x: 11, y: 2 },
          { kind: 'pillar', x: 2, y: 11 },
          { kind: 'pillar', x: 11, y: 11 },
        ],
        dmMarkers: [
          { kind: 'trap', x: 6, y: 6, label: 'Estrella del mosaico (activa a los guardianes)' },
          { kind: 'enemy', x: 4, y: 3, label: 'Armadura animada' },
          { kind: 'enemy', x: 9, y: 3, label: 'Armadura animada' },
        ],
      },
      options: [
        { label: 'Victoria: las armaduras se desploman', to: 'biblioteca' },
        { label: 'Derrota: el metal os aplasta', to: 'polvo' },
      ],
    },
    {
      key: 'biblioteca',
      order: 4,
      type: 'tirada',
      title: 'La biblioteca de las constelaciones',
      ambient: 'dungeon',
      image: `${IMG}/biblioteca.jpg`,
      readAloud:
        'La segunda planta es una biblioteca circular, con estanterías hasta el techo y escaleras con ruedas. En el centro, sobre un atril, hay un gran mapa celeste de pergamino con siete agujeros. La puerta hacia la escalera superior está sellada con una placa de bronce que tiene siete clavijas con forma de estrella. En la placa se lee: "ORDENA EL CIELO COMO LO VIO EL CIEGO".',
      dmText:
        'ACERTIJO: el mapa celeste (handout) muestra siete estrellas con nombre. Hay que pulsar las clavijas en el orden en que salen por el horizonte en la noche de la caída: el texto del margen lo dice ("la que nace primero es la que más tarde muere").\n\nSolución: de más pequeña a más grande según el número entre paréntesis del handout → Ojo, Hilo, Rueca, Corona, Arpa, Lanza, Lágrima.\n\nSi resuelven el acertijo, la puerta se abre y además descubren cómo "desafinar" la Lágrima (desventaja para la gárgola). Si fuerzan la puerta (Fuerza CD 15), salta una descarga: 2d6 de relámpago al que empuja.',
      checks: [
        { skill: 'Arcanos', dc: 14, success: 'El orden es por magnitud: las clavijas brillan más cuanto más tarde deben pulsarse.', failure: 'Las estrellas os resultan desconocidas.' },
        { skill: 'Investigación', dc: 12, success: 'Un libro abierto en el suelo tiene subrayada la frase "la que nace primero es la que más tarde muere".', failure: 'Demasiados libros, ninguna pista clara.' },
      ],
      handouts: [
        {
          id: 'mapa-celeste',
          title: 'Mapa celeste de Velkan',
          kind: 'drawing',
          text: 'Siete estrellas rodean un círculo vacío. Junto a cada una, su nombre y un número pequeño entre paréntesis:\n\n✦ La Corona (4)\n✦ El Ojo (1)\n✦ La Lanza (6)\n✦ La Rueca (3)\n✦ La Lágrima (7)\n✦ El Hilo (2)\n✦ El Arpa (5)\n\nNota al margen, con letra temblorosa:\n"La que nace primero es la que más tarde muere. La última en salir fue la que cayó."',
          signature: 'V. O.',
        },
      ],
      options: [
        { label: 'Resolver el acertijo de las estrellas', to: 'aprendices', setsFlag: 'acertijo_resuelto', dmNote: 'Orden: Ojo, Hilo, Rueca, Corona, Arpa, Lanza, Lágrima.' },
        { label: 'Forzar la puerta sellada', to: 'aprendices', dmNote: '2d6 de relámpago al que empuja (Fuerza CD 15).' },
      ],
    },
    {
      key: 'aprendices',
      order: 5,
      type: 'combate',
      title: 'Los aprendices',
      ambient: 'dungeon',
      image: `${IMG}/observatorio.jpg`,
      readAloud:
        'La tercera planta fue un taller: mesas de trabajo, astrolabios a medio montar, lentes rotas por el suelo. Cuatro esqueletos con túnicas de aprendiz, chamuscadas, siguen inclinados sobre las mesas como si trabajaran. Cuando entráis, se enderezan a la vez. Sus cuencas se encienden de azul. Uno de ellos todavía sujeta una pluma.',
      dmText:
        'Cuatro esqueletos (los aprendices de Velkan, muertos en el impacto). Dos usan arcos cortos desde el fondo. Vulnerables al daño contundente.\n\nSi un personaje pronuncia el nombre de uno de ellos (los nombres están en el diario del observatorio, si lo leyeron), ese esqueleto se detiene un turno.',
      encounter: { monster: 'Esqueleto', count: 4, note: 'Dos con arco al fondo. Vulnerables a contundente.' },
      map: {
        name: 'Taller de los aprendices',
        cols: 14, rows: 14, outside: 'void',
        areas: [
          { id: 'taller', label: 'Taller', x: 1, y: 1, w: 12, h: 12, floor: 'wood' },
        ],
        features: [
          { kind: 'table', x: 3, y: 3, w: 3, h: 1 },
          { kind: 'table', x: 8, y: 3, w: 3, h: 1 },
          { kind: 'table', x: 3, y: 9, w: 3, h: 1 },
          { kind: 'table', x: 8, y: 9, w: 3, h: 1 },
          { kind: 'bookshelf', x: 1, y: 6, w: 1, h: 3 },
          { kind: 'bookshelf', x: 12, y: 6, w: 1, h: 3 },
          { kind: 'telescope', x: 6, y: 6 },
          { kind: 'stairs', x: 6, y: 1, w: 2, h: 1 },
          { kind: 'rubble', x: 10, y: 6 },
        ],
        dmMarkers: [
          { kind: 'enemy', x: 4, y: 4, label: 'Esqueleto' },
          { kind: 'enemy', x: 9, y: 4, label: 'Esqueleto' },
          { kind: 'enemy', x: 4, y: 2, label: 'Esqueleto (arco)' },
          { kind: 'enemy', x: 10, y: 2, label: 'Esqueleto (arco)' },
        ],
      },
      options: [
        { label: 'Victoria: los huesos se apagan', to: 'camara' },
        { label: 'Derrota: caéis bajo las flechas', to: 'polvo' },
      ],
    },
    {
      key: 'observatorio',
      order: 6,
      type: 'tirada',
      title: 'El observatorio en ruinas',
      ambient: 'dungeon',
      image: `${IMG}/observatorio.jpg`,
      readAloud:
        'Entráis por la ventana a una sala abierta al cielo: el techo cónico ha desaparecido y solo quedan vigas retorcidas. El gran telescopio de latón está partido en dos. El suelo está cubierto de cristales y de páginas sueltas que el viento mueve en círculos. Una escalera de caracol baja hacia una luz azul que late.',
      dmText:
        'Entre las páginas está el diario de Velkan (handout). Leerlo revela que Velkan sabe, en el fondo, que la Lágrima le está consumiendo, y da los nombres de sus aprendices.\n\nSi el grupo llega aquí por la ventana, se salta el vestíbulo y el taller.',
      checks: [
        { skill: 'Investigación', dc: 11, success: 'Reunís las páginas del diario en orden.', failure: 'Solo rescatáis fragmentos sueltos (lee al grupo únicamente la última línea del handout).' },
        { skill: 'Arcanos', dc: 13, success: 'La luz de abajo pulsa al ritmo de un hechizo de animación: los guardianes dependen de ella.', failure: 'Luz mágica, potente, desconocida.' },
      ],
      handouts: [
        {
          id: 'diario-velkan',
          title: 'Diario de Velkan Oriel',
          kind: 'note',
          text: 'Noche 1. Cayó. Exactamente donde dije. Mis aprendices, Ione, Barro, Tess y el pequeño Mael, estaban en el taller. No los avisé a tiempo.\n\nNoche 3. La miré sin protección. Ahora la luz me quema por dentro de los párpados. Dentro de la luz hay mañanas.\n\nNoche 9. Me he quitado los ojos. Ya no los necesito. Ella me enseña.\n\nNoche 20. Los chicos vuelven a trabajar en el taller. Ella dice que es un regalo. Yo sé que no lo es.\n\nSi alguien encuentra esto: no la toquéis. Romped la Lágrima. Y perdonadme por no ser capaz de hacerlo yo.',
          signature: 'Velkan',
        },
      ],
      options: [
        { label: 'Bajar hacia la luz azul', to: 'camara', setsFlag: 'diario_velkan' },
      ],
    },
    {
      key: 'camara',
      order: 7,
      type: 'decision',
      title: 'La cámara de la Lágrima',
      ambient: 'dungeon',
      image: `${IMG}/camara.jpg`,
      readAloud:
        'En el corazón de la torre hay un cráter. En su centro flota, a un palmo del suelo, una piedra del tamaño de una cabeza, lisa y negra, con vetas de luz azul que laten. Junto a ella, sentado en el borde del cráter, un anciano con una venda manchada sobre los ojos sonríe hacia vosotros sin veros. "Ella dice que vais a romperla. Yo le he dicho que no os dejaré." Detrás de él, una gárgola de piedra que no estaba ahí hace un momento despliega las alas.',
      dmText:
        'Velkan no lucha; solo habla. La gárgola es el guardián de la Lágrima. Opciones:\n• Romper la Lágrima: la gárgola ataca.\n• Convencer a Velkan (requiere haber leído su diario): Persuasión CD 12 citando sus propias palabras. Velkan ordena a la Lágrima que se apague y la gárgola se convierte en estatua.\n• Robar la Lágrima: tocarla exige salvación de SAB CD 13 o quedar fascinado (ver escena de la codicia).\n• Con el acertijo resuelto: el grupo sabe "desafinarla" pulsando las siete notas en orden inverso; la gárgola lucha con desventaja.',
      options: [
        { label: 'Romper la Lágrima Estelar', to: 'guardian' },
        { label: 'Desafinar la Lágrima con la secuencia de las estrellas y luchar', to: 'guardian', requiresFlag: 'acertijo_resuelto', dmNote: 'La gárgola tiene desventaja en todos sus ataques.' },
        { label: 'Convencer a Velkan con las palabras de su diario', to: 'ver-sin-ojos', requiresFlag: 'diario_velkan', dmNote: 'Persuasión CD 12. Si fallan, la gárgola ataca: elige "Romper la Lágrima".' },
        { label: 'Intentar llevarse la Lágrima', to: 'codicia' },
      ],
    },
    {
      key: 'guardian',
      order: 8,
      type: 'combate',
      title: 'El guardián de piedra',
      ambient: 'dungeon',
      image: `${IMG}/guardian.jpg`,
      readAloud:
        'La gárgola se lanza desde el borde del cráter con un rugido que suena como piedras partiéndose. Sus ojos son dos astillas de la misma luz azul que late en la Lágrima. Velkan grita algo, pero el estruendo lo ahoga.',
      dmText:
        'Gárgola. Resiste daño no mágico: si el grupo no tiene armas mágicas, la Lágrima se puede atacar directamente (CA 12, 20 PG; al romperse, la gárgola se convierte en estatua al instante).\n\nVelkan, si recibe daño de área, cae inconsciente; si muere, el final es más amargo.',
      encounter: { monster: 'Gárgola', count: 1, note: 'Resiste daño no mágico. Romper la Lágrima (CA 12, 20 PG) la petrifica.' },
      map: {
        name: 'Cámara de la Lágrima',
        cols: 16, rows: 16, outside: 'void',
        areas: [
          { id: 'anillo', label: 'Cámara', x: 1, y: 1, w: 14, h: 14, floor: 'stone' },
          { id: 'crater', label: 'Cráter', x: 5, y: 5, w: 6, h: 6, floor: 'cave' },
        ],
        features: [
          { kind: 'altar', x: 7, y: 7, w: 2, h: 2 },
          { kind: 'rubble', x: 3, y: 4 },
          { kind: 'rubble', x: 12, y: 11 },
          { kind: 'pillar', x: 3, y: 12 },
          { kind: 'pillar', x: 12, y: 3 },
          { kind: 'stairs', x: 1, y: 7, w: 1, h: 2 },
        ],
        dmMarkers: [
          { kind: 'treasure', x: 8, y: 8, label: 'La Lágrima (CA 12, 20 PG)' },
          { kind: 'enemy', x: 10, y: 5, label: 'Gárgola' },
          { kind: 'npc', x: 5, y: 9, label: 'Velkan' },
        ],
      },
      options: [
        { label: 'Victoria: la Lágrima se apaga', to: 'torre-apaga' },
        { label: 'Derrota: la piedra vence', to: 'polvo' },
      ],
    },
    {
      key: 'codicia',
      order: 9,
      type: 'narracion',
      title: 'La codicia',
      ambient: 'dungeon',
      image: `${IMG}/camara.jpg`,
      readAloud:
        'En cuanto la mano se cierra sobre la piedra, el mundo se llena de mañanas: os veis ricos, coronados, viejos, muertos, todo a la vez. La torre entera tiembla. Velkan se pone en pie, aterrado. "¡No es vuestra! ¡No es de nadie!" La gárgola ya está en el aire.',
      dmText:
        'El personaje que tocó la Lágrima: salvación de SAB CD 13 o fascinado (no puede atacar a la gárgola durante 1 ronda y se niega a soltar la piedra). La gárgola ataca: lleva al combate.',
      options: [{ label: 'Defenderse del guardián', to: 'guardian', setsFlag: 'lagrima_tocada' }],
    },
    {
      key: 'ver-sin-ojos',
      order: 10,
      type: 'narracion',
      title: 'Ver sin ojos',
      ambient: 'forest',
      image: `${IMG}/estrella.jpg`,
      ending: 'victory',
      readAloud:
        'Velkan escucha sus propias palabras en vuestra boca y se le doblan las rodillas. "Ione, Barro, Tess, Mael", murmura. Pone las dos manos sobre la Lágrima. "Ya basta. Ya he visto bastante." La luz azul se encoge, se encoge, y se apaga como una vela. La gárgola se queda quieta a medio salto, otra vez de piedra. En el silencio, el viejo llora sin ojos. Por la brecha del techo se ve, por primera vez en un mes, un cielo normal lleno de estrellas.',
      dmText:
        'El mejor final. La Lágrima, apagada, es una piedra negra muy pesada (vale 500 po para un coleccionista, o puede ser el núcleo de un objeto mágico en el futuro). Velkan entrega al grupo su bastón y su anillo, y les pide que entierren a sus aprendices.\n\nXP: subida a nivel 4. Recompensa del Señor de Fuenteclara: 300 po.',
      treasure: ['Lágrima Estelar apagada (500 po o componente mágico)', 'Bastón de Velkan (foco arcano)', 'Anillo de Velkan: una vez al día, conjuro Luz sin componentes', '300 po del Señor de Fuenteclara'],
      options: [],
    },
    {
      key: 'torre-apaga',
      order: 11,
      type: 'narracion',
      title: 'La torre se apaga',
      ambient: 'forest',
      image: `${IMG}/estrella.jpg`,
      ending: 'neutral',
      readAloud:
        'La gárgola se rompe en cascotes y la Lágrima, agrietada, deja de latir. La luz azul se retira de las grietas de la torre como el agua de una playa. Abajo, en el taller, se oye un ruido de huesos cayendo al suelo, todos a la vez. Velkan se queda sentado en el borde del cráter, con las manos sobre las rodillas, en una oscuridad que ahora sí es completa.',
      dmText:
        'Victoria. Velkan vivirá, pero roto. Si el grupo lo lleva a Fuenteclara, el Señor lo acoge. La Lágrima rota vale 200 po en fragmentos.\n\nSi alguien tocó la Lágrima (lagrima_tocada), a partir de ahora sueña de vez en cuando con mañanas que todavía no han pasado: un gran gancho para la siguiente campaña.\n\nXP: subida a nivel 4. Recompensa del Señor: 300 po.',
      treasure: ['Fragmentos de la Lágrima (200 po)', '300 po del Señor de Fuenteclara'],
      options: [],
    },
    {
      key: 'polvo',
      order: 12,
      type: 'narracion',
      title: 'Polvo de estrellas',
      ambient: 'dungeon',
      image: `${IMG}/estrella.jpg`,
      ending: 'defeat',
      readAloud:
        'Despertáis al pie del cerro, sobre la hierba quemada, sin recordar cómo bajasteis. Arriba, la torre brilla más que nunca. Del tubo de latón junto a la puerta sale, muy bajito, la voz de Velkan: "Ella dice que volveréis. Ella dice que ya lo ha visto."',
      dmText:
        'Derrota. La Lágrima "deja salir" al grupo porque ha visto que volverá. Si quieren intentarlo de nuevo tras un descanso largo, los guardianes derrotados siguen derrotados.',
      options: [],
    },
  ],
};
