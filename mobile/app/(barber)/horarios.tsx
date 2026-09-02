import { useState } from "react";
import { View, Text, FlatList, Pressable, Alert } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createWorkingHours,
  deleteWorkingHours,
  fetchBarberByProfileId,
  fetchBarberWorkingHours,
} from "../../lib/queries";
import { useAuthStore } from "../../store/auth-store";
import { Card } from "../../components/ui/Card";
import { TimeField } from "../../components/ui/TimeField";
import { Button } from "../../components/ui/Button";

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

  function handleAdd() {
    if (endTime <= startTime) {
      Alert.alert("Horário inválido", "O fim precisa ser depois do início.");
      return;
    }
    createMutation.mutate();
  }

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteWorkingHours(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["working-hours", barber?.id] }),
  });

  return (
    <View className="flex-1 bg-bg-base px-6 pt-4">
      <Card className="mb-6 gap-3">
        <Text className="font-semibold text-text-primary">Novo horário de trabalho</Text>

        <View className="h-11">
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={WEEKDAYS}
            keyExtractor={(_, i) => String(i)}
            ItemSeparatorComponent={() => <View className="w-2" />}
            renderItem={({ item, index }) => (
              <Pressable
                onPress={() => setWeekday(index)}
                className={`h-11 items-center justify-center rounded-full border px-3 ${
                  weekday === index ? "border-accent bg-accent" : "border-border"
                }`}
              >
                <Text
                  className={weekday === index ? "font-semibold text-bg-base" : "text-text-secondary"}
                >
                  {item}
                </Text>
              </Pressable>
            )}
          />
        </View>

        <View className="flex-row gap-2">
          <View className="flex-1">
            <TimeField label="Início" value={startTime} onChangeValue={setStartTime} />
          </View>
          <View className="flex-1">
            <TimeField label="Fim" value={endTime} onChangeValue={setEndTime} />
          </View>
        </View>

        <Button label="Adicionar" loading={createMutation.isPending} onPress={handleAdd} />
      </Card>

      <FlatList
        className="flex-1"
        data={hours}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item }) => (
          <Card className="flex-row items-center justify-between">
            <Text className="text-text-primary">
              {WEEKDAYS[item.weekday]} · {item.start_time} - {item.end_time}
            </Text>
            <Pressable onPress={() => deleteMutation.mutate(item.id)}>
              <Text className="font-medium text-status-error">Remover</Text>
            </Pressable>
          </Card>
        )}
        ListEmptyComponent={
          <Text className="text-text-secondary">Nenhum horário cadastrado ainda.</Text>
        }
      />
    </View>
  );
}
