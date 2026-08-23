import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const store = useAuthStore();

  useEffect(() => {
    (async () => {
      await store.checkAuth();
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      store.setUser(session?.user || null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [store]);

  return store;
};
