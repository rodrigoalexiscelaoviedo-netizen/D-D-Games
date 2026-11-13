// Custom macros system for D&D VTT

export type MacroType = 'script' | 'chat' | 'dice' | 'ability';

export interface Macro {
  id: string;
  name: string;
  type: MacroType;
  code: string;
  description?: string;
  icon?: string;
  color?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  folder?: string;
  isPublic?: boolean;
}

export interface MacroFolder {
  id: string;
  name: string;
  macros: Macro[];
  subfolders?: MacroFolder[];
}

export interface MacroContext {
  actor?: any;
  token?: any;
  scene?: any;
  user?: any;
  data?: Record<string, any>;
}

export interface MacroResult {
  success: boolean;
  output?: any;
  error?: string;
  executionTime: number;
}

// Macro templates for common actions
export const MACRO_TEMPLATES: Record<string, Partial<Macro>> = {
  // Dice rolls
  'roll-d20': {
    name: 'Roll d20',
    type: 'dice',
    code: 'return Math.floor(Math.random() * 20) + 1;',
    icon: '🎲',
    color: '#4ade80',
  },
  'roll-damage': {
    name: 'Roll Damage',
    type: 'dice',
    code: 'const diceRoll = Math.floor(Math.random() * 8) + 1; return diceRoll + 3;',
    icon: '⚔️',
    color: '#ef4444',
  },

  // Chat macros
  'emote': {
    name: 'Emote',
    type: 'chat',
    code: 'return `/me ${actor?.name} performs an action...`;',
    icon: '💬',
    color: '#0ea5e9',
  },
  'cast-spell': {
    name: 'Cast Spell',
    type: 'chat',
    code: 'return `/cast ${actor?.name} uses a powerful spell!`;',
    icon: '✨',
    color: '#a855f7',
  },

  // Ability macros
  'stealth-check': {
    name: 'Stealth Check',
    type: 'ability',
    code: 'const roll = Math.floor(Math.random() * 20) + 1; return { roll, modifier: 3, total: roll + 3 };',
    icon: '👻',
    color: '#64748b',
  },
  'perception-check': {
    name: 'Perception Check',
    type: 'ability',
    code: 'const roll = Math.floor(Math.random() * 20) + 1; return { roll, modifier: 2, total: roll + 2 };',
    icon: '👁️',
    color: '#f59e0b',
  },
};

// Create macro
export function createMacro(
  name: string,
  type: MacroType,
  code: string,
  createdBy: string
): Macro {
  return {
    id: `macro_${Date.now()}`,
    name,
    type,
    code,
    createdBy,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Execute macro
export function executeMacro(macro: Macro, context: MacroContext = {}): MacroResult {
  const startTime = performance.now();

  try {
    // Create safe context for macro execution
    const safeContext = {
      actor: context.actor,
      token: context.token,
      scene: context.scene,
      user: context.user,
      data: context.data || {},
      Math,
      console: { log: () => {} }, // Disable console for safety
    };

    // Create function from macro code
    const fn = new Function('actor', 'token', 'scene', 'user', 'data', 'Math', macro.code);
    const result = fn(
      safeContext.actor,
      safeContext.token,
      safeContext.scene,
      safeContext.user,
      safeContext.data,
      Math
    );

    const executionTime = performance.now() - startTime;

    return {
      success: true,
      output: result,
      executionTime,
    };
  } catch (error) {
    const executionTime = performance.now() - startTime;
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      executionTime,
    };
  }
}

// Parse macro code for variables
export function extractVariablesFromCode(code: string): string[] {
  const regex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
  const variables = new Set<string>();
  let match;

  while ((match = regex.exec(code)) !== null) {
    variables.add(match[0]);
  }

  return Array.from(variables).filter(
    (v) => !['actor', 'token', 'scene', 'user', 'data', 'Math', 'console', 'return'].includes(v)
  );
}

// Validate macro code
export function validateMacroCode(code: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for dangerous code
  if (code.includes('eval(') || code.includes('Function(')) {
    errors.push('Cannot use eval or Function constructor');
  }

  if (code.includes('require(') || code.includes('import(')) {
    errors.push('Cannot use require or import');
  }

  if (code.includes('fetch(') || code.includes('XMLHttpRequest')) {
    errors.push('Cannot make HTTP requests');
  }

  // Try to parse as valid JavaScript
  try {
    new Function(code);
  } catch (e) {
    errors.push(`Syntax error: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Create macro folder
export function createMacroFolder(name: string): MacroFolder {
  return {
    id: `folder_${Date.now()}`,
    name,
    macros: [],
    subfolders: [],
  };
}

// Add macro to folder
export function addMacroToFolder(folder: MacroFolder, macro: Macro): MacroFolder {
  return {
    ...folder,
    macros: [...folder.macros, macro],
  };
}

// Remove macro from folder
export function removeMacroFromFolder(folder: MacroFolder, macroId: string): MacroFolder {
  return {
    ...folder,
    macros: folder.macros.filter((m) => m.id !== macroId),
  };
}

// Search macros
export function searchMacros(macros: Macro[], query: string): Macro[] {
  const lowerQuery = query.toLowerCase();
  return macros.filter(
    (m) =>
      m.name.toLowerCase().includes(lowerQuery) ||
      m.description?.toLowerCase().includes(lowerQuery) ||
      m.code.toLowerCase().includes(lowerQuery)
  );
}

// Get macro by type
export function getMacrosByType(macros: Macro[], type: MacroType): Macro[] {
  return macros.filter((m) => m.type === type);
}

// Export macros as JSON
export function exportMacrosJSON(macros: Macro[]): string {
  return JSON.stringify(macros, null, 2);
}

// Import macros from JSON
export function importMacrosJSON(json: string): Macro[] {
  try {
    const data = JSON.parse(json);
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    throw new Error('Invalid macro JSON format');
  }
}
