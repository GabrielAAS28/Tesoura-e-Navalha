import { Tabs } from "expo-router";

export default function ClientLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: "#171717" }}>
      <Tabs.Screen name="index" options={{ title: "Início" }} />
      <Tabs.Screen name="agendamentos" options={{ title: "Agendamentos" }} />
      <Tabs.Screen name="perfil" options={{ title: "Perfil" }} />
      <Tabs.Screen name="servicos" options={{ href: null }} />
      <Tabs.Screen name="agendamento" options={{ href: null }} />
      <Tabs.Screen name="checkout" options={{ href: null }} />
    </Tabs>
  );
}
