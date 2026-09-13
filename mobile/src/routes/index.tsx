import React from 'react';
import {useAuth} from '~/contexts/AuthContext';
import Splash from '~/screens/Splash';
import AuthRoutes from './auth.routes';
import ClientRoutes from './client.routes';
import BarberRoutes from './barber.routes';

export default function Routes() {
  const {loading, signed, role} = useAuth();
  if (loading) return <Splash />;
  if (!signed) return <AuthRoutes />;
  return role === 'barber' || role === 'admin' ? <BarberRoutes /> : <ClientRoutes />;
}
