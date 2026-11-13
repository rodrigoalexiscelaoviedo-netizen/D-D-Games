// Discord bot integration for D&D VTT

export interface DiscordConfig {
  botToken: string;
  serverId: string;
  channelId: string;
  webhookUrl?: string;
  isConnected: boolean;
}

export interface DiscordMessage {
  content: string;
  embeds?: DiscordEmbed[];
  components?: DiscordComponent[];
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: DiscordField[];
  image?: { url: string };
  thumbnail?: { url: string };
  footer?: { text: string; icon_url?: string };
  timestamp?: string;
}

export interface DiscordField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordComponent {
  type: 1 | 2 | 3;
  components?: DiscordButton[];
  options?: DiscordOption[];
}

export interface DiscordButton {
  type: 2;
  label: string;
  style: 1 | 2 | 3 | 4 | 5;
  custom_id: string;
}

export interface DiscordOption {
  label: string;
  value: string;
}

// Color presets for D&D
export const DISCORD_COLORS = {
  adventure: 0x4a90e2,
  combat: 0xef4444,
  success: 0x4ade80,
  warning: 0xfbbf24,
  error: 0xef4444,
  magic: 0xa855f7,
  neutral: 0x999999,
};

// Create rich embed for campaign update
export function createCampaignEmbed(
  campaignName: string,
  sessionNumber: number,
  description: string
): DiscordEmbed {
  return {
    title: `📖 ${campaignName} - Session ${sessionNumber}`,
    description,
    color: DISCORD_COLORS.adventure,
    fields: [
      {
        name: 'Status',
        value: '🎲 Active',
        inline: true,
      },
      {
        name: 'Players',
        value: '?',
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

// Create combat announcement
export function createCombatEmbed(
  combatName: string,
  enemies: number,
  difficulty: string
): DiscordEmbed {
  return {
    title: `⚔️ Combat Encounter: ${combatName}`,
    description: `A battle with ${enemies} enemies approaches!`,
    color: DISCORD_COLORS.combat,
    fields: [
      {
        name: 'Difficulty',
        value: difficulty,
        inline: true,
      },
      {
        name: 'Enemies',
        value: `${enemies}`,
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

// Create initiative tracker embed
export function createInitiativeEmbed(participants: Array<{ name: string; initiative: number }>): DiscordEmbed {
  const sorted = [...participants].sort((a, b) => b.initiative - a.initiative);

  return {
    title: '🎯 Initiative Order',
    description: 'Combat has begun!',
    color: DISCORD_COLORS.combat,
    fields: sorted.map((p, idx) => ({
      name: `${idx + 1}. ${p.name}`,
      value: `Initiative: ${p.initiative}`,
      inline: false,
    })),
    timestamp: new Date().toISOString(),
  };
}

// Create character announcement
export function createCharacterEmbed(character: any): DiscordEmbed {
  return {
    title: `👤 ${character.name}`,
    description: `${character.race} ${character.class}`,
    color: DISCORD_COLORS.magic,
    fields: [
      {
        name: 'Level',
        value: `${character.level}`,
        inline: true,
      },
      {
        name: 'HP',
        value: `${character.hp_current}/${character.hp_max}`,
        inline: true,
      },
      {
        name: 'AC',
        value: `${character.ac}`,
        inline: true,
      },
    ],
    thumbnail: { url: character.avatar_url || '' },
    timestamp: new Date().toISOString(),
  };
}

// Create quest announcement
export function createQuestEmbed(quest: any): DiscordEmbed {
  return {
    title: `📜 Quest: ${quest.title}`,
    description: quest.description,
    color: DISCORD_COLORS.adventure,
    fields: [
      {
        name: 'Giver',
        value: quest.giver,
        inline: true,
      },
      {
        name: 'Reward',
        value: quest.reward,
        inline: true,
      },
      {
        name: 'Difficulty',
        value: quest.difficulty,
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

// Create loot announcement
export function createLootEmbed(items: Array<{ name: string; rarity: string }>): DiscordEmbed {
  return {
    title: '💰 Loot Found!',
    description: `The party discovers ${items.length} items!`,
    color: DISCORD_COLORS.success,
    fields: items.map((item) => ({
      name: item.name,
      value: `Rarity: ${item.rarity}`,
      inline: true,
    })),
    timestamp: new Date().toISOString(),
  };
}

// Create level up notification
export function createLevelUpEmbed(characterName: string, newLevel: number): DiscordEmbed {
  return {
    title: `🎉 Level Up!`,
    description: `${characterName} has reached level ${newLevel}!`,
    color: DISCORD_COLORS.success,
    fields: [
      {
        name: 'New Level',
        value: `${newLevel}`,
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

// Send message via webhook
export async function sendDiscordWebhook(webhookUrl: string, message: DiscordMessage): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    return response.ok;
  } catch (error) {
    console.error('Discord webhook error:', error);
    return false;
  }
}

// Validate Discord token
export function validateDiscordToken(token: string): boolean {
  return token.length > 0 && !token.includes(' ');
}

// Validate webhook URL
export function validateWebhookUrl(url: string): boolean {
  try {
    new URL(url);
    return url.includes('discord.com') || url.includes('discordapp.com');
  } catch {
    return false;
  }
}

// Create connection status embed
export function createStatusEmbed(isConnected: boolean): DiscordEmbed {
  return {
    title: 'D&D VTT Status',
    description: isConnected ? '✅ Connected to D&D VTT' : '❌ Disconnected from D&D VTT',
    color: isConnected ? DISCORD_COLORS.success : DISCORD_COLORS.error,
    fields: [
      {
        name: 'Status',
        value: isConnected ? 'Online' : 'Offline',
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

// Parse discord command
export function parseDiscordCommand(content: string): { command: string; args: string[] } {
  const parts = content.trim().split(/\s+/);
  return {
    command: parts[0]?.toLowerCase() || '',
    args: parts.slice(1),
  };
}

// Supported commands
export const DISCORD_COMMANDS = {
  'roll': { description: 'Roll dice: /roll 1d20' },
  'status': { description: 'Show campaign status' },
  'quest': { description: 'List active quests' },
  'character': { description: 'Show character info' },
  'initiative': { description: 'Start initiative roll' },
  'help': { description: 'Show available commands' },
};
