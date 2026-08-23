import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const store = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      await useAuthStore.getState().checkAuth();

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        useAuthStore.getState().setUser(session?.user || null);
      });

      return () => {
        subscription?.unsubscribe();
      };
    };

    initAuth();
  }, []);

  return store;
};
