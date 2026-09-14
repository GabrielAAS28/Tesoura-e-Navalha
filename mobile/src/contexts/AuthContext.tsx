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
    const {data: sub} = supabase.auth.onAuthStateChange(async (event, s) => {
      setSession(s);
      if (!s) {
        setProfile(null);
        setProfileLoading(false);
        return;
      }
      // Só o evento SIGNED_IN representa uma troca real de identidade — é o
      // único caso em que routes/index.tsx precisa segurar o roteamento em
      // Splash até o profile (e portanto o `role`) recarregar. Eventos como
      // TOKEN_REFRESHED (disparado ~a cada hora pelo autoRefreshToken do
      // supabase-js), INITIAL_SESSION e USER_UPDATED mantêm o mesmo usuário
      // logado — gatear profileLoading nesses casos também fazia
      // routes/index.tsx desmontar a árvore de navegação ativa
      // (ClientRoutes/BarberRoutes inteiras, com qualquer tela aninhada, ex.:
      // Checkout em andamento) para mostrar Splash e remontar do zero a cada
      // refresh de token, sem necessidade — o profile não mudou.
      if (event !== 'SIGNED_IN') {
        // Ainda recarrega o profile em segundo plano (sem gatear o router)
        // para manter dados como `role` atualizados caso tenham mudado no
        // servidor, mas sem forçar Splash/remount por isso.
        loadProfile(s.user.id);
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
      // Evita deixar um onboarding de barbeiro abandonado travando o guard
      // de routes/index.tsx (!signed || barberOnboarding) num futuro login —
      // como !signed já é true aqui, isso não muda o roteamento imediato,
      // mas garante que a flag não sobreviva a um logout.
      setBarberOnboarding(false);
    },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
