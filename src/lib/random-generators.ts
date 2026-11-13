// Random content generators

export interface GeneratorOptions {
  seed?: number;
  language?: "english" | "spanish" | "german";
  includeMetadata?: boolean;
}

export interface GeneratedNPC {
  name: string;
  race: string;
  class: string;
  age: number;
  alignment: string;
  personality: string[];
  profession: string;
  secret: string;
  appearance: string;
}

export const firstNamesEnglish = [
  "Aldric", "Borin", "Cassian", "Dante", "Emrys", "Farin", "Gareth", "Henrik",
  "Isolde", "Jasper", "Kael", "Lysander", "Marius", "Nadia", "Orin", "Piper",
  "Quincy", "Rosalind", "Seraph", "Theron", "Ulysses", "Vesper", "Wren", "Xander",
  "Yara", "Zephyr", "Aurora", "Baldric", "Cerys", "Darrick", "Elowen", "Faye",
];

export const lastNamesEnglish = [
  "Blackthorn", "Copperfield", "Dragonbane", "Eastwold", "Fairborn", "Goldleaf",
  "Hearthstone", "Ironhand", "Jade", "Kingsley", "Lightbringer", "Moonwhisper",
  "Nightshade", "Oakenshield", "Proudfoot", "Quicksilver", "Ravenswood", "Stonehelm",
  "Thornheart", "Underwood", "Vexborn", "Wildewood", "Xenith", "Youngblood", "Zephyren",
];

export const professions = [
  "Merchant", "Scholar", "Thief", "Cleric", "Warrior", "Mage", "Bard", "Paladin",
  "Rogue", "Ranger", "Barbarian", "Druid", "Monk", "Sorcerer", "Warlock",
  "Artificer", "Tavern Keeper", "Blacksmith", "Baker", "Guard", "Farmer",
];

export const personalities = [
  "Honorable", "Cunning", "Timid", "Bold", "Cynical", "Optimistic", "Mysterious",
  "Charismatic", "Grumpy", "Cheerful", "Paranoid", "Trusting", "Calculating",
  "Impulsive", "Cautious", "Ambitious", "Humble", "Arrogant", "Sarcastic", "Sincere",
];

export const races = [
  "Human", "Elf", "Dwarf", "Halfling", "Dragonborn", "Gnome", "Half-Elf", "Half-Orc", "Tiefling",
];

export const alignments = [
  "Lawful Good", "Neutral Good", "Chaotic Good",
  "Lawful Neutral", "True Neutral", "Chaotic Neutral",
  "Lawful Evil", "Neutral Evil", "Chaotic Evil",
];

export function generateRandomName(lastNamePool?: string[]): string {
  const first = firstNamesEnglish[Math.floor(Math.random() * firstNamesEnglish.length)];
  const last = (lastNamePool || lastNamesEnglish)[Math.floor(Math.random() * (lastNamePool || lastNamesEnglish).length)];
  return `${first} ${last}`;
}

export function generateNPC(): GeneratedNPC {
  const name = generateRandomName();
  const race = races[Math.floor(Math.random() * races.length)];
  const profClass = professions[Math.floor(Math.random() * professions.length)];
  const age = Math.floor(Math.random() * 60) + 15;
  const alignment = alignments[Math.floor(Math.random() * alignments.length)];

  const personalityTraits: string[] = [];
  for (let i = 0; i < 2; i++) {
    const trait = personalities[Math.floor(Math.random() * personalities.length)];
    if (!personalityTraits.includes(trait)) personalityTraits.push(trait);
  }

  const profession = professions[Math.floor(Math.random() * professions.length)];
  const secrets = [
    "They are secretly working for the local crime lord",
    "They are harboring a fugitive",
    "They have a dangerous secret from their past",
    "They are cursed by a powerful sorcerer",
    "They are searching for something precious",
  ];
  const secret = secrets[Math.floor(Math.random() * secrets.length)];

  const appearances = [
    "Tall and lean with piercing eyes",
    "Short and stocky with a friendly smile",
    "Average height with notable scars",
    "Unusually pale with dark hair",
    "Well-muscled with battle-worn armor",
    "Dressed in fine silks and jewels",
    "Wearing tattered, worn clothing",
  ];
  const appearance = appearances[Math.floor(Math.random() * appearances.length)];

  return {
    name,
    race,
    class: profClass,
    age,
    alignment,
    personality: personalityTraits,
    profession,
    secret,
    appearance,
  };
}

export function generatePlaceName(): string {
  const prefixes = ["North", "South", "East", "West", "Old", "New", "Dark", "Bright", "Silent", "Echo"];
  const suffixes = ["wood", "field", "ford", "stone", "keep", "holt", "mere", "peak", "vale", "holm"];

  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

  return `${prefix}${suffix.charAt(0).toUpperCase()}${suffix.slice(1)}`;
}

export function generateQuestHook(): string {
  const hooks = [
    "A valuable artifact has been stolen",
    "Someone needs rescuing from danger",
    "A mystery needs solving",
    "A monster needs slaying",
    "Ancient ruins need exploring",
    "A prophecy is coming true",
    "A friend betrays the group",
    "A plague is spreading",
    "A war is brewing",
    "A curse must be broken",
  ];

  return hooks[Math.floor(Math.random() * hooks.length)];
}

export function generateTreasure(rarity: "common" | "uncommon" | "rare" | "very-rare" | "legendary"): string {
  const commonTreasure = [
    "10 gold pieces",
    "A copper ring",
    "A faded map",
    "A wooden dice set",
  ];

  const rareTreasure = [
    "+1 Sword",
    "Bag of Holding",
    "Ring of Protection",
    "Cloak of Invisibility",
    "Wand of Fireballs",
  ];

  const pools: Record<string, string[]> = {
    common: commonTreasure,
    uncommon: [...commonTreasure, "+1 Dagger"],
    rare: rareTreasure,
    "very-rare": [...rareTreasure, "Legendary Artifact"],
    legendary: ["Vorpal Blade", "Rod of Lordly Might", "The One Ring"],
  };

  const pool = pools[rarity];
  return pool[Math.floor(Math.random() * pool.length)];
}
