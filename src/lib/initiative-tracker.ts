// Combat initiative and turn order management

export interface InitiativeRoll {
  characterId: string;
  characterName: string;
  initiativeBonus: number;
  rollResult: number;
  totalInitiative: number;
  advantage: boolean;
  disadvantage: boolean;
}

export interface CombatRound {
  roundNumber: number;
  turnOrder: InitiativeRoll[];
  currentTurnIndex: number;
  elapsedTime: number;
}

export interface CombatState {
  id: string;
  campaignId: string;
  encounterId: string;
  isActive: boolean;
  round: CombatRound;
  participants: InitiativeRoll[];
  conditions: CombatCondition[];
  startTime: Date;
  endTime?: Date;
}

export interface CombatCondition {
  characterId: string;
  condition: "poisoned" | "blinded" | "stunned" | "paralyzed" | "petrified" | "frightened" | "restrained" | "unconscious" | "custom";
  duration: number;
  source: string;
  description?: string;
}

export function rollInitiative(
  characterId: string,
  characterName: string,
  bonus: number,
  advantage: boolean = false,
  disadvantage: boolean = false
): InitiativeRoll {
  let roll1 = Math.floor(Math.random() * 20) + 1;
  let roll2 = Math.floor(Math.random() * 20) + 1;

  let rollResult = roll1;
  if (advantage) rollResult = Math.max(roll1, roll2);
  if (disadvantage) rollResult = Math.min(roll1, roll2);

  return {
    characterId,
    characterName,
    initiativeBonus: bonus,
    rollResult,
    totalInitiative: rollResult + bonus,
    advantage,
    disadvantage,
  };
}

export function sortInitiativeOrder(rolls: InitiativeRoll[]): InitiativeRoll[] {
  return [...rolls].sort((a, b) => b.totalInitiative - a.totalInitiative);
}

export function createCombatState(
  campaignId: string,
  encounterId: string,
  participants: InitiativeRoll[]
): CombatState {
  const sortedParticipants = sortInitiativeOrder(participants);

  return {
    id: `combat_${Date.now()}`,
    campaignId,
    encounterId,
    isActive: true,
    round: {
      roundNumber: 1,
      turnOrder: sortedParticipants,
      currentTurnIndex: 0,
      elapsedTime: 0,
    },
    participants: sortedParticipants,
    conditions: [],
    startTime: new Date(),
  };
}

export function getCurrentTurn(combat: CombatState): InitiativeRoll | null {
  const turnOrder = combat.round.turnOrder;
  if (combat.round.currentTurnIndex >= turnOrder.length) return null;
  return turnOrder[combat.round.currentTurnIndex];
}

export function nextTurn(combat: CombatState): CombatState {
  let newIndex = combat.round.currentTurnIndex + 1;
  let newRound = combat.round.roundNumber;

  if (newIndex >= combat.round.turnOrder.length) {
    newIndex = 0;
    newRound++;
  }

  return {
    ...combat,
    round: {
      ...combat.round,
      currentTurnIndex: newIndex,
      roundNumber: newRound,
      elapsedTime: combat.round.elapsedTime + 6,
    },
  };
}

export function addCondition(
  combat: CombatState,
  characterId: string,
  condition: CombatCondition["condition"],
  duration: number,
  source: string
): CombatState {
  return {
    ...combat,
    conditions: [
      ...combat.conditions,
      {
        characterId,
        condition,
        duration,
        source,
      },
    ],
  };
}

export function removeCondition(
  combat: CombatState,
  characterId: string,
  condition: CombatCondition["condition"]
): CombatState {
  return {
    ...combat,
    conditions: combat.conditions.filter(
      (c) => !(c.characterId === characterId && c.condition === condition)
    ),
  };
}

export function updateConditionDuration(
  combat: CombatState,
  characterId: string,
  condition: CombatCondition["condition"],
  newDuration: number
): CombatState {
  return {
    ...combat,
    conditions: combat.conditions.map((c) =>
      c.characterId === characterId && c.condition === condition
        ? { ...c, duration: newDuration }
        : c
    ),
  };
}

export function getCharacterConditions(
  combat: CombatState,
  characterId: string
): CombatCondition[] {
  return combat.conditions.filter((c) => c.characterId === characterId);
}

export function endCombat(combat: CombatState): CombatState {
  return {
    ...combat,
    isActive: false,
    endTime: new Date(),
  };
}

export function getCombatDuration(combat: CombatState): number {
  const elapsed = combat.round.elapsedTime;
  const minutes = Math.floor(elapsed / 10);
  const rounds = elapsed % 10;
  return Math.round(minutes * 60 + rounds * 6);
}

export function getRoundDuration(roundNumber: number): string {
  return `${roundNumber * 6} seconds`;
}
