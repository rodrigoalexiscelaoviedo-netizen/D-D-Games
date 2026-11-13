// Spellbook and spellcasting management

export type SpellLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type SpellSchool = "abjuration" | "conjuration" | "divination" | "enchantment" | "evocation" | "illusion" | "necromancy" | "transmutation";

export interface Spell {
  id: string;
  name: string;
  level: SpellLevel;
  school: SpellSchool;
  castingTime: string;
  range: string;
  components: {
    verbal: boolean;
    somatic: boolean;
    material: string[];
  };
  duration: string;
  concentration: boolean;
  damage?: {
    type: string;
    diceFormula: string;
  };
  savingThrow?: string;
  description: string;
  upcastRules?: string;
  sourceBook: string;
}

export interface SpellBook {
  id: string;
  characterId: string;
  characterName: string;
  class: string;
  spells: SpellBookEntry[];
  maxSpellsKnown: number;
  maxPreparedSpells: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SpellBookEntry {
  spellId: string;
  spell: Spell;
  isPrepared: boolean;
  spellSlotLevel?: number;
  notes?: string;
}

export interface SpellSlot {
  level: SpellLevel;
  total: number;
  used: number;
}

export interface CharacterSpellcasting {
  characterId: string;
  spellcastingClass: string;
  spellcastingAbility: "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma";
  spellSaveDC: number;
  spellAttackBonus: number;
  spellSlots: SpellSlot[];
  cantrips: Spell[];
  spellBook: SpellBook;
}

export function createSpellBook(
  characterId: string,
  characterName: string,
  class_: string,
  maxSpellsKnown: number,
  maxPreparedSpells: number
): SpellBook {
  return {
    id: `spellbook_${Date.now()}`,
    characterId,
    characterName,
    class: class_,
    spells: [],
    maxSpellsKnown,
    maxPreparedSpells,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function addSpellToBook(
  spellBook: SpellBook,
  spell: Spell,
  isPrepared: boolean = false
): SpellBook {
  if (spellBook.spells.length >= spellBook.maxSpellsKnown) {
    throw new Error("Spell book is full");
  }

  return {
    ...spellBook,
    spells: [
      ...spellBook.spells,
      {
        spellId: spell.id,
        spell,
        isPrepared,
      },
    ],
    updatedAt: new Date(),
  };
}

export function removeSpellFromBook(
  spellBook: SpellBook,
  spellId: string
): SpellBook {
  return {
    ...spellBook,
    spells: spellBook.spells.filter((s) => s.spellId !== spellId),
    updatedAt: new Date(),
  };
}

export function prepareSpell(
  spellBook: SpellBook,
  spellId: string
): SpellBook {
  const preparedCount = spellBook.spells.filter((s) => s.isPrepared).length;

  if (preparedCount >= spellBook.maxPreparedSpells) {
    throw new Error("Maximum prepared spells reached");
  }

  return {
    ...spellBook,
    spells: spellBook.spells.map((s) =>
      s.spellId === spellId ? { ...s, isPrepared: true } : s
    ),
    updatedAt: new Date(),
  };
}

export function unprepareSpell(
  spellBook: SpellBook,
  spellId: string
): SpellBook {
  return {
    ...spellBook,
    spells: spellBook.spells.map((s) =>
      s.spellId === spellId ? { ...s, isPrepared: false } : s
    ),
    updatedAt: new Date(),
  };
}

export function getPreparedSpells(spellBook: SpellBook): Spell[] {
  return spellBook.spells
    .filter((s) => s.isPrepared)
    .map((s) => s.spell);
}

export function getSpellsByLevel(
  spellBook: SpellBook,
  level: SpellLevel
): Spell[] {
  return spellBook.spells
    .filter((s) => s.spell.level === level)
    .map((s) => s.spell);
}

export function getSpellsBySchool(
  spellBook: SpellBook,
  school: SpellSchool
): Spell[] {
  return spellBook.spells
    .filter((s) => s.spell.school === school)
    .map((s) => s.spell);
}

export function castSpell(
  slots: SpellSlot[],
  spellLevel: SpellLevel
): SpellSlot[] {
  const slot = slots.find((s) => s.level === spellLevel);
  if (!slot || slot.used >= slot.total) {
    throw new Error("No spell slots available");
  }

  return slots.map((s) =>
    s.level === spellLevel ? { ...s, used: s.used + 1 } : s
  );
}

export function restSpellSlots(slots: SpellSlot[]): SpellSlot[] {
  return slots.map((s) => ({ ...s, used: 0 }));
}

export function getAvailableSpellSlots(slots: SpellSlot[]): number {
  return slots.reduce((sum, s) => sum + (s.total - s.used), 0);
}

export function calculateSpellDC(
  spellcastingAbilityModifier: number,
  proficiencyBonus: number
): number {
  return 8 + spellcastingAbilityModifier + proficiencyBonus;
}
