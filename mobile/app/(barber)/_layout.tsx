import { Tabs } from "expo-router";

export default function BarberLayout() {
  return (
    <Tabs screenOptions={{ headerShown: true, tabBarActiveTintColor: "#171717" }}>
      <Tabs.Screen name="index" options={{ title: "Agenda" }} />
      <Tabs.Screen name="servicos" options={{ title: "Serviços" }} />
      <Tabs.Screen name="horarios" options={{ title: "Horários" }} />
    </Tabs>
  );
}
