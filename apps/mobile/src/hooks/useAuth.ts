import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { authService, DEMO_VIP_USER } from '../services/auth.service';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Fetch initial session
    authService
      .getSession()
      .then((sess) => {
        if (isMounted) {
          setSession(sess);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSession(null);
          setLoading(false);
        }
      });

    // Listen for auth events (SIGNED_IN, SIGNED_OUT, etc.)
    const { data: { subscription } } = authService.onAuthStateChange((_event, newSession) => {
      if (isMounted) {
        setSession(newSession);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const user: User | null = session?.user ?? (session ? (DEMO_VIP_USER as any) : null);

  return { session, user, loading };
}
