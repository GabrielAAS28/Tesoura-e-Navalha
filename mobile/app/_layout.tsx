import "../global.css";
import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
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
      <View className="flex-1 items-center justify-center bg-bg-base">
        <ActivityIndicator size="large" color="#D97706" />
        <Text className="mt-4 font-medium text-text-secondary">Carregando Navalha...</Text>
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  if (!fontsLoaded) {
    return <View className="flex-1 bg-bg-base" />;
  }

  return (
    <QueryProvider>
      <StatusBar style="light" />
      <RootNavigation />
    </QueryProvider>
  );
}
