import React, {createContext, useContext, useEffect, useState, useCallback} from 'react';
import type {Session} from '@supabase/supabase-js';
import {supabase} from '~/services/supabase';
import {fetchProfile} from '~/services/barberService';
import {signOut as authSignOut} from '~/services/authService';
import type {Profile, UserRole} from '~/types';

type AuthValue = {
  session: Session | null;
  profile: Profile | null;
  role: UserRole | undefined;
  signed: boolean;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue>({} as AuthValue);

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId?: string) => {
    if (!userId) return setProfile(null);
    setProfile(await fetchProfile(userId));
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({data}) => {
      setSession(data.session);
      await loadProfile(data.session?.user.id);
      setLoading(false);
    });
    const {data: sub} = supabase.auth.onAuthStateChange(async (_e, s) => {
      setSession(s);
      await loadProfile(s?.user.id);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const value: AuthValue = {
    session,
    profile,
    role: profile?.role,
    signed: !!session,
    loading,
    refreshProfile: () => loadProfile(session?.user.id),
    signOut: async () => {
      await authSignOut();
      setSession(null);
      setProfile(null);
    },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
