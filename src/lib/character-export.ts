// Character sheet export to PDF and JSON formats

export interface CharacterExportOptions {
  format: 'pdf' | 'json' | 'markdown';
  includeInventory: boolean;
  includeSpells: boolean;
  includeNotes: boolean;
  compressImages: boolean;
}

export interface ExportedCharacter {
  name: string;
  class: string;
  level: number;
  race: string;
  background: string;
  alignment: string;
  experiencePoints: number;
  abilityScores: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  skills: Record<string, number>;
  savingThrows: Record<string, number>;
  proficiencies: string[];
  equipment: string[];
  spells: Array<{
    name: string;
    level: number;
    prepared: boolean;
  }>;
  features: string[];
  notes: string;
  exportedAt: Date;
}

export function generateCharacterJSON(character: ExportedCharacter): string {
  return JSON.stringify(character, null, 2);
}

export function generateCharacterMarkdown(character: ExportedCharacter): string {
  let md = `# ${character.name}\n\n`;
  md += `**Class:** ${character.class} | **Level:** ${character.level}\n`;
  md += `**Race:** ${character.race} | **Background:** ${character.background}\n`;
  md += `**Alignment:** ${character.alignment}\n\n`;

  md += `## Ability Scores\n`;
  md += `- Strength: ${character.abilityScores.strength}\n`;
  md += `- Dexterity: ${character.abilityScores.dexterity}\n`;
  md += `- Constitution: ${character.abilityScores.constitution}\n`;
  md += `- Intelligence: ${character.abilityScores.intelligence}\n`;
  md += `- Wisdom: ${character.abilityScores.wisdom}\n`;
  md += `- Charisma: ${character.abilityScores.charisma}\n\n`;

  if (character.equipment.length > 0) {
    md += `## Equipment\n`;
    character.equipment.forEach((item) => (md += `- ${item}\n`));
    md += '\n';
  }

  if (character.spells.length > 0) {
    md += `## Spells\n`;
    character.spells.forEach((spell) => {
      md += `- ${spell.name} (Level ${spell.level})${spell.prepared ? ' [Prepared]' : ''}\n`;
    });
  }

  return md;
}

export function createCharacterExportBlob(
  content: string,
  format: 'json' | 'markdown'
): Blob {
  const mimeType = format === 'json' ? 'application/json' : 'text/markdown';
  return new Blob([content], { type: mimeType });
}

export function downloadCharacterFile(
  content: string,
  filename: string,
  format: 'json' | 'markdown'
): void {
  const blob = createCharacterExportBlob(content, format);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseCharacterJSON(jsonString: string): ExportedCharacter | null {
  try {
    return JSON.parse(jsonString) as ExportedCharacter;
  } catch {
    return null;
  }
}

export function validateCharacterData(character: any): boolean {
  return (
    character.name &&
    character.class &&
    character.level >= 1 &&
    character.level <= 20 &&
    character.abilityScores &&
    typeof character.abilityScores.strength === 'number'
  );
}
