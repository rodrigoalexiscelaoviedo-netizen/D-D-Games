// Imagen de cada criatura según su tipo (Open5e/SRD). Fotos en /public/bestiario.
// Créditos: ver public/bestiario/CREDITOS.md

const BY_TYPE: Record<string, string> = {
  dragon: 'dragon',
  undead: 'no-muerto',
  beast: 'bestia',
  fiend: 'demonio',
  elemental: 'elemental',
  giant: 'gigante',
  monstrosity: 'aberracion',
  aberration: 'aberracion',
  construct: 'constructo',
  celestial: 'celestial',
  humanoid: 'humanoide',
  plant: 'planta',
  fey: 'planta',
  ooze: 'constructo',
  swarm: 'bestia',
};

export function creatureImage(type?: string | null): string {
  const key = (type ?? '').toLowerCase();
  const match = Object.keys(BY_TYPE).find((t) => key.includes(t));
  return `/bestiario/${match ? BY_TYPE[match] : 'bestia'}.jpg`;
}
