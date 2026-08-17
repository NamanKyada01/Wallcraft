import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { authService } from '../services/auth.service';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getSession().then((session) => {
      setSession(session);
      setLoading(false);
    });

    const { data: subscription } = authService.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, user: session?.user ?? null, loading };
}
