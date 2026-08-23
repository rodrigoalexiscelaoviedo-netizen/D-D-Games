import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: any | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  checkAuth: async () => {
    try {
      const { data } = await supabase.auth.getSession();
      set({ user: data.session?.user || null, loading: false });
    } finally {
      set({ loading: false });
    }
  },

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    set({ user: data.user });
  },

  signup: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    set({ user: data.user });
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));
