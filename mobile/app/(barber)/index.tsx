import { useMemo, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Pressable } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { fetchBarberAppointments, fetchBarberByProfileId } from "../../lib/queries";
import { useAuthStore } from "../../store/auth-store";

function nextDays(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}

export default function BarberAgendaScreen() {
  const profile = useAuthStore((s) => s.profile);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: barber } = useQuery({
    queryKey: ["barber-by-profile", profile?.id],
    queryFn: () => fetchBarberByProfileId(profile!.id),
    enabled: !!profile,
  });

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

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["barber-agenda", barber?.id, dayStart.toISOString()],
    queryFn: () =>
      fetchBarberAppointments(barber!.id, dayStart.toISOString(), dayEnd.toISOString()),
    enabled: !!barber,
  });

  return (
    <View className="flex-1 bg-white px-6 pt-4">
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
              onPress={() => setSelectedDate(item)}
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

      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={({ item }) => (
            <View className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
              <Text className="text-lg font-semibold text-neutral-900">
                {new Date(item.starts_at).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              <Text className="text-neutral-500">{item.status}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text className="text-neutral-400">Nenhum horário agendado neste dia.</Text>
          }
        />
      )}
    </View>
  );
}
