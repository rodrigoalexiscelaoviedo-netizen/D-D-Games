// Estadísticas basadas en el System Reference Document 5.1 de Wizards of the Coast,
// licenciado bajo Creative Commons Attribution 4.0 (CC-BY-4.0).
// Simplificadas al formato de combat-engine: un ataque, un dado de daño.
// El CR se guarda redondeado hacia abajo (la columna es entera); el XP es el real.

import type { ModuleMonster } from './types';

export const MONSTERS = {
  kobold: {
    name: 'Kobold',
    hp: 5, armor_class: 12, dexterity: 15, damage_dice: 4, attack_bonus: 4,
    xp_value: 25, challenge_rating: 0,
    description: 'Reptil pequeño y astuto. Ataca en grupo; ventaja si un aliado está adyacente al objetivo. Sensibilidad a la luz del sol.',
    portrait_seed: 'kobold',
  },
  rataGigante: {
    name: 'Rata gigante',
    hp: 7, armor_class: 12, dexterity: 15, damage_dice: 4, attack_bonus: 4,
    xp_value: 25, challenge_rating: 0,
    description: 'Rata del tamaño de un perro. Táctica de manada: ventaja si un aliado está adyacente al objetivo.',
    portrait_seed: 'rata-gigante',
  },
  necrofago: {
    name: 'Necrófago',
    hp: 22, armor_class: 12, dexterity: 15, damage_dice: 8, attack_bonus: 4,
    xp_value: 200, challenge_rating: 1,
    description: 'Muerto viviente hambriento. Sus garras paralizan: salvación de CON CD 10 o paralizado 1 minuto (repite al final de cada turno). Los elfos son inmunes.',
    portrait_seed: 'necrofago',
  },
  lobo: {
    name: 'Lobo',
    hp: 11, armor_class: 13, dexterity: 15, damage_dice: 8, attack_bonus: 4,
    xp_value: 50, challenge_rating: 0,
    description: 'Depredador de manada. Al morder, salvación de FUE CD 11 o derribado. Táctica de manada.',
    portrait_seed: 'lobo',
  },
  bandido: {
    name: 'Bandido',
    hp: 11, armor_class: 12, dexterity: 12, damage_dice: 6, attack_bonus: 3,
    xp_value: 25, challenge_rating: 0,
    description: 'Salteador de caminos con cimitarra y ballesta ligera.',
    portrait_seed: 'bandido',
  },
  capitanBandido: {
    name: 'Capitán bandido',
    hp: 65, armor_class: 15, dexterity: 16, damage_dice: 6, attack_bonus: 5,
    xp_value: 450, challenge_rating: 2,
    description: 'Líder curtido. Multiataque (dos cimitarras y una daga). Reacción Parada: +2 a la CA contra un ataque cuerpo a cuerpo que vea.',
    portrait_seed: 'capitan-bandido',
  },
  armaduraAnimada: {
    name: 'Armadura animada',
    hp: 33, armor_class: 18, dexterity: 11, damage_dice: 6, attack_bonus: 4,
    xp_value: 200, challenge_rating: 1,
    description: 'Armadura vacía movida por magia. Multiataque (dos golpes). Inmune a veneno y psíquico. Parece una armadura normal mientras no se mueve.',
    portrait_seed: 'armadura-animada',
  },
  esqueleto: {
    name: 'Esqueleto',
    hp: 13, armor_class: 13, dexterity: 14, damage_dice: 6, attack_bonus: 4,
    xp_value: 50, challenge_rating: 0,
    description: 'Huesos animados con espada corta y arco corto. Vulnerable al daño contundente.',
    portrait_seed: 'esqueleto',
  },
  gargola: {
    name: 'Gárgola',
    hp: 52, armor_class: 15, dexterity: 11, damage_dice: 6, attack_bonus: 4,
    xp_value: 450, challenge_rating: 2,
    description: 'Estatua demoníaca viva. Multiataque (mordisco y garras). Resiste daño no mágico; inmóvil, es indistinguible de una estatua.',
    portrait_seed: 'gargola',
  },
} satisfies Record<string, ModuleMonster>;
