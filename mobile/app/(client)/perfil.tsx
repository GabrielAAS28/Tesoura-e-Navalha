import { View, Text, Pressable } from "react-native";
import { useAuthStore } from "../../store/auth-store";
import { signOut } from "../../lib/auth";

export default function PerfilScreen() {
  const profile = useAuthStore((s) => s.profile);

  return (
    <View className="flex-1 bg-white px-6 pt-16">
      <Text className="mb-1 text-2xl font-bold text-neutral-900">
        {profile?.full_name ?? "Meu perfil"}
      </Text>
      <Text className="mb-8 text-neutral-500">{profile?.phone}</Text>

      {/* Loyalty program placeholder — fora de escopo do MVP */}
      <View className="mb-8 rounded-xl border border-neutral-100 bg-neutral-50 p-4">
        <Text className="font-semibold text-neutral-900">Fidelidade</Text>
        <Text className="text-neutral-500">Em breve: pontos e recompensas por corte.</Text>
      </View>

      <Pressable
        onPress={signOut}
        className="items-center rounded-xl border border-neutral-200 py-4"
      >
        <Text className="font-semibold text-neutral-700">Sair</Text>
      </Pressable>
    </View>
  );
}
