// Guía corta de cada clase para quien crea el personaje.
// El atributo de ataque coincide con attackAbilityFor (src/lib/combat-engine.ts).

export interface ClassGuide {
  /** Qué hace en una frase. */
  summary: string;
  /** Con qué atributo ataca en la app. */
  attack: string;
  /** Si lanza conjuros del SRD (sí/no) y cómo. */
  spells: string;
}

export const CLASS_GUIDE: Record<string, ClassGuide> = {
  Guerrero: {
    summary: 'Combatiente cuerpo a cuerpo, resistente y con buen daño. Muy fácil de jugar.',
    attack: 'Fuerza',
    spells: 'No lanza conjuros.',
  },
  Bárbaro: {
    summary: 'Ataca con mucha fuerza y aguanta golpes. Ideal si querés pegar fuerte.',
    attack: 'Fuerza',
    spells: 'No lanza conjuros.',
  },
  Pícaro: {
    summary: 'Ágil y preciso. Ataca con Destreza; sirve para sigilo y para resolver trampas.',
    attack: 'Destreza',
    spells: 'No lanza conjuros.',
  },
  Explorador: {
    summary: 'Tirador y rastreador. Ataca a distancia con Destreza y se mueve bien por el terreno.',
    attack: 'Destreza',
    spells: 'Conjuros de naturaleza (con Sabiduría). En la app, el ataque usa Destreza.',
  },
  Monje: {
    summary: 'Combatiente ágil que pelea sin armas con varios golpes rápidos.',
    attack: 'Destreza',
    spells: 'No lanza conjuros.',
  },
  Paladín: {
    summary: 'Guerrero sagrado. Pelea con Fuerza y tiene algunos conjuros que protegen y curan.',
    attack: 'Fuerza',
    spells: 'Conjuros divinos (con Carisma). En la app todavía no se lanzan.',
  },
  Mago: {
    summary: 'Lanzador de conjuros. Frágil en combate, pero tiene los conjuros más variados.',
    attack: 'Inteligencia',
    spells: 'Sí. Elegí trucos y conjuros de tu nivel en la ficha.',
  },
  Hechicero: {
    summary: 'Lanzador con magia innata. Tiene menos conjuros que el Mago, pero los lanza con más frecuencia.',
    attack: 'Carisma',
    spells: 'Sí. Elegí trucos y conjuros en la ficha.',
  },
  Brujo: {
    summary: 'Lanzador que hizo un pacto con un poder. Pocos espacios, que se recuperan más rápido.',
    attack: 'Carisma',
    spells: 'Sí, pero su magia de pacto todavía no tiene espacios propios en la app.',
  },
  Bardo: {
    summary: 'Lanzador que inspira y encanta. Sirve para apoyar al grupo además de atacar.',
    attack: 'Carisma',
    spells: 'Sí. Elegí trucos y conjuros en la ficha.',
  },
  Clérigo: {
    summary: 'Lanzador divino que cura y protege al grupo. Ideal si querés sanar.',
    attack: 'Sabiduría',
    spells: 'Sí. Elegí trucos y conjuros en la ficha.',
  },
  Druida: {
    summary: 'Lanzador de la naturaleza. Cura, controla el terreno y se transforma.',
    attack: 'Sabiduría',
    spells: 'Sí. Elegí trucos y conjuros en la ficha.',
  },
  Artificiero: {
    summary: 'Inventor que crea objetos y herramientas útiles en combate.',
    attack: 'Fuerza (en la app)',
    spells: 'Conjuros de inventor. En la app todavía no se lanzan.',
  },
};
