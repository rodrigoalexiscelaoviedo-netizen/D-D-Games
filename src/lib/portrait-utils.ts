import { getAvatarUrl } from './avatar-styles';

/**
 * Genera un slug para DiceBear a partir de un nombre.
 * Elimina tildes, espacios, caracteres especiales.
 */
export const generatePortraitSeed = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // Elimina tildes
    .replace(/[^a-z0-9]+/g, '-') // Reemplaza no-alfanuméricos con guiones
    .replace(/^-+|-+$/g, ''); // Elimina guiones al inicio/final
};

/**
 * Obtiene URL de retrato usando seed si existe, o genera uno del nombre.
 */
export const getPortraitUrl = (portraitSeed?: string | null, name?: string): string => {
  const seed = portraitSeed || (name ? generatePortraitSeed(name) : 'default');
  return getAvatarUrl(seed);
};

/**
 * Hook de ayuda para componentes que renderizan retratos.
 * Si no hay portrait_seed, genera uno del nombre.
 */
export const usePortrait = (portraitSeed?: string | null, name?: string): string => {
  return getPortraitUrl(portraitSeed, name);
};
