import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAuthStore } from "../store/auth-store";

/**
 * Redirects between the (auth), (client) and (barber) route groups based on
 * session + profile.role. Runs on every segment/session/profile change.
 */
export function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const { session, profile, isInitializing } = useAuthStore();

  useEffect(() => {
    if (isInitializing) return;

    const group = segments[0];
    const inAuthGroup = group === "(auth)";

    if (!session) {
      if (!inAuthGroup) router.replace("/(auth)/login");
      return;
    }

    if (!profile) {
      // Session exists but profile row not loaded/created yet (e.g. right
      // after signup) — keep the user on the auth flow to finish onboarding.
      if (!inAuthGroup) router.replace("/(auth)/login");
      return;
    }

    if (profile.role === "client" && group !== "(client)") {
      router.replace("/(client)");
    } else if ((profile.role === "barber" || profile.role === "admin") && group !== "(barber)") {
      router.replace("/(barber)");
    }
  }, [isInitializing, session, profile, segments, router]);
}
