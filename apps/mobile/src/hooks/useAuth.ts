import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { authService } from '../services/auth.service';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    authService
      .getSession()
      .then((sess) => {
        if (isMounted) {
          setSession(sess);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Session check skipped:', err);
        if (isMounted) setLoading(false);
      });

    try {
      const { data } = authService.onAuthStateChange(
        (_event: string | null, newSession: Session | null) => {
          if (isMounted) setSession(newSession);
        },
      );
      return () => {
        isMounted = false;
        data?.subscription?.unsubscribe?.();
      };
    } catch {
      if (isMounted) setLoading(false);
    }
  }, []);

  return { session, user: session?.user ?? null, loading };
}
