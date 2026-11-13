// D&D 5e rules reference database

export interface Rule {
  id: string;
  title: string;
  category: string;
  content: string;
  page?: number;
  sourceBook: string;
}

export interface RuleCategory {
  name: string;
  description: string;
  rules: Rule[];
}

export const D5E_RULES_DATABASE: Record<string, RuleCategory> = {
  "ability-scores": {
    name: "Ability Scores",
    description: "Rules for ability scores and modifiers",
    rules: [
      {
        id: "ability-score-1",
        title: "Ability Score Determination",
        category: "Ability Scores",
        content: "Six abilities provide a quick description of every creature ability in D&D",
        sourceBook: "Player's Handbook",
        page: 12,
      },
    ],
  },
  "action-economy": {
    name: "Action Economy",
    description: "What creatures can do on their turn",
    rules: [
      {
        id: "action-1",
        title: "Movement",
        category: "Actions",
        content: "You can move up to your speed on your turn",
        sourceBook: "Player's Handbook",
        page: 190,
      },
      {
        id: "action-2",
        title: "Action",
        category: "Actions",
        content: "You can perform one action on your turn",
        sourceBook: "Player's Handbook",
        page: 192,
      },
      {
        id: "action-3",
        title: "Bonus Action",
        category: "Actions",
        content: "You can perform one bonus action on your turn",
        sourceBook: "Player's Handbook",
        page: 192,
      },
    ],
  },
  "conditions": {
    name: "Conditions",
    description: "Special statuses that affect creatures",
    rules: [
      {
        id: "condition-1",
        title: "Blinded",
        category: "Conditions",
        content: "A blinded creature can't see and automatically fails any ability check that requires sight",
        sourceBook: "Player's Handbook",
        page: 183,
      },
      {
        id: "condition-2",
        title: "Frightened",
        category: "Conditions",
        content: "A frightened creature has disadvantage on ability checks and attack rolls while the source is within 60 feet",
        sourceBook: "Player's Handbook",
        page: 184,
      },
    ],
  },
  "damage": {
    name: "Damage",
    description: "Damage rules and types",
    rules: [
      {
        id: "damage-1",
        title: "Damage Rolls",
        category: "Damage",
        content: "When you make an attack that hits, you roll damage dice",
        sourceBook: "Player's Handbook",
        page: 196,
      },
      {
        id: "damage-2",
        title: "Damage Types",
        category: "Damage",
        content: "Acid, bludgeoning, cold, fire, force, lightning, necrotic, piercing, poison, psychic, radiant, slashing, thunder",
        sourceBook: "Player's Handbook",
        page: 183,
      },
    ],
  },
  "saving-throws": {
    name: "Saving Throws",
    description: "Saving throw rules",
    rules: [
      {
        id: "save-1",
        title: "Saving Throw",
        category: "Saving Throws",
        content: "A saving throw represents an attempt to resist a spell, trap, poison, disease, or similar threat",
        sourceBook: "Player's Handbook",
        page: 179,
      },
    ],
  },
};

export function searchRules(
  query: string,
  category?: string
): Rule[] {
  const results: Rule[] = [];
  const lower = query.toLowerCase();

  Object.values(D5E_RULES_DATABASE).forEach((ruleCategory) => {
    if (category && ruleCategory.name !== category) return;

    ruleCategory.rules.forEach((rule) => {
      if (
        rule.title.toLowerCase().includes(lower) ||
        rule.content.toLowerCase().includes(lower)
      ) {
        results.push(rule);
      }
    });
  });

  return results;
}

export function getRulesByCategory(category: string): Rule[] {
  const ruleCategory = D5E_RULES_DATABASE[category.toLowerCase().replace(/\s+/g, "-")];
  return ruleCategory ? ruleCategory.rules : [];
}

export function getAllCategories(): string[] {
  return Object.values(D5E_RULES_DATABASE).map((c) => c.name);
}

export function getRuleById(id: string): Rule | null {
  for (const category of Object.values(D5E_RULES_DATABASE)) {
    const rule = category.rules.find((r) => r.id === id);
    if (rule) return rule;
  }
  return null;
}

export interface QuickReference {
  ability: string;
  ability_modifier: number;
  proficiency_bonus: number;
  ac: number;
  hp: number;
}

export function calculateAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function getProficiencyBonus(level: number): number {
  if (level <= 4) return 2;
  if (level <= 8) return 3;
  if (level <= 12) return 4;
  if (level <= 16) return 5;
  return 6;
}

export function getExperienceThreshold(level: number, difficulty: "easy" | "medium" | "hard" | "deadly"): number {
  const thresholds: Record<number, Record<string, number>> = {
    1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
    2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
    3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
    4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
    5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
  };

  return thresholds[Math.min(level, 5)]?.[difficulty] || 0;
}

export function getSpellDifficultyClass(spellcasterLevel: number): number {
  const profBonus = getProficiencyBonus(spellcasterLevel);
  return 8 + profBonus;
}
