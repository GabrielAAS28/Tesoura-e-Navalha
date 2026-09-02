import { useState } from "react";
import { View, Text, FlatList, TextInput, Pressable, Alert } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createWorkingHours,
  deleteWorkingHours,
  fetchBarberByProfileId,
  fetchBarberWorkingHours,
} from "../../lib/queries";
import { useAuthStore } from "../../store/auth-store";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function BarberHorariosScreen() {
  const profile = useAuthStore((s) => s.profile);
  const queryClient = useQueryClient();
  const [weekday, setWeekday] = useState(1);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");

  const { data: barber } = useQuery({
    queryKey: ["barber-by-profile", profile?.id],
    queryFn: () => fetchBarberByProfileId(profile!.id),
    enabled: !!profile,
  });

  const { data: hours } = useQuery({
    queryKey: ["working-hours", barber?.id],
    queryFn: () => fetchBarberWorkingHours(barber!.id),
    enabled: !!barber,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createWorkingHours({
        barber_id: barber!.id,
        weekday,
        start_time: startTime,
        end_time: endTime,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["working-hours", barber?.id] }),
    onError: (err: any) => Alert.alert("Erro ao salvar horário", err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteWorkingHours(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["working-hours", barber?.id] }),
  });

  return (
    <View className="flex-1 bg-white px-6 pt-4">
      <View className="mb-6 rounded-xl border border-neutral-100 bg-neutral-50 p-4">
        <Text className="mb-3 font-semibold text-neutral-900">Novo horário de trabalho</Text>

        <FlatList
          horizontal
          data={WEEKDAYS}
          keyExtractor={(_, i) => String(i)}
          className="mb-3"
          ItemSeparatorComponent={() => <View className="w-2" />}
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => setWeekday(index)}
              className={`rounded-full border px-3 py-2 ${
                weekday === index ? "border-neutral-900 bg-neutral-900" : "border-neutral-200"
              }`}
            >
              <Text className={weekday === index ? "text-white" : "text-neutral-700"}>{item}</Text>
            </Pressable>
          )}
        />

        <View className="mb-3 flex-row gap-2">
          <TextInput
            className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2"
            placeholder="Início (HH:MM)"
            value={startTime}
            onChangeText={setStartTime}
          />
          <TextInput
            className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2"
            placeholder="Fim (HH:MM)"
            value={endTime}
            onChangeText={setEndTime}
          />
        </View>

        <Pressable
          disabled={createMutation.isPending}
          onPress={() => createMutation.mutate()}
          className="items-center rounded-lg bg-neutral-900 py-3"
        >
          <Text className="font-semibold text-white">Adicionar</Text>
        </Pressable>
      </View>

      <FlatList
        data={hours}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item }) => (
          <View className="flex-row items-center justify-between rounded-xl border border-neutral-100 p-4">
            <Text className="text-neutral-900">
              {WEEKDAYS[item.weekday]} · {item.start_time} - {item.end_time}
            </Text>
            <Pressable onPress={() => deleteMutation.mutate(item.id)}>
              <Text className="text-red-500">Remover</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <Text className="text-neutral-400">Nenhum horário cadastrado ainda.</Text>
        }
      />
    </View>
  );
}
