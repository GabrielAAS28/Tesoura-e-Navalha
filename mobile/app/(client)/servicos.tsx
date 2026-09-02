import { View, Text, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { fetchTenantServices } from "../../lib/queries";

export default function ServicosScreen() {
  const { tenantId } = useLocalSearchParams<{ tenantId: string }>();
  const router = useRouter();

  const { data: services, isLoading } = useQuery({
    queryKey: ["services", tenantId],
    queryFn: () => fetchTenantServices(tenantId),
    enabled: !!tenantId,
  });

  return (
    <View className="flex-1 bg-white px-6 pt-16">
      <Stack.Screen options={{ headerShown: true, title: "Serviços" }} />
      <Text className="mb-6 text-2xl font-bold text-neutral-900">Escolha o serviço</Text>

      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(client)/agendamento",
                  params: { tenantId, serviceId: item.id },
                })
              }
              className="flex-row items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 p-4"
            >
              <View>
                <Text className="text-lg font-semibold text-neutral-900">{item.name}</Text>
                <Text className="text-neutral-500">{item.duration_minutes} min</Text>
              </View>
              <Text className="font-semibold text-neutral-900">
                R$ {(item.price_cents / 100).toFixed(2)}
              </Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text className="text-neutral-400">Nenhum serviço cadastrado ainda.</Text>
          }
        />
      )}
    </View>
  );
}
