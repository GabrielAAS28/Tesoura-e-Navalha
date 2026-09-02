import { useState } from "react";
import { View, Text, FlatList, Pressable, Alert } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createService, deleteService, fetchTenantServices } from "../../lib/queries";
import { useAuthStore } from "../../store/auth-store";
import { Card } from "../../components/ui/Card";
import { TextField } from "../../components/ui/TextField";
import { Button } from "../../components/ui/Button";

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
    <View className="flex-1 bg-bg-base px-6 pt-4">
      <Card className="mb-6 gap-3">
        <Text className="font-semibold text-text-primary">Novo serviço</Text>
        <TextField placeholder="Nome do serviço" value={name} onChangeText={setName} />
        <View className="flex-row gap-2">
          <View className="flex-1">
            <TextField
              placeholder="Duração (min)"
              keyboardType="number-pad"
              value={duration}
              onChangeText={setDuration}
            />
          </View>
          <View className="flex-1">
            <TextField
              placeholder="Preço (R$)"
              keyboardType="decimal-pad"
              value={price}
              onChangeText={setPrice}
            />
          </View>
        </View>
        <Button
          label="Adicionar"
          disabled={!name.trim()}
          loading={createMutation.isPending}
          onPress={() => createMutation.mutate()}
        />
      </Card>

      <FlatList
        className="flex-1"
        data={services}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item }) => (
          <Card className="flex-row items-center justify-between">
            <View>
              <Text className="font-semibold text-text-primary">{item.name}</Text>
              <Text className="text-text-secondary">
                {item.duration_minutes} min · R$ {(item.price_cents / 100).toFixed(2)}
              </Text>
            </View>
            <Pressable onPress={() => deleteMutation.mutate(item.id)}>
              <Text className="font-medium text-status-error">Remover</Text>
            </Pressable>
          </Card>
        )}
        ListEmptyComponent={
          <Text className="text-text-secondary">Nenhum serviço cadastrado ainda.</Text>
        }
      />
    </View>
  );
}
