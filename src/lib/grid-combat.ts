// Grid-based tactical combat system

export interface GridPosition {
  x: number;
  y: number;
}

export interface Token {
  id: string;
  name: string;
  type: 'player' | 'npc' | 'enemy';
  hp_current: number;
  hp_max: number;
  ac: number;
  position: GridPosition;
  size: 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan';
  color: string;
}

export interface GridCombat {
  id: string;
  width: number;
  height: number;
  grid_size: number; // feet per square
  tokens: Token[];
  turn_order: string[]; // token IDs
  current_turn_index: number;
  round: number;
}

export const GRID_SIZE_PRESETS = {
  small: { width: 10, height: 10, name: 'Small Room' },
  medium: { width: 20, height: 20, name: 'Medium Dungeon' },
  large: { width: 30, height: 30, name: 'Large Battlefield' },
  huge: { width: 40, height: 40, name: 'Huge Arena' },
};

export const TOKEN_COLORS = {
  player: '#4ade80',
  npc: '#0ea5e9',
  enemy: '#ef4444',
  boss: '#a855f7',
};

export const TOKEN_SIZES = {
  tiny: 0.5,
  small: 1,
  medium: 1,
  large: 2,
  huge: 3,
  gargantuan: 4,
};

// Calculate distance between two positions (in squares)
export function calculateDistance(from: GridPosition, to: GridPosition): number {
  return Math.max(Math.abs(from.x - to.x), Math.abs(from.y - to.y));
}

// Check if a position is in range
export function isInRange(from: GridPosition, to: GridPosition, range: number): boolean {
  return calculateDistance(from, to) <= range;
}

// Get all squares in a line of sight
export function getLineOfSight(from: GridPosition, to: GridPosition): GridPosition[] {
  const positions: GridPosition[] = [];
  const dx = Math.sign(to.x - from.x);
  const dy = Math.sign(to.y - from.y);

  let current = { ...from };
  while (current.x !== to.x || current.y !== to.y) {
    if (current.x !== to.x) current.x += dx;
    if (current.y !== to.y) current.y += dy;
    positions.push({ ...current });
  }

  return positions;
}

// Get all squares in AOE (Area of Effect)
export function getAOESquares(center: GridPosition, radius: number): GridPosition[] {
  const positions: GridPosition[] = [];
  for (let x = center.x - radius; x <= center.x + radius; x++) {
    for (let y = center.y - radius; y <= center.y + radius; y++) {
      if (calculateDistance(center, { x, y }) <= radius) {
        positions.push({ x, y });
      }
    }
  }
  return positions;
}

// Check if position is occupied by token
export function isPositionOccupied(position: GridPosition, tokens: Token[]): boolean {
  return tokens.some((t) => t.position.x === position.x && t.position.y === position.y);
}

// Get token at position
export function getTokenAtPosition(position: GridPosition, tokens: Token[]): Token | undefined {
  return tokens.find((t) => t.position.x === position.x && t.position.y === position.y);
}

// Move token (with validation)
export function moveToken(
  token: Token,
  newPosition: GridPosition,
  distance: number,
  allTokens: Token[],
  gridWidth: number,
  gridHeight: number
): { success: boolean; error?: string } {
  // Check bounds
  if (newPosition.x < 0 || newPosition.x >= gridWidth || newPosition.y < 0 || newPosition.y >= gridHeight) {
    return { success: false, error: 'Position out of bounds' };
  }

  // Check distance (movement speed in feet, typically 30 ft = 6 squares)
  const movementSquares = Math.floor(distance / 5); // 5 feet per square
  const requiredDistance = calculateDistance(token.position, newPosition);
  if (requiredDistance > movementSquares) {
    return { success: false, error: `Cannot move ${requiredDistance} squares with ${movementSquares} movement` };
  }

  // Check occupancy
  if (isPositionOccupied(newPosition, allTokens.filter((t) => t.id !== token.id))) {
    return { success: false, error: 'Position occupied' };
  }

  token.position = newPosition;
  return { success: true };
}

// Roll attack with grid modifiers
export function rollAttackWithModifiers(
  attacker: Token,
  defender: Token,
  attackBonus: number,
  d20Roll: number
): { hit: boolean; damage: number; notes: string[] } {
  const notes: string[] = [];
  let modifier = attackBonus;

  // Distance modifier (disadvantage if more than 150 ft away)
  const distance = calculateDistance(attacker.position, defender.position);
  if (distance > 30) {
    modifier -= 2;
    notes.push(`-2 penalty: ${distance} squares away`);
  } else if (distance === 1) {
    modifier += 1;
    notes.push('+1 bonus: adjacent target');
  }

  const totalRoll = d20Roll + modifier;
  const hit = totalRoll >= defender.ac;

  const damage = hit ? Math.floor(Math.random() * 8) + 1 + Math.floor(modifier / 2) : 0;

  return { hit, damage, notes };
}

// Calculate cover modifiers
export function getCoverModifier(
  attacker: GridPosition,
  defender: GridPosition,
  obstacles: GridPosition[]
): number {
  const lineOfSight = getLineOfSight(attacker, defender);
  const blockedSquares = lineOfSight.filter((pos) =>
    obstacles.some((obs) => obs.x === pos.x && obs.y === pos.y)
  );

  const coverage = blockedSquares.length / lineOfSight.length;
  if (coverage >= 0.75) return -4; // Three-quarters cover
  if (coverage >= 0.5) return -2; // Half cover
  if (coverage >= 0.25) return -1; // Quarter cover
  return 0; // No cover
}
