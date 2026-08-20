import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from './supabase';
import type { User } from '../types';

const LOCAL_SESSION_KEY = 'wallcraft_auth_session';

export const DEMO_VIP_USER = {
  id: 'demo-user-vip',
  app_metadata: {},
  user_metadata: {
    full_name: 'Alex Rivera',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
  },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'alex.creator@wallcraft.vip',
  phone: '',
  role: 'authenticated',
  updated_at: new Date().toISOString(),
};

type AuthListener = (event: string, session: any) => void;
const subscribers: Set<AuthListener> = new Set();

function notifySubscribers(event: string, session: any) {
  subscribers.forEach((cb) => {
    try {
      cb(event, session);
    } catch {
      // ignore callback errors
    }
  });
}

export const authService = {
  async signUp(email: string, password: string, fullName: string) {
    if (!isSupabaseConfigured) {
      const demoSession = {
        access_token: 'demo-token-' + Date.now(),
        refresh_token: 'demo-refresh-' + Date.now(),
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          ...DEMO_VIP_USER,
          id: 'user-' + Date.now(),
          email,
          user_metadata: { full_name: fullName },
        },
      };
      await AsyncStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(demoSession));
      notifySubscribers('SIGNED_IN', demoSession);
      return demoSession;
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    if (data.session) {
      await AsyncStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(data.session));
      notifySubscribers('SIGNED_IN', data.session);
    }
    return data;
  },

  async signIn(email: string, password?: string) {
    if (!isSupabaseConfigured) {
      const demoSession = {
        access_token: 'demo-token-' + Date.now(),
        refresh_token: 'demo-refresh-' + Date.now(),
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          ...DEMO_VIP_USER,
          email: email || DEMO_VIP_USER.email,
          user_metadata: {
            full_name: email ? email.split('@')[0] : DEMO_VIP_USER.user_metadata.full_name,
          },
        },
      };
      await AsyncStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(demoSession));
      notifySubscribers('SIGNED_IN', demoSession);
      return demoSession;
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: password || 'Wallcraft2026!',
    });
    if (error) throw error;
    if (data.session) {
      await AsyncStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(data.session));
      notifySubscribers('SIGNED_IN', data.session);
    }
    return data;
  },

  async signInDemo() {
    const demoSession = {
      access_token: 'demo-token-' + Date.now(),
      refresh_token: 'demo-refresh-' + Date.now(),
      expires_in: 3600,
      token_type: 'bearer',
      user: DEMO_VIP_USER,
    };
    await AsyncStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(demoSession));
    notifySubscribers('SIGNED_IN', demoSession);
    return demoSession;
  },

  async sendOtp(email: string, type: 'signup' | 'login' | 'recovery' = 'login') {
    if (!isSupabaseConfigured) {
      return { success: true, message: 'Demo OTP: 123456' };
    }
    try {
      if (type === 'recovery') {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
      }
      return { success: true };
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to send OTP code.');
    }
  },

  async verifyOtp(email: string, token: string, type: 'signup' | 'login' | 'recovery' = 'login') {
    if (!isSupabaseConfigured) {
      if (token.length === 6) {
        const demoSession = {
          access_token: 'demo-token-' + Date.now(),
          refresh_token: 'demo-refresh-' + Date.now(),
          expires_in: 3600,
          token_type: 'bearer',
          user: {
            ...DEMO_VIP_USER,
            email,
          },
        };
        await AsyncStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(demoSession));
        notifySubscribers('SIGNED_IN', demoSession);
        return { success: true, session: demoSession };
      }
      throw new Error('Invalid verification code. Please enter 6 digits (e.g. 123456).');
    }
    try {
      const otpType = type === 'recovery' ? 'recovery' : type === 'signup' ? 'signup' : 'email';
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: otpType as any,
      });
      if (error) throw error;
      if (data.session) {
        await AsyncStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(data.session));
        notifySubscribers('SIGNED_IN', data.session);
      }
      return data;
    } catch (err: any) {
      throw new Error(err?.message || 'Invalid or expired OTP code.');
    }
  },

  async updatePassword(newPassword: string) {
    if (!isSupabaseConfigured) {
      return { success: true };
    }
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    await AsyncStorage.removeItem(LOCAL_SESSION_KEY);
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    notifySubscribers('SIGNED_OUT', null);
  },

  async resetPassword(email: string) {
    if (!isSupabaseConfigured) {
      return { success: true };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  async getSession() {
    try {
      const saved = await AsyncStorage.getItem(LOCAL_SESSION_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }

    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch {
      return null;
    }
  },

  onAuthStateChange(
    callback: (event: string, session: any) => void,
  ) {
    subscribers.add(callback);
    let supabaseSub: any = null;
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(callback);
      supabaseSub = data.subscription;
    }
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            subscribers.delete(callback);
            supabaseSub?.unsubscribe?.();
          },
        },
      },
    };
  },

  async getProfile(userId: string): Promise<User | null> {
    if (!isSupabaseConfigured) {
      return {
        id: userId,
        username: 'alexrivera',
        full_name: DEMO_VIP_USER.user_metadata.full_name,
        avatar_url: DEMO_VIP_USER.user_metadata.avatar_url,
        role: 'user',
        created_at: DEMO_VIP_USER.created_at,
        updated_at: DEMO_VIP_USER.updated_at,
      };
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    } catch {
      return null;
    }
  },

  async updateProfile(userId: string, updates: Partial<User>) {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
