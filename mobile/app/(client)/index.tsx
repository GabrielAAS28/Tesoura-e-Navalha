import { View, Text, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { fetchTenants } from "../../lib/queries";

export default function ClientHomeScreen() {
  const router = useRouter();
  const { data: tenants, isLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn: fetchTenants,
  });

  return (
    <View className="flex-1 bg-white px-6 pt-16">
      <Text className="mb-1 text-2xl font-bold text-neutral-900">Barbearias</Text>
      <Text className="mb-6 text-base text-neutral-500">Escolha onde agendar seu horário</Text>

      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={tenants}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({ pathname: "/(client)/servicos", params: { tenantId: item.id } })
              }
              className="rounded-xl border border-neutral-100 bg-neutral-50 p-4"
            >
              <Text className="text-lg font-semibold text-neutral-900">{item.name}</Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text className="text-neutral-400">Nenhuma barbearia cadastrada ainda.</Text>
          }
        />
      )}
    </View>
  );
}
