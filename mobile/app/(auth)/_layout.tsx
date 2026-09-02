import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="cadastro-barbeiro" />
      <Stack.Screen name="cadastro-barbeiro-etapa2" />
    </Stack>
  );
}
