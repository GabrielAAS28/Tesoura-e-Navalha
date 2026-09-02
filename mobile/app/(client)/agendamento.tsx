import { useMemo, useState } from "react";
import { View, Text, FlatList, Pressable, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import Svg, { Circle, Path } from "react-native-svg";
import { fetchBarberAppointments, fetchBarberWorkingHours, fetchTenantServices } from "../../lib/queries";
import { computeFreeSlots } from "../../lib/slots";
import { Button } from "../../components/ui/Button";
import { darkHeaderOptions } from "../../lib/nav";

function nextDays(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}

function ClockIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke="#A1A1AA" strokeWidth={1.8} />
      <Path d="M12 7v5l3 3" stroke="#A1A1AA" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function AgendamentoScreen() {
  const { tenantId, serviceId, barberId } = useLocalSearchParams<{
    tenantId: string;
    serviceId: string;
    barberId: string;
  }>();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);

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
    queryKey: ["working-hours", barberId],
    queryFn: () => fetchBarberWorkingHours(barberId),
    enabled: !!barberId,
  });

  const { data: appointments } = useQuery({
    queryKey: ["barber-appointments", barberId, dayStart.toISOString()],
    queryFn: () => fetchBarberAppointments(barberId, dayStart.toISOString(), dayEnd.toISOString()),
    enabled: !!barberId,
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

  const morningSlots = slots.filter((s) => s.getHours() < 13);
  const afternoonSlots = slots.filter((s) => s.getHours() >= 13);

  function renderSlotGrid(items: Date[]) {
    return (
      <View className="flex-row flex-wrap gap-2.5">
        {items.map((item) => {
          const isSelected = selectedSlot?.getTime() === item.getTime();
          return (
            <Pressable
              key={item.toISOString()}
              onPress={() => setSelectedSlot(item)}
              className="h-11 items-center justify-center rounded-md border"
              style={{
                width: "22.5%",
                backgroundColor: isSelected ? "#D97706" : "transparent",
                borderColor: isSelected ? "#D97706" : "#3F3F46",
              }}
            >
              <Text className={`text-[13px] ${isSelected ? "font-bold text-bg-base" : "font-medium text-text-primary"}`}>
                {item.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-bg-base">
      <Stack.Screen options={{ headerShown: true, title: "Data e Horário", ...darkHeaderOptions }} />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 28 }}>
        <View className="gap-3.5">
          <Text className="text-[15px] font-semibold text-text-primary">
            {selectedDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={nextDays(14)}
            keyExtractor={(d) => d.toISOString()}
            ItemSeparatorComponent={() => <View className="w-2.5" />}
            renderItem={({ item }) => {
              const isSelected = item.toDateString() === selectedDate.toDateString();
              return (
                <Pressable
                  onPress={() => {
                    setSelectedDate(item);
                    setSelectedSlot(null);
                  }}
                  className="h-[74px] w-[58px] items-center justify-center gap-1.5 rounded-lg border"
                  style={{
                    backgroundColor: isSelected ? "#D97706" : "#1E1E24",
                    borderColor: isSelected ? "#D97706" : "#3F3F46",
                  }}
                >
                  <Text
                    className="text-[11px] font-medium"
                    style={{ color: isSelected ? "#121214" : "#A1A1AA" }}
                  >
                    {item.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "").toUpperCase()}
                  </Text>
                  <Text
                    className="text-base font-bold"
                    style={{ color: isSelected ? "#121214" : "#F4F4F5" }}
                  >
                    {item.getDate().toString().padStart(2, "0")}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>

        {morningSlots.length > 0 && (
          <View className="gap-3.5">
            <View className="flex-row items-center gap-2">
              <ClockIcon />
              <Text className="text-[15px] font-semibold text-text-primary">Manhã</Text>
            </View>
            {renderSlotGrid(morningSlots)}
          </View>
        )}

        {afternoonSlots.length > 0 && (
          <View className="gap-3.5">
            <View className="flex-row items-center gap-2">
              <ClockIcon />
              <Text className="text-[15px] font-semibold text-text-primary">Tarde</Text>
            </View>
            {renderSlotGrid(afternoonSlots)}
          </View>
        )}

        {slots.length === 0 && (
          <Text className="text-text-secondary">Sem horários livres neste dia.</Text>
        )}
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 px-5 pb-7 pt-4"
        style={{ backgroundColor: "#121214" }}
      >
        <Button
          label="Continuar"
          disabled={!selectedSlot}
          onPress={() =>
            router.push({
              pathname: "/(client)/checkout",
              params: {
                tenantId,
                serviceId,
                barberId,
                startsAt: (selectedSlot as Date).toISOString(),
              },
            })
          }
        />
      </View>
    </View>
  );
}
