// Campaign world builder and management

export interface World {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  continents: Continent[];
  isPublic: boolean;
  followers: number;
  versions: WorldVersion[];
}

export interface WorldVersion {
  id: string;
  versionNumber: number;
  timestamp: Date;
  changes: string;
}

export interface Continent {
  id: string;
  name: string;
  description: string;
  size: "small" | "medium" | "large";
  climate: string;
  regions: Region[];
  coordinates: {
    x: number;
    y: number;
  };
}

export interface Region {
  id: string;
  continentId: string;
  name: string;
  description: string;
  terrain: "mountains" | "forest" | "desert" | "plains" | "swamp" | "tundra" | "coast";
  settlements: Settlement[];
  landmarks: Landmark[];
  dangers: string[];
}

export interface Settlement {
  id: string;
  regionId: string;
  name: string;
  population: number;
  government: string;
  leader: string;
  description: string;
  type: "city" | "town" | "village" | "outpost" | "fort";
  districts: District[];
  resources: string[];
  tradingPartners: string[];
}

export interface District {
  name: string;
  description: string;
  population: number;
  type: "merchant" | "noble" | "poor" | "military" | "religious" | "industrial";
}

export interface Landmark {
  id: string;
  name: string;
  description: string;
  type: "mountain" | "dungeon" | "temple" | "ruin" | "natural";
  difficulty: "easy" | "medium" | "hard" | "deadly";
  history: string;
}

export interface WorldFaction {
  id: string;
  worldId: string;
  name: string;
  description: string;
  leader: string;
  alignment: string;
  goals: string[];
  allies: string[];
  enemies: string[];
  influence: number;
}

export function createWorld(
  name: string,
  description: string,
  createdBy: string
): World {
  return {
    id: `world_${Date.now()}`,
    name,
    description,
    createdBy,
    createdAt: new Date(),
    updatedAt: new Date(),
    continents: [],
    isPublic: false,
    followers: 0,
    versions: [],
  };
}

export function addContinent(
  world: World,
  name: string,
  size: Continent["size"],
  climate: string
): World {
  const continent: Continent = {
    id: `continent_${Date.now()}`,
    name,
    description: "",
    size,
    climate,
    regions: [],
    coordinates: {
      x: Math.floor(Math.random() * 1000),
      y: Math.floor(Math.random() * 1000),
    },
  };

  return {
    ...world,
    continents: [...world.continents, continent],
    updatedAt: new Date(),
  };
}

export function addRegion(
  continent: Continent,
  name: string,
  terrain: Region["terrain"],
  description: string
): Continent {
  const region: Region = {
    id: `region_${Date.now()}`,
    continentId: continent.id,
    name,
    description,
    terrain,
    settlements: [],
    landmarks: [],
    dangers: [],
  };

  return {
    ...continent,
    regions: [...continent.regions, region],
  };
}

export function addSettlement(
  region: Region,
  name: string,
  population: number,
  type: Settlement["type"],
  leader: string
): Region {
  const settlement: Settlement = {
    id: `settlement_${Date.now()}`,
    regionId: region.id,
    name,
    population,
    government: "Unknown",
    leader,
    description: "",
    type,
    districts: [],
    resources: [],
    tradingPartners: [],
  };

  return {
    ...region,
    settlements: [...region.settlements, settlement],
  };
}

export function addLandmark(
  region: Region,
  name: string,
  type: Landmark["type"],
  difficulty: Landmark["difficulty"],
  description: string
): Region {
  const landmark: Landmark = {
    id: `landmark_${Date.now()}`,
    name,
    description,
    type,
    difficulty,
    history: "",
  };

  return {
    ...region,
    landmarks: [...region.landmarks, landmark],
  };
}

export function createWorldFaction(
  worldId: string,
  name: string,
  description: string,
  leader: string
): WorldFaction {
  return {
    id: `faction_${Date.now()}`,
    worldId,
    name,
    description,
    leader,
    alignment: "Neutral",
    goals: [],
    allies: [],
    enemies: [],
    influence: 50,
  };
}

export function getWorldStatistics(world: World) {
  let totalContinents = world.continents.length;
  let totalRegions = 0;
  let totalSettlements = 0;
  let totalLandmarks = 0;
  let totalPopulation = 0;

  world.continents.forEach((continent) => {
    totalRegions += continent.regions.length;
    continent.regions.forEach((region) => {
      totalSettlements += region.settlements.length;
      totalLandmarks += region.landmarks.length;
      region.settlements.forEach((settlement) => {
        totalPopulation += settlement.population;
      });
    });
  });

  return {
    totalContinents,
    totalRegions,
    totalSettlements,
    totalLandmarks,
    totalPopulation,
  };
}

export function exportWorldJSON(world: World): string {
  return JSON.stringify(world, null, 2);
}

export function publishWorld(world: World): World {
  return {
    ...world,
    isPublic: true,
    updatedAt: new Date(),
  };
}

export function followWorld(world: World): World {
  return {
    ...world,
    followers: world.followers + 1,
  };
}
