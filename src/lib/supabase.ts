import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('supabaseUrl:', supabaseUrl);
console.log('supabaseAnonKey:', supabaseAnonKey ? 'SET' : 'UNDEFINED');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(`Missing Supabase env vars:
    - VITE_SUPABASE_URL: ${supabaseUrl ? 'SET' : 'UNDEFINED'}
    - VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'SET' : 'UNDEFINED'}
  `);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
