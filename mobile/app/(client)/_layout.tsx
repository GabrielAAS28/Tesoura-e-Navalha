import { Tabs } from "expo-router";
import { CalendarIcon, HomeIcon, UserIcon } from "../../components/ui/icons";

export default function ClientLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#D97706",
        tabBarInactiveTintColor: "#A1A1AA",
        tabBarStyle: { backgroundColor: "#1E1E24", borderTopColor: "#3F3F46" },
        tabBarLabelStyle: { fontFamily: "PlusJakartaSans_600SemiBold", fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Início", tabBarIcon: ({ color, size }) => <HomeIcon color={String(color)} size={size} /> }}
      />
      <Tabs.Screen
        name="agendamentos"
        options={{
          title: "Agendamentos",
          tabBarIcon: ({ color, size }) => <CalendarIcon color={String(color)} size={size} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: "Perfil", tabBarIcon: ({ color, size }) => <UserIcon color={String(color)} size={size} /> }}
      />
      <Tabs.Screen name="servicos" options={{ href: null }} />
      <Tabs.Screen name="agendamento" options={{ href: null }} />
      <Tabs.Screen name="checkout" options={{ href: null }} />
    </Tabs>
  );
}
