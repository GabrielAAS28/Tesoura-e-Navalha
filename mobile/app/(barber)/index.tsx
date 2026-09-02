import { useMemo, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Pressable } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Svg, { Path } from "react-native-svg";
import {
  fetchBarberAppointments,
  fetchBarberByProfileId,
  updateAppointmentStatus,
} from "../../lib/queries";
import { useAuthStore } from "../../store/auth-store";
import { AppointmentWithDetails } from "../../lib/types";
import { ScissorsIcon } from "../../components/ui/icons";

function nextDays(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}

function LightningIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M13 2L3 14h7l-1 8 11-14h-7z" stroke="#D97706" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function BarberAgendaScreen() {
  const profile = useAuthStore((s) => s.profile);
  const queryClient = useQueryClient();
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

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "completed" | "cancelled" }) =>
      updateAppointmentStatus(id, status),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["barber-agenda", barber?.id, dayStart.toISOString()] }),
  });

  const activeAppointments = (appointments ?? []).filter((a) => a.status !== "cancelled");
  const totalCents = activeAppointments.reduce((sum, a) => sum + (a.service?.price_cents ?? 0), 0);

  return (
    <View className="flex-1 bg-bg-base px-5 pt-2">
      <View className="mb-6 flex-row gap-3">
        <View className="flex-1 gap-2 rounded-lg p-4" style={{ backgroundColor: "#1E1E24", borderWidth: 1, borderColor: "#3F3F46" }}>
          <View className="h-[34px] w-[34px] items-center justify-center rounded-md" style={{ backgroundColor: "rgba(217,119,6,0.15)" }}>
            <LightningIcon />
          </View>
          <Text className="text-lg font-bold text-text-primary">R$ {(totalCents / 100).toFixed(0)}</Text>
          <Text className="text-[11px] font-medium text-text-secondary">Total do dia</Text>
        </View>
        <View className="flex-1 gap-2 rounded-lg p-4" style={{ backgroundColor: "#1E1E24", borderWidth: 1, borderColor: "#3F3F46" }}>
          <View className="h-[34px] w-[34px] items-center justify-center rounded-md" style={{ backgroundColor: "rgba(217,119,6,0.15)" }}>
            <ScissorsIcon color="#D97706" size={16} />
          </View>
          <Text className="text-lg font-bold text-text-primary">{activeAppointments.length}</Text>
          <Text className="text-[11px] font-medium text-text-secondary">Cortes agendados</Text>
        </View>
      </View>

      <View className="mb-4 h-14">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={nextDays(7)}
          keyExtractor={(d) => d.toISOString()}
          ItemSeparatorComponent={() => <View className="w-2" />}
          renderItem={({ item }) => {
            const isSelected = item.toDateString() === selectedDate.toDateString();
            return (
              <Pressable
                onPress={() => setSelectedDate(item)}
                className={`h-14 items-center justify-center rounded-md border px-4 ${
                  isSelected ? "border-accent bg-accent" : "border-border"
                }`}
              >
                <Text className={isSelected ? "font-semibold text-bg-base" : "text-text-secondary"}>
                  {item.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit" })}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      <Text className="mb-4 text-[15px] font-semibold text-text-primary">Agenda de hoje</Text>

      {isLoading ? (
        <ActivityIndicator color="#D97706" />
      ) : (
        <FlatList
          className="flex-1"
          data={appointments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 24, gap: 14 }}
          renderItem={({ item }) => (
            <TimelineRow
              appointment={item}
              onComplete={() => statusMutation.mutate({ id: item.id, status: "completed" })}
              onCancel={() => statusMutation.mutate({ id: item.id, status: "cancelled" })}
            />
          )}
          ListEmptyComponent={
            <Text className="text-text-secondary">Nenhum horário agendado neste dia.</Text>
          }
        />
      )}
    </View>
  );
}

function TimelineRow({
  appointment,
  onComplete,
  onCancel,
}: {
  appointment: AppointmentWithDetails;
  onComplete: () => void;
  onCancel: () => void;
}) {
  const isPast = appointment.status === "completed" || appointment.status === "cancelled";
  const time = new Date(appointment.starts_at).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const durationMin = Math.round(
    (new Date(appointment.ends_at).getTime() - new Date(appointment.starts_at).getTime()) / 60000
  );

  return (
    <View className="flex-row gap-3.5" style={{ opacity: isPast ? 0.5 : 1 }}>
      <View className="w-11 items-center">
        <Text
          className="pt-3.5 text-xs font-bold"
          style={{ color: appointment.status === "confirmed" ? "#D97706" : "#A1A1AA" }}
        >
          {time}
        </Text>
      </View>
      <View
        className="flex-1 gap-3 rounded-lg p-3.5"
        style={
          appointment.status === "confirmed"
            ? { backgroundColor: "rgba(217,119,6,0.08)", borderWidth: 1.5, borderColor: "#D97706" }
            : { backgroundColor: "#1E1E24", borderWidth: 1, borderColor: "#3F3F46" }
        }
      >
        <View className="gap-0.5">
          <Text className="text-[13px] font-semibold text-text-primary">
            {appointment.client?.full_name ?? "Cliente"}
          </Text>
          <Text className="text-xs text-text-secondary">
            {appointment.service?.name ?? "Serviço"} · {durationMin}min
          </Text>
        </View>
        {appointment.status === "confirmed" && (
          <View className="flex-row gap-2">
            <Pressable onPress={onComplete} className="h-11 flex-1 items-center justify-center rounded-md bg-accent">
              <Text className="text-xs font-semibold text-bg-base">Concluir</Text>
            </Pressable>
            <Pressable onPress={onCancel} className="h-11 flex-1 items-center justify-center rounded-md border border-border">
              <Text className="text-xs font-semibold text-text-secondary">Cancelar</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
