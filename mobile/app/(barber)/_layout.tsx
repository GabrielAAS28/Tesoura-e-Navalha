import { Tabs } from "expo-router";
import { CalendarIcon, ClockIcon, ScissorsIcon } from "../../components/ui/icons";

export default function BarberLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#121214" },
        headerTintColor: "#F4F4F5",
        headerTitleStyle: { fontFamily: "PlusJakartaSans_600SemiBold" },
        headerShadowVisible: false,
        tabBarActiveTintColor: "#D97706",
        tabBarInactiveTintColor: "#A1A1AA",
        tabBarStyle: { backgroundColor: "#1E1E24", borderTopColor: "#3F3F46" },
        tabBarLabelStyle: { fontFamily: "PlusJakartaSans_600SemiBold", fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Agenda", tabBarIcon: ({ color, size }) => <CalendarIcon color={String(color)} size={size} /> }}
      />
      <Tabs.Screen
        name="servicos"
        options={{ title: "Serviços", tabBarIcon: ({ color, size }) => <ScissorsIcon color={String(color)} size={size} /> }}
      />
      <Tabs.Screen
        name="horarios"
        options={{ title: "Horários", tabBarIcon: ({ color, size }) => <ClockIcon color={String(color)} size={size} /> }}
      />
    </Tabs>
  );
}
