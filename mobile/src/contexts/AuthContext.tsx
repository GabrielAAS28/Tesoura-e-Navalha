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
  // true enquanto uma resolução de profile está em voo para a sessão atual
  // (ver o subscriber de onAuthStateChange abaixo) — routes/index.tsx trata
  // isso como "ainda carregando" para não decidir ClientRoutes/BarberRoutes
  // com um `role` momentaneamente stale/null.
  profileLoading: boolean;
  // true enquanto o fluxo de cadastro de barbeiro (BarbeiroCadastro ->
  // BarbeiroCadastroEtapa2) está em andamento — permite manter o usuário no
  // AuthRoutes mesmo depois que verifyPhoneOtp já deixou `signed` true (ver
  // BarbeiroCadastro/index.tsx e BarbeiroCadastroEtapa2/index.tsx).
  barberOnboarding: boolean;
  setBarberOnboarding: (value: boolean) => void;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue>({} as AuthValue);

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [barberOnboarding, setBarberOnboarding] = useState(false);

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
      if (!s) {
        setProfile(null);
        setProfileLoading(false);
        return;
      }
      setProfileLoading(true);
      await loadProfile(s.user.id);
      setProfileLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const value: AuthValue = {
    session,
    profile,
    role: profile?.role,
    signed: !!session,
    loading,
    profileLoading,
    barberOnboarding,
    setBarberOnboarding,
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
