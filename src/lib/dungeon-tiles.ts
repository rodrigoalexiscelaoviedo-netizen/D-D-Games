// Dungeon tiles and map assets management

export type TileCategory = "wall" | "floor" | "door" | "stair" | "pit" | "trap" | "water" | "terrain" | "deco";
export type TileSize = "5ft" | "10ft" | "20ft";

export interface DungeonTile {
  id: string;
  name: string;
  category: TileCategory;
  size: TileSize;
  imageUrl: string;
  isWalkable: boolean;
  isTransparent: boolean;
  blocksLight: boolean;
  blocksVision: boolean;
  cost: number;
  tags: string[];
  rotatable: boolean;
  flipable: boolean;
  variants: string[];
}

export interface TileSet {
  id: string;
  name: string;
  description: string;
  author: string;
  tiles: DungeonTile[];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  downloads: number;
  rating: number;
  theme: string;
}

export interface TileLayer {
  id: string;
  name: string;
  tiles: Array<{
    x: number;
    y: number;
    tileId: string;
    rotation: number;
    flipped: boolean;
  }>;
  opacity: number;
  isVisible: boolean;
}

export interface DungeonMapDesign {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  tileSize: TileSize;
  layers: TileLayer[];
  usedTileSets: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export function createTileSet(
  name: string,
  description: string,
  author: string,
  theme: string
): TileSet {
  return {
    id: `tileset_${Date.now()}`,
    name,
    description,
    author,
    tiles: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isPublic: false,
    downloads: 0,
    rating: 0,
    theme,
  };
}

export function createDungeonMapDesign(
  name: string,
  width: number,
  height: number,
  createdBy: string
): DungeonMapDesign {
  return {
    id: `map_${Date.now()}`,
    name,
    description: "",
    width,
    height,
    tileSize: "5ft",
    layers: [
      {
        id: `layer_${Date.now()}`,
        name: "Base Layer",
        tiles: [],
        opacity: 1,
        isVisible: true,
      },
    ],
    usedTileSets: [],
    createdBy,
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: [],
  };
}

export function addTileToLayer(
  layer: TileLayer,
  tileId: string,
  x: number,
  y: number,
  rotation: number = 0,
  flipped: boolean = false
): TileLayer {
  return {
    ...layer,
    tiles: [
      ...layer.tiles,
      { x, y, tileId, rotation, flipped },
    ],
  };
}

export function getTileAtPosition(layer: TileLayer, x: number, y: number) {
  return layer.tiles.find((t) => t.x === x && t.y === y);
}

export function searchTileSets(
  tileSets: TileSet[],
  query: string,
  theme?: string
): TileSet[] {
  let results = tileSets.filter((ts) => ts.isPublic);

  if (query.trim()) {
    const lower = query.toLowerCase();
    results = results.filter(
      (ts) =>
        ts.name.toLowerCase().includes(lower) ||
        ts.description.toLowerCase().includes(lower)
    );
  }

  if (theme) {
    results = results.filter((ts) => ts.theme === theme);
  }

  return results.sort((a, b) => b.downloads - a.downloads);
}

export function calculateMapSize(map: DungeonMapDesign) {
  const sizeMultiplier = map.tileSize === "5ft" ? 1 : map.tileSize === "10ft" ? 2 : 4;
  return {
    width: map.width * 5 * sizeMultiplier,
    height: map.height * 5 * sizeMultiplier,
  };
}

export function exportMapJSON(map: DungeonMapDesign): string {
  return JSON.stringify(map, null, 2);
}
