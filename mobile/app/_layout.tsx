import "../global.css";
import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { supabase } from "../lib/supabase";
import { fetchProfile } from "../lib/queries";
import { useAuthStore } from "../store/auth-store";
import { useProtectedRoute } from "../hooks/use-protected-route";
import { QueryProvider } from "../providers/query-provider";

function RootNavigation() {
  const { setSession, setProfile, setInitializing, isInitializing } = useAuthStore();

  useEffect(() => {
    async function bootstrap() {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      if (data.session) {
        const profile = await fetchProfile(data.session.user.id).catch(() => null);
        setProfile(profile);
      }
      setInitializing(false);
    }

    bootstrap();

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        const profile = await fetchProfile(session.user.id).catch(() => null);
        setProfile(profile);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, [setSession, setProfile, setInitializing]);

  useProtectedRoute();

  if (isInitializing) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-gray-500">Carregando Navalha...</Text>
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <QueryProvider>
      <StatusBar style="auto" />
      <RootNavigation />
    </QueryProvider>
  );
}
