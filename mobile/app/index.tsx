import { View, ActivityIndicator } from "react-native";

// Root route — the guard in app/_layout.tsx (useProtectedRoute) redirects
// away from here into (auth), (client) or (barber) as soon as the session
// state is known. This screen is only ever visible for a frame.
export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-bg-base">
      <ActivityIndicator color="#D97706" />
    </View>
  );
}
