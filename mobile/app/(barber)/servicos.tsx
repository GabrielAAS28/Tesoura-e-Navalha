import { useState } from "react";
import { View, Text, FlatList, TextInput, Pressable, Alert } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createService, deleteService, fetchTenantServices } from "../../lib/queries";
import { useAuthStore } from "../../store/auth-store";

export default function BarberServicosScreen() {
  const profile = useAuthStore((s) => s.profile);
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("30");
  const [price, setPrice] = useState("0");

  const { data: services } = useQuery({
    queryKey: ["services", profile?.tenant_id],
    queryFn: () => fetchTenantServices(profile!.tenant_id as string),
    enabled: !!profile?.tenant_id,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createService({
        tenant_id: profile!.tenant_id as string,
        name,
        duration_minutes: Number(duration) || 30,
        price_cents: Math.round(Number(price.replace(",", ".")) * 100) || 0,
      }),
    onSuccess: () => {
      setName("");
      queryClient.invalidateQueries({ queryKey: ["services", profile?.tenant_id] });
    },
    onError: (err: any) => Alert.alert("Erro ao criar serviço", err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteService(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["services", profile?.tenant_id] }),
  });

  return (
    <View className="flex-1 bg-white px-6 pt-4">
      <View className="mb-6 rounded-xl border border-neutral-100 bg-neutral-50 p-4">
        <Text className="mb-3 font-semibold text-neutral-900">Novo serviço</Text>
        <TextInput
          className="mb-2 rounded-lg border border-neutral-200 bg-white px-3 py-2"
          placeholder="Nome do serviço"
          value={name}
          onChangeText={setName}
        />
        <View className="mb-3 flex-row gap-2">
          <TextInput
            className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2"
            placeholder="Duração (min)"
            keyboardType="number-pad"
            value={duration}
            onChangeText={setDuration}
          />
          <TextInput
            className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2"
            placeholder="Preço (R$)"
            keyboardType="decimal-pad"
            value={price}
            onChangeText={setPrice}
          />
        </View>
        <Pressable
          disabled={!name.trim() || createMutation.isPending}
          onPress={() => createMutation.mutate()}
          className="items-center rounded-lg bg-neutral-900 py-3"
        >
          <Text className="font-semibold text-white">Adicionar</Text>
        </Pressable>
      </View>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item }) => (
          <View className="flex-row items-center justify-between rounded-xl border border-neutral-100 p-4">
            <View>
              <Text className="font-semibold text-neutral-900">{item.name}</Text>
              <Text className="text-neutral-500">
                {item.duration_minutes} min · R$ {(item.price_cents / 100).toFixed(2)}
              </Text>
            </View>
            <Pressable onPress={() => deleteMutation.mutate(item.id)}>
              <Text className="text-red-500">Remover</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <Text className="text-neutral-400">Nenhum serviço cadastrado ainda.</Text>
        }
      />
    </View>
  );
}
