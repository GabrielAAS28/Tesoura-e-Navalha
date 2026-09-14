import React from 'react';
import {useAuth} from '~/contexts/AuthContext';
import Splash from '~/screens/Splash';
import AuthRoutes from './auth.routes';
import ClientRoutes from './client.routes';
import BarberRoutes from './barber.routes';

export default function Routes() {
  const {loading, signed, role, barberOnboarding, profileLoading} = useAuth();
  // signed && profileLoading && !barberOnboarding: cobre o subscriber de
  // onAuthStateChange, que seta `signed` true antes de loadProfile resolver —
  // sem isso, um login de barbeiro renderia um frame com role ainda
  // undefined/stale e cairia em ClientRoutes/Main (disparando queries de
  // cliente) antes de corrigir para BarberRoutes. O `!barberOnboarding` é
  // essencial: uma vez que o onboarding de barbeiro está em andamento, este
  // guard NUNCA deve mostrar Splash (o que desmontaria AuthRoutes/Etapa2) só
  // porque o profile ainda está carregando — a checagem de barberOnboarding
  // abaixo tem que vencer primeiro.
  if (loading || (signed && profileLoading && !barberOnboarding)) return <Splash />;
  // barberOnboarding: mantém o usuário no AuthRoutes mesmo já `signed` (a
  // verificação de OTP da Etapa1 do cadastro de barbeiro cria uma sessão real
  // antes da Etapa2 promover o profile para admin) — sem isso, AuthRoutes
  // desmonta e o navigate('BarbeiroCadastroEtapa2') mira uma stack que já
  // saiu de cena. Ver BarbeiroCadastro/index.tsx e
  // BarbeiroCadastroEtapa2/index.tsx.
  if (!signed || barberOnboarding) return <AuthRoutes />;
  return role === 'barber' || role === 'admin' ? <BarberRoutes /> : <ClientRoutes />;
}
