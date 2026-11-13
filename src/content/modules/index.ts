import type { AdventureModule, ModuleScene } from './types';
import { campanasValdehierro } from './campanas-valdehierro';
import { caminoAhorcados } from './camino-ahorcados';
import { torreAstronomo } from './torre-astronomo';

export type { AdventureModule, ModuleScene } from './types';

/** Orden de campaña: cada módulo engancha con el siguiente. */
export const MODULES: AdventureModule[] = [campanasValdehierro, caminoAhorcados, torreAstronomo];

const ORIGIN_PREFIX = 'module:';

export const moduleOrigin = (slug: string) => `${ORIGIN_PREFIX}${slug}`;

export function findModuleByOrigin(origin?: string | null): AdventureModule | undefined {
  if (!origin?.startsWith(ORIGIN_PREFIX)) return undefined;
  const slug = origin.slice(ORIGIN_PREFIX.length);
  return MODULES.find((m) => m.slug === slug);
}

export function findModuleScene(origin: string | null | undefined, sceneOrder: number): ModuleScene | undefined {
  return findModuleByOrigin(origin)?.scenes.find((s) => s.order === sceneOrder);
}

/** Errores de integridad de un módulo (enlaces rotos, combates mal formados…). */
export function validateModule(mod: AdventureModule): string[] {
  const errors: string[] = [];
  const keys = new Set(mod.scenes.map((s) => s.key));
  const orders = new Set<number>();
  const monsterNames = new Set(mod.monsters.map((m) => m.name));
  const setFlags = new Set(mod.scenes.flatMap((s) => s.options.map((o) => o.setsFlag).filter(Boolean)));

  for (const s of mod.scenes) {
    if (orders.has(s.order)) errors.push(`${s.key}: scene order ${s.order} duplicado`);
    orders.add(s.order);
    if (s.type === 'combate') {
      if (!s.encounter) errors.push(`${s.key}: combate sin encuentro`);
      if (s.options.length !== 2) errors.push(`${s.key}: un combate necesita exactamente 2 opciones (victoria, derrota)`);
    }
    if (s.encounter && !monsterNames.has(s.encounter.monster)) {
      errors.push(`${s.key}: monstruo "${s.encounter.monster}" no está en module.monsters`);
    }
    if (s.type !== 'combate' && s.options.length > 0 && s.options.every((o) => o.requiresFlag)) {
      errors.push(`${s.key}: todas las opciones requieren flag; la escena podría quedar sin salida`);
    }
    for (const o of s.options) {
      if (o.to === null) errors.push(`${s.key}: opción "${o.label}" sin destino`);
      else if (!keys.has(o.to)) errors.push(`${s.key}: destino "${o.to}" no existe`);
      if (o.requiresFlag && !setFlags.has(o.requiresFlag)) {
        errors.push(`${s.key}: flag "${o.requiresFlag}" nunca se activa`);
      }
    }
  }
  return errors;
}
