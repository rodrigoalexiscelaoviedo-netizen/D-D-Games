// D&D 5e Spells Database - Open source SRD spells

export interface Spell {
  id?: string;
  name: string;
  level: number;
  school: 'Abjuration' | 'Conjuration' | 'Divination' | 'Enchantment' | 'Evocation' | 'Illusion' | 'Necromancy' | 'Transmutation';
  casting_time: string;
  range: string;
  components: string[];
  duration: string;
  description: string;
  classes: string[];
  ritual: boolean;
  concentration: boolean;
  damage_type?: string;
}

export const SPELL_SEED_DATA: Spell[] = [
  // Cantrips (Level 0)
  {
    name: 'Fire Bolt',
    level: 0,
    school: 'Evocation',
    casting_time: '1 action',
    range: '120 feet',
    components: ['V', 'S'],
    duration: 'Instantaneous',
    description: 'You hurl a mote of fire at a creature or flammable object within range.',
    classes: ['Sorcerer', 'Wizard'],
    ritual: false,
    concentration: false,
    damage_type: 'Fire',
  },
  {
    name: 'Mage Hand',
    level: 0,
    school: 'Conjuration',
    casting_time: '1 action',
    range: '30 feet',
    components: ['V', 'S'],
    duration: 'Concentration, up to 1 minute',
    description: 'You conjure a spectral hand to manipulate objects.',
    classes: ['Bard', 'Sorcerer', 'Wizard'],
    ritual: false,
    concentration: true,
  },
  {
    name: 'Light',
    level: 0,
    school: 'Evocation',
    casting_time: '1 action',
    range: 'Touch',
    components: ['V', 'M'],
    duration: '1 hour',
    description: 'You touch an object to make it emit bright light.',
    classes: ['Bard', 'Cleric', 'Sorcerer', 'Wizard'],
    ritual: false,
    concentration: false,
  },
  {
    name: 'Prestidigitation',
    level: 0,
    school: 'Transmutation',
    casting_time: '1 action',
    range: '10 feet',
    components: ['V', 'S'],
    duration: 'Up to 1 hour',
    description: 'You perform a magical sleight of hand to produce minor magical effects.',
    classes: ['Bard', 'Sorcerer', 'Wizard'],
    ritual: false,
    concentration: false,
  },

  // Level 1
  {
    name: 'Magic Missile',
    level: 1,
    school: 'Evocation',
    casting_time: '1 action',
    range: '60 feet',
    components: ['V', 'S'],
    duration: 'Instantaneous',
    description: 'You hurl multiple glowing darts of magical force at creatures you can see.',
    classes: ['Sorcerer', 'Wizard'],
    ritual: false,
    concentration: false,
    damage_type: 'Force',
  },
  {
    name: 'Fireball',
    level: 3,
    school: 'Evocation',
    casting_time: '1 action',
    range: '150 feet',
    components: ['V', 'S', 'M'],
    duration: 'Instantaneous',
    description: 'A bright streak flashes from your pointing finger to a point you choose within range.',
    classes: ['Sorcerer', 'Wizard'],
    ritual: false,
    concentration: false,
    damage_type: 'Fire',
  },
  {
    name: 'Cure Wounds',
    level: 1,
    school: 'Evocation',
    casting_time: '1 action',
    range: 'Touch',
    components: ['V', 'S'],
    duration: 'Instantaneous',
    description: 'A creature you touch regains a number of hit points.',
    classes: ['Bard', 'Cleric', 'Druid', 'Monk', 'Paladin', 'Ranger'],
    ritual: false,
    concentration: false,
  },
  {
    name: 'Detect Magic',
    level: 1,
    school: 'Divination',
    casting_time: '1 action',
    range: 'Self',
    components: ['V', 'S'],
    duration: 'Concentration, up to 10 minutes',
    description: 'For the spell\'s duration, you sense the presence of magic.',
    classes: ['Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Sorcerer', 'Wizard'],
    ritual: true,
    concentration: true,
  },
  {
    name: 'Shield of Faith',
    level: 1,
    school: 'Abjuration',
    casting_time: '1 bonus action',
    range: '60 feet',
    components: ['V', 'S', 'M'],
    duration: 'Concentration, up to 10 minutes',
    description: 'A shimmering shield appears and protects a creature of your choice.',
    classes: ['Cleric', 'Paladin'],
    ritual: false,
    concentration: true,
  },
  {
    name: 'Mage Armor',
    level: 1,
    school: 'Abjuration',
    casting_time: '1 action',
    range: 'Touch',
    components: ['V', 'S', 'M'],
    duration: '8 hours',
    description: 'You touch a willing creature who isn\'t wearing armor.',
    classes: ['Sorcerer', 'Wizard'],
    ritual: false,
    concentration: false,
  },
  {
    name: 'Invisibility',
    level: 2,
    school: 'Illusion',
    casting_time: '1 action',
    range: 'Touch',
    components: ['V', 'S', 'M'],
    duration: 'Concentration, up to 1 hour',
    description: 'A creature you touch becomes invisible until the spell ends.',
    classes: ['Bard', 'Sorcerer', 'Wizard'],
    ritual: false,
    concentration: true,
  },
  {
    name: 'Counterspell',
    level: 3,
    school: 'Abjuration',
    casting_time: '1 reaction',
    range: '60 feet',
    components: ['S'],
    duration: 'Instantaneous',
    description: 'You attempt to interrupt a creature in the process of casting a spell.',
    classes: ['Sorcerer', 'Wizard'],
    ritual: false,
    concentration: false,
  },
  {
    name: 'Teleport',
    level: 7,
    school: 'Conjuration',
    casting_time: '1 action',
    range: '10 feet',
    components: ['V', 'S'],
    duration: 'Instantaneous',
    description: 'This spell instantly transports you and up to eight willing creatures you can see.',
    classes: ['Bard', 'Sorcerer', 'Wizard'],
    ritual: false,
    concentration: false,
  },
];

export async function seedSpells(supabase: any) {
  try {
    const spells = SPELL_SEED_DATA.map((spell) => ({
      ...spell,
      components: JSON.stringify(spell.components),
      classes: JSON.stringify(spell.classes),
      created_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('spells').insert(spells);
    if (error) throw error;

    console.log(`✅ Seeded ${spells.length} spells`);
    return spells;
  } catch (error) {
    console.error('Error seeding spells:', error);
    throw error;
  }
}
