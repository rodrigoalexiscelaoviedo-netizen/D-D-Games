// Party and group management

export interface Party {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  members: PartyMember[];
  createdAt: Date;
  isActive: boolean;
  campaigns: string[];
  notes: string;
}

export interface PartyMember {
  userId: string;
  characterId: string;
  characterName: string;
  class: string;
  level: number;
  joinedDate: Date;
  role: "leader" | "member";
  isActive: boolean;
}

export interface PartyStats {
  totalMembers: number;
  activeMembers: number;
  averageLevel: number;
  levelSpread: number;
  composition: Record<string, number>;
}

export interface PartyLoot {
  id: string;
  partyId: string;
  itemName: string;
  rarity: "common" | "uncommon" | "rare" | "very-rare" | "legendary";
  description: string;
  foundDate: Date;
  status: "unclaimed" | "claimed" | "sold" | "destroyed";
  claimedBy?: string;
}

export function createParty(
  name: string,
  description: string,
  createdBy: string
): Party {
  return {
    id: `party_${Date.now()}`,
    name,
    description,
    createdBy,
    members: [],
    createdAt: new Date(),
    isActive: true,
    campaigns: [],
    notes: "",
  };
}

export function addMember(
  party: Party,
  userId: string,
  characterId: string,
  characterName: string,
  class_: string,
  level: number
): Party {
  const member: PartyMember = {
    userId,
    characterId,
    characterName,
    class: class_,
    level,
    joinedDate: new Date(),
    role: party.members.length === 0 ? "leader" : "member",
    isActive: true,
  };

  return {
    ...party,
    members: [...party.members, member],
  };
}

export function removeMember(party: Party, userId: string): Party {
  const members = party.members.filter((m) => m.userId !== userId);

  if (members.length > 0 && party.members.some((m) => m.userId === userId && m.role === "leader")) {
    members[0].role = "leader";
  }

  return {
    ...party,
    members,
  };
}

export function getPartyStats(party: Party): PartyStats {
  const activeMembers = party.members.filter((m) => m.isActive);
  const levels = activeMembers.map((m) => m.level);
  const avgLevel = levels.length > 0 ? levels.reduce((a, b) => a + b) / levels.length : 0;
  const levelSpread = levels.length > 0 ? Math.max(...levels) - Math.min(...levels) : 0;

  const composition: Record<string, number> = {};
  activeMembers.forEach((m) => {
    composition[m.class] = (composition[m.class] || 0) + 1;
  });

  return {
    totalMembers: party.members.length,
    activeMembers: activeMembers.length,
    averageLevel: Math.round(avgLevel * 10) / 10,
    levelSpread,
    composition,
  };
}

export function checkPartyBalance(party: Party): string[] {
  const issues: string[] = [];
  const stats = getPartyStats(party);

  if (stats.activeMembers === 0) {
    issues.push("Party has no active members");
  }

  if (stats.levelSpread > 5) {
    issues.push(`High level spread detected (${stats.levelSpread} levels)`);
  }

  if (stats.composition["Cleric"] === undefined && stats.composition["Druid"] === undefined) {
    issues.push("Party lacks healing capability");
  }

  return issues;
}

export function addLoot(
  party: Party,
  itemName: string,
  rarity: PartyLoot["rarity"],
  description: string
): PartyLoot {
  return {
    id: `loot_${Date.now()}`,
    partyId: party.id,
    itemName,
    rarity,
    description,
    foundDate: new Date(),
    status: "unclaimed",
  };
}

export function claimLoot(
  loot: PartyLoot,
  userId: string
): PartyLoot {
  return {
    ...loot,
    status: "claimed",
    claimedBy: userId,
  };
}

export function disbandParty(party: Party): Party {
  return {
    ...party,
    isActive: false,
  };
}

export function getPartyComposition(party: Party): Record<string, number> {
  const composition: Record<string, number> = {};
  party.members.forEach((m) => {
    composition[m.class] = (composition[m.class] || 0) + 1;
  });
  return composition;
}
