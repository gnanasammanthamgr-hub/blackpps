import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{
    error: string | null;
    confirmationRequired: boolean;
  }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  resendConfirmation: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Profile load failed:', error.message);
        setProfile(null);
        return;
      }

      if (data) {
        setProfile(data as Profile);
        return;
      }

      // Existing Auth users may have been created before the profiles trigger/schema existed.
      // Create the missing row on demand so Profile/Settings do not stay on a permanent loader.
      const currentUser = user?.id === userId ? user : (await supabase.auth.getUser()).data.user;
      const displayName = String(currentUser?.user_metadata?.display_name ?? '');
      const { data: created, error: createError } = await supabase
        .from('profiles')
        .upsert({ id: userId, display_name: displayName }, { onConflict: 'id' })
        .select('*')
        .single();

      if (createError) {
        console.warn('Profile auto-create failed:', createError.message);
        setProfile(null);
        return;
      }

      setProfile(created as Profile);
    } catch (error) {
      console.warn('Profile load failed:', error);
      setProfile(null);
    }
  }

  useEffect(() => {
    let active = true;

    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!active) return;

        if (error) console.warn('Session restore failed:', error.message);

        const currentSession = data.session ?? null;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);

        // Load profile after the auth call has fully completed. Do not block auth/session restoration.
        if (currentSession?.user) {
          void loadProfile(currentSession.user.id);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        if (active) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    };

    void initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!active) return;

      // IMPORTANT: keep this callback synchronous. Awaiting another Supabase request here can
      // block/deadlock signInWithPassword while the auth client is still processing the event.
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);

      if (newSession?.user) {
        setTimeout(() => {
          if (active) void loadProfile(newSession.user.id);
        }, 0);
      } else {
        setProfile(null);
      }
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    const cleanEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { error: 'Please enter a valid email address.', confirmationRequired: false };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { display_name: displayName.trim() },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('weak_password') || msg.includes('password is known to be weak')) {
          return { error: 'This password is too common and not secure. Please choose a stronger password with at least 8 characters, including a mix of letters, numbers, and symbols.', confirmationRequired: false };
        }
        if (msg.includes('already') || msg.includes('registered')) {
          return { error: 'An account with this email already exists. Try logging in instead.', confirmationRequired: false };
        }
        return { error: error.message, confirmationRequired: false };
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        void loadProfile(data.session.user.id);
      }
      return { error: null, confirmationRequired: !data.session };
    } catch (error) {
      console.error('Sign-up request failed:', error);
      return { error: 'Unable to connect to the authentication server. Check your internet connection and Supabase environment variables.', confirmationRequired: false };
    }
  };

  const signIn = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { error: 'Please enter a valid email address.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });

      if (error) {
        console.error('Supabase sign-in error:', {
          message: error.message,
          code: error.code,
          status: error.status,
        });
        const msg = error.message.toLowerCase();
        if (error.code === 'email_not_confirmed' || msg.includes('email not confirmed')) {
          return { error: 'Please confirm your email before logging in. Check Inbox/Spam, or use Resend confirmation email.' };
        }
        if (error.code === 'invalid_credentials' || msg.includes('invalid login credentials')) {
          return { error: 'Incorrect email or password, or this user does not exist in this Supabase project.' };
        }
        if (msg.includes('invalid api key') || msg.includes('apikey')) {
          return { error: 'Supabase API key is invalid. Check VITE_SUPABASE_ANON_KEY in the .env file and restart npm run dev.' };
        }
        if (error.code === 'over_email_send_rate_limit' || msg.includes('rate_limit') || msg.includes('too_many') || msg.includes('too many')) {
          return { error: 'Too many requests. Please wait a moment before trying again.' };
        }
        return { error: `Supabase login error: ${error.message}` };
      }

      if (!data.session || !data.user) {
        return { error: 'Login succeeded but no session was returned. Check Supabase Authentication settings.' };
      }

      // Auth success is enough to enter the app. Profile loading must not be allowed to break login.
      setSession(data.session);
      setUser(data.user);
      void loadProfile(data.user.id);
      return { error: null };
    } catch (error) {
      console.error('Sign-in request failed:', error);
      return { error: 'Unable to connect to the authentication server. Check your internet connection and Supabase environment variables.' };
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) {
        const msg = error.message.toLowerCase();
        if (error.code === 'over_email_send_rate_limit' || msg.includes('rate limit')) {
          return { error: 'Too many requests. Please wait a moment before trying again.' };
        }
        return { error: error.message };
      }
      return { error: null };
    } catch {
      return { error: 'Unable to send the confirmation email right now.' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('rate_limit') || msg.includes('too_many') || msg.includes('too many')) {
          return { error: 'Too many requests. Please wait a moment before trying again.' };
        }
        return { error: error.message };
      }
      return { error: null };
    } catch {
      return { error: 'Unable to send the password reset email right now.' };
    }
  };

  const refreshProfile = async () => {
    if (user) await loadProfile(user.id);
  };

  return (
    <AuthContext.Provider
      value={{ session, user, profile, loading, signUp, signIn, resendConfirmation, signOut, resetPassword, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
