#!/usr/bin/env node

/**
 * Transform 5e-SRD-Monsters.json to SQL INSERT statements
 *
 * Uso: node scripts/transform-srd-monsters.js > sql/load_bestiary_srd_generated.sql
 *
 * Requiere:
 * - Bajar https://raw.githubusercontent.com/5e-bits/5e-database/main/src/2014/5e-SRD-Monsters.json
 * - Guardarlo como sql/5e-SRD-Monsters.json
 */

const fs = require('fs');
const path = require('path');

// Generar slug para portrait_seed
const generateSeed = (name) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Extraer datos de ataque (damage_dice y attack_bonus) de actions
const extractAttackStats = (actions) => {
  if (!actions || !Array.isArray(actions)) {
    return { damage_dice: 6, attack_bonus: 2 };
  }

  for (const action of actions) {
    if (action.name && action.name.toLowerCase().includes('attack')) {
      // Buscar damage dice en el texto de la acción
      const damageMatch = action.description?.match(/(\d+)d(\d+)/);
      const bonusMatch = action.description?.match(/\+(\d+)/);

      if (damageMatch) {
        const damage_dice = parseInt(damageMatch[2], 10);
        const attack_bonus = bonusMatch ? parseInt(bonusMatch[1], 10) : 2;
        return { damage_dice, attack_bonus };
      }
    }
  }

  return { damage_dice: 6, attack_bonus: 2 };
};

// Traducir nombres (muy básico - requiere manual review)
const translateName = (name) => {
  const translations = {
    'Aarakocra': 'Aarakocra',
    'Aboleth': 'Aboleth',
    'Acolyte': 'Acólito',
    'Adult Black Dragon': 'Dragón Negro Adulto',
    'Ant Giant': 'Hormiga Gigante',
    'Ape': 'Mono',
    'Assassin': 'Asesino',
    'Badger': 'Tejón',
    'Bandit': 'Bandido',
    'Basilisk': 'Basilisco',
    'Bat': 'Murciélago',
    'Bear Brown': 'Oso Pardo',
    'Beetle Giant': 'Escarabajo Gigante',
    'Berserker': 'Bersérker',
    'Black Dragon Wyrmling': 'Dragón Negro Dragonete',
    'Boar': 'Jabalí',
    'Bone Devil': 'Diablo de Hueso',
    'Brass Dragon Wyrmling': 'Dragón Latón Dragonete',
    // ... agregar más según sea necesario
  };

  return translations[name] || name;
};

// Leer JSON (el usuario debe descargarlo primero)
const jsonPath = path.join(__dirname, '..', 'sql', '5e-SRD-Monsters.json');

if (!fs.existsSync(jsonPath)) {
  console.error(`❌ No encontrado: ${jsonPath}`);
  console.error('Pasos:');
  console.error('1. Bajar: https://raw.githubusercontent.com/5e-bits/5e-database/main/src/2014/5e-SRD-Monsters.json');
  console.error('2. Guardar como: sql/5e-SRD-Monsters.json');
  console.error('3. Ejecutar: node scripts/transform-srd-monsters.js');
  process.exit(1);
}

let monsters;
try {
  const raw = fs.readFileSync(jsonPath, 'utf8');
  monsters = JSON.parse(raw);
} catch (error) {
  console.error(`❌ Error leyendo JSON: ${error.message}`);
  process.exit(1);
}

// Filtrar por CR 0-5
const filtered = monsters.filter((m) => {
  const cr = parseFloat(m.challengeRating || 0);
  return cr >= 0 && cr <= 5;
});

console.log(`-- Generated SRD Bestiary SQL`);
console.log(`-- Fecha: ${new Date().toISOString()}`);
console.log(`-- Monstruos CR 0-5: ${filtered.length} de ${monsters.length}`);
console.log(``);

console.log(`INSERT INTO public.bestiary (`);
console.log(`  name, hp, armor_class, dexterity, damage_dice, attack_bonus,`);
console.log(`  description, xp_value, challenge_rating, source, user_id, portrait_seed`);
console.log(`)`);
console.log(`VALUES`);

const values = filtered.map((m, idx) => {
  const { damage_dice, attack_bonus } = extractAttackStats(m.actions);
  const seed = generateSeed(m.name);
  const name = translateName(m.name).replace(/'/g, "''"); // Escape single quotes
  const description = (m.senses || m.skills || '').substring(0, 200).replace(/'/g, "''");
  const xp = m.experiencePoints || 0;
  const cr = m.challengeRating || 0;

  const comma = idx < filtered.length - 1 ? ',' : '';

  return (
    `  (${[
      `'${name}'`,
      m.hitPoints || 1,
      m.armorClass || 10,
      m.abilityScores?.dexterity || 10,
      damage_dice,
      attack_bonus,
      `'${description}'`,
      xp,
      cr,
      `'srd'`,
      `NULL`,
      `'${seed}'`
    ].join(', ')})${comma}`
  );
});

console.log(values.join('\n'));
console.log(`;`);
console.log(``);
console.log(`-- Verificación:`);
console.log(`SELECT COUNT(*) as total_srd, MIN(challenge_rating) as min_cr, MAX(challenge_rating) as max_cr`);
console.log(`FROM public.bestiary WHERE source = 'srd';`);
