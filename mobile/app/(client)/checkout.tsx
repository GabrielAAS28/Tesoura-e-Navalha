import { View, Text, Pressable } from "react-native";
import { useRouter, Stack } from "expo-router";

// Placeholder screen — real payment integration (Stripe/Pagar.me) is out of
// scope for the MVP; the appointment is already confirmed at this point.
export default function CheckoutScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Stack.Screen options={{ headerShown: true, title: "Confirmado" }} />
      <Text className="mb-2 text-3xl">✅</Text>
      <Text className="mb-2 text-2xl font-bold text-neutral-900">Agendamento confirmado!</Text>
      <Text className="mb-8 text-center text-neutral-500">
        O pagamento é feito diretamente na barbearia. Você pode acompanhar seus horários em
        "Agendamentos".
      </Text>
      <Pressable
        onPress={() => router.replace("/(client)/agendamentos")}
        className="items-center rounded-xl bg-neutral-900 px-8 py-4"
      >
        <Text className="font-semibold text-white">Ver meus agendamentos</Text>
      </Pressable>
    </View>
  );
}
