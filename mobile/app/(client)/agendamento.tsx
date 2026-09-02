import { useMemo, useState } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  createAppointment,
  fetchBarberAppointments,
  fetchBarberWorkingHours,
  fetchTenantBarbers,
  fetchTenantServices,
} from "../../lib/queries";
import { computeFreeSlots } from "../../lib/slots";

function nextDays(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}

export default function AgendamentoScreen() {
  const { tenantId, serviceId } = useLocalSearchParams<{ tenantId: string; serviceId: string }>();
  const router = useRouter();

  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);

  const { data: barbers, isLoading: loadingBarbers } = useQuery({
    queryKey: ["barbers", tenantId],
    queryFn: () => fetchTenantBarbers(tenantId),
    enabled: !!tenantId,
  });

  const { data: services } = useQuery({
    queryKey: ["services", tenantId],
    queryFn: () => fetchTenantServices(tenantId),
    enabled: !!tenantId,
  });
  const service = services?.find((s) => s.id === serviceId);

  const dayStart = useMemo(() => {
    const d = new Date(selectedDate);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [selectedDate]);
  const dayEnd = useMemo(() => {
    const d = new Date(dayStart);
    d.setDate(d.getDate() + 1);
    return d;
  }, [dayStart]);

  const { data: workingHours } = useQuery({
    queryKey: ["working-hours", selectedBarberId],
    queryFn: () => fetchBarberWorkingHours(selectedBarberId as string),
    enabled: !!selectedBarberId,
  });

  const { data: appointments } = useQuery({
    queryKey: ["barber-appointments", selectedBarberId, dayStart.toISOString()],
    queryFn: () =>
      fetchBarberAppointments(selectedBarberId as string, dayStart.toISOString(), dayEnd.toISOString()),
    enabled: !!selectedBarberId,
  });

  const slots = useMemo(() => {
    if (!workingHours || !appointments || !service) return [];
    return computeFreeSlots({
      date: selectedDate,
      durationMinutes: service.duration_minutes,
      workingHours,
      appointments,
    });
  }, [workingHours, appointments, service, selectedDate]);

  const mutation = useMutation({
    mutationFn: () =>
      createAppointment({
        barber_id: selectedBarberId as string,
        service_id: serviceId,
        starts_at: (selectedSlot as Date).toISOString(),
      }),
    onSuccess: () => {
      router.push({ pathname: "/(client)/checkout", params: { tenantId, serviceId } });
    },
    onError: (err: any) => {
      Alert.alert(
        "Horário indisponível",
        "Esse horário acabou de ser reservado por outra pessoa. Escolha outro horário."
      );
      setSelectedSlot(null);
    },
  });

  return (
    <View className="flex-1 bg-white px-6 pt-16">
      <Stack.Screen options={{ headerShown: true, title: "Data & Hora" }} />
      <Text className="mb-4 text-2xl font-bold text-neutral-900">Escolha o barbeiro</Text>

      {loadingBarbers ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          horizontal
          data={barbers}
          keyExtractor={(item) => item.id}
          className="mb-6"
          ItemSeparatorComponent={() => <View className="w-2" />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                setSelectedBarberId(item.id);
                setSelectedSlot(null);
              }}
              className={`rounded-full border px-4 py-2 ${
                selectedBarberId === item.id
                  ? "border-neutral-900 bg-neutral-900"
                  : "border-neutral-200"
              }`}
            >
              <Text className={selectedBarberId === item.id ? "text-white" : "text-neutral-700"}>
                Barbeiro {item.id.slice(0, 4)}
              </Text>
            </Pressable>
          )}
        />
      )}

      <Text className="mb-4 text-lg font-semibold text-neutral-900">Escolha o dia</Text>
      <FlatList
        horizontal
        data={nextDays(7)}
        keyExtractor={(d) => d.toISOString()}
        className="mb-6"
        ItemSeparatorComponent={() => <View className="w-2" />}
        renderItem={({ item }) => {
          const isSelected = item.toDateString() === selectedDate.toDateString();
          return (
            <Pressable
              onPress={() => {
                setSelectedDate(item);
                setSelectedSlot(null);
              }}
              className={`rounded-xl border px-4 py-3 ${
                isSelected ? "border-neutral-900 bg-neutral-900" : "border-neutral-200"
              }`}
            >
              <Text className={isSelected ? "text-white" : "text-neutral-700"}>
                {item.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit" })}
              </Text>
            </Pressable>
          );
        }}
      />

      {selectedBarberId && (
        <>
          <Text className="mb-4 text-lg font-semibold text-neutral-900">Horários disponíveis</Text>
          <FlatList
            data={slots}
            numColumns={3}
            keyExtractor={(d) => d.toISOString()}
            columnWrapperStyle={{ gap: 8 }}
            contentContainerStyle={{ gap: 8 }}
            renderItem={({ item }) => {
              const isSelected = selectedSlot?.getTime() === item.getTime();
              return (
                <Pressable
                  onPress={() => setSelectedSlot(item)}
                  className={`flex-1 items-center rounded-lg border py-3 ${
                    isSelected ? "border-neutral-900 bg-neutral-900" : "border-neutral-200"
                  }`}
                >
                  <Text className={isSelected ? "text-white" : "text-neutral-700"}>
                    {item.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <Text className="text-neutral-400">Sem horários livres neste dia.</Text>
            }
          />
        </>
      )}

      <Pressable
        disabled={!selectedSlot || mutation.isPending}
        onPress={() => mutation.mutate()}
        className={`mt-6 items-center rounded-xl py-4 ${
          selectedSlot ? "bg-neutral-900" : "bg-neutral-200"
        }`}
      >
        <Text className="font-semibold text-white">
          {mutation.isPending ? "Confirmando..." : "Confirmar agendamento"}
        </Text>
      </Pressable>
    </View>
  );
}
