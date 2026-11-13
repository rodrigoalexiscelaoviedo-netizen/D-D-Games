// Dungeon mapping and grid system

export type TileType = 'empty' | 'wall' | 'door' | 'trap' | 'treasure' | 'water' | 'lava' | 'difficult';

export interface Tile {
  x: number;
  y: number;
  type: TileType;
  description?: string;
  isRevealed?: boolean;
}

export interface DungeonMap {
  id: string;
  name: string;
  width: number;
  height: number;
  tiles: Tile[];
  gridSize: number; // feet per square
  scale: number; // zoom level
  locations?: string[]; // location names in this map
}

export interface Room {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  description: string;
  encounters?: string[]; // encounter IDs
  treasures?: Array<{ name: string; value: number }>;
}

// Tile rendering colors
export const TILE_COLORS: Record<TileType, string> = {
  empty: '#1a1a1a',
  wall: '#333333',
  door: '#8b4513',
  trap: '#ef4444',
  treasure: '#fbbf24',
  water: '#0ea5e9',
  lava: '#ea580c',
  difficult: '#fbbf24',
};

// Create empty dungeon map
export function createEmptyMap(width: number, height: number, gridSize: number = 30): DungeonMap {
  const tiles: Tile[] = [];

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      tiles.push({
        x,
        y,
        type: 'empty',
        isRevealed: false,
      });
    }
  }

  return {
    id: `map_${Date.now()}`,
    name: 'New Dungeon',
    width,
    height,
    tiles,
    gridSize,
    scale: 1,
  };
}

// Set tile type
export function setTile(map: DungeonMap, x: number, y: number, type: TileType, description?: string): DungeonMap {
  const updated = { ...map };
  const tile = updated.tiles.find((t) => t.x === x && t.y === y);

  if (tile) {
    tile.type = type;
    if (description) tile.description = description;
  }

  return updated;
}

// Reveal tile to players
export function revealTile(map: DungeonMap, x: number, y: number): DungeonMap {
  const updated = { ...map };
  const tile = updated.tiles.find((t) => t.x === x && t.y === y);

  if (tile) {
    tile.isRevealed = true;
  }

  return updated;
}

// Reveal area of effect
export function revealAOE(map: DungeonMap, centerX: number, centerY: number, radius: number): DungeonMap {
  const updated = { ...map };

  for (let x = centerX - radius; x <= centerX + radius; x++) {
    for (let y = centerY - radius; y <= centerY + radius; y++) {
      if (x >= 0 && x < map.width && y >= 0 && y < map.height) {
        const tile = updated.tiles.find((t) => t.x === x && t.y === y);
        if (tile) tile.isRevealed = true;
      }
    }
  }

  return updated;
}

// Draw room (rectangle of tiles)
export function drawRoom(
  map: DungeonMap,
  startX: number,
  startY: number,
  width: number,
  height: number,
  wallType: TileType = 'wall',
  fillType: TileType = 'empty'
): DungeonMap {
  const updated = { ...map };

  for (let x = startX; x < startX + width && x < map.width; x++) {
    for (let y = startY; y < startY + height && y < map.height; y++) {
      const isEdge = x === startX || x === startX + width - 1 || y === startY || y === startY + height - 1;
      const tile = updated.tiles.find((t) => t.x === x && t.y === y);

      if (tile) {
        tile.type = isEdge ? wallType : fillType;
      }
    }
  }

  return updated;
}

// Create corridor (line of empty tiles)
export function createCorridor(
  map: DungeonMap,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  width: number = 1
): DungeonMap {
  const updated = { ...map };

  // Horizontal then vertical movement (L-shaped corridor)
  const points: Array<[number, number]> = [];

  // Horizontal
  if (x1 < x2) {
    for (let x = x1; x <= x2; x++) points.push([x, y1]);
  } else {
    for (let x = x1; x >= x2; x--) points.push([x, y1]);
  }

  // Vertical (skip starting point to avoid duplication)
  if (y1 < y2) {
    for (let y = y1 + 1; y <= y2; y++) points.push([x2, y]);
  } else {
    for (let y = y1 - 1; y >= y2; y--) points.push([x2, y]);
  }

  // Apply width to corridor
  points.forEach(([x, y]) => {
    for (let dx = -Math.floor(width / 2); dx <= Math.floor(width / 2); dx++) {
      const px = x + dx;
      if (px >= 0 && px < map.width && y >= 0 && y < map.height) {
        const tile = updated.tiles.find((t) => t.x === px && t.y === y);
        if (tile && tile.type === 'wall') {
          tile.type = 'empty';
        }
      }
    }
  });

  return updated;
}

// Get tiles by type
export function getTilesByType(map: DungeonMap, type: TileType): Tile[] {
  return map.tiles.filter((t) => t.type === type);
}

// Check line of sight between two points
export function hasLineOfSight(map: DungeonMap, x1: number, y1: number, x2: number, y2: number): boolean {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const stepX = x1 < x2 ? 1 : -1;
  const stepY = y1 < y2 ? 1 : -1;

  let x = x1;
  let y = y1;
  let err = dx - dy;

  while (x !== x2 || y !== y2) {
    const tile = map.tiles.find((t) => t.x === x && t.y === y);
    if (tile && (tile.type === 'wall' || tile.type === 'door')) {
      return false;
    }

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += stepX;
    }
    if (e2 < dx) {
      err += dx;
      y += stepY;
    }
  }

  return true;
}

// Export map as JSON
export function exportMapJSON(map: DungeonMap): string {
  return JSON.stringify(map, null, 2);
}

// Import map from JSON
export function importMapJSON(json: string): DungeonMap {
  return JSON.parse(json);
}

// Generate random dungeon (simple)
export function generateRandomDungeon(width: number, height: number): DungeonMap {
  const map = createEmptyMap(width, height);

  // Create outer walls
  for (let x = 0; x < width; x++) {
    setTile(map, x, 0, 'wall');
    setTile(map, x, height - 1, 'wall');
  }

  for (let y = 0; y < height; y++) {
    setTile(map, 0, y, 'wall');
    setTile(map, width - 1, y, 'wall');
  }

  return map;
}
