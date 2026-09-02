import { View, Text, Alert } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import Svg, { Path } from "react-native-svg";
import { createAppointment, fetchTenantBarbers, fetchTenantServices } from "../../lib/queries";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { darkHeaderOptions } from "../../lib/nav";

function initials(fullName: string | null | undefined) {
  if (!fullName) return "?";
  const parts = fullName.trim().split(" ").filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-[13px] text-text-secondary">{label}</Text>
      <Text className="text-[13px] font-semibold text-text-primary">{value}</Text>
    </View>
  );
}

export default function CheckoutScreen() {
  const { tenantId, serviceId, barberId, startsAt } = useLocalSearchParams<{
    tenantId: string;
    serviceId: string;
    barberId: string;
    startsAt: string;
  }>();
  const router = useRouter();

  const { data: services } = useQuery({
    queryKey: ["services", tenantId],
    queryFn: () => fetchTenantServices(tenantId),
    enabled: !!tenantId,
  });
  const service = services?.find((s) => s.id === serviceId);

  const { data: barbers } = useQuery({
    queryKey: ["barbers", tenantId],
    queryFn: () => fetchTenantBarbers(tenantId),
    enabled: !!tenantId,
  });
  const barber = barbers?.find((b) => b.id === barberId);

  const startDate = new Date(startsAt);

  const mutation = useMutation({
    mutationFn: () => createAppointment({ barber_id: barberId, service_id: serviceId, starts_at: startsAt }),
    onSuccess: () => {
      Alert.alert("Agendamento confirmado!", "Você pode acompanhar em Meus Agendamentos.");
      router.replace("/(client)/agendamentos");
    },
    onError: () => {
      Alert.alert(
        "Horário indisponível",
        "Esse horário acabou de ser reservado por outra pessoa. Volte e escolha outro."
      );
    },
  });

  const priceCents = service?.price_cents ?? 0;

  return (
    <View className="flex-1 bg-bg-base">
      <Stack.Screen options={{ headerShown: true, title: "Confirmar Agendamento", ...darkHeaderOptions }} />

      <View className="flex-1 gap-6 p-5">
        <Card className="gap-4">
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: "#3F3F46" }}>
              <Text className="text-[15px] font-bold text-text-primary">
                {initials(barber?.profile?.full_name)}
              </Text>
            </View>
            <View className="gap-0.5">
              <Text className="text-sm font-semibold text-text-primary">
                {barber?.profile?.full_name ?? "Barbeiro"}
              </Text>
              <Text className="text-xs text-text-secondary">Profissional</Text>
            </View>
          </View>
          <View className="h-px bg-border" />
          <View className="gap-2.5">
            <SummaryRow label="Serviço" value={service?.name ?? "—"} />
            <SummaryRow
              label="Data"
              value={startDate.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "long" })}
            />
            <SummaryRow
              label="Horário"
              value={startDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            />
            <SummaryRow label="Duração" value={`${service?.duration_minutes ?? 0} min`} />
          </View>
        </Card>

        <View className="gap-3">
          <Text className="text-[15px] font-semibold text-text-primary">Pagamento</Text>
          <View
            className="flex-row items-center gap-3.5 rounded-lg p-4"
            style={{ backgroundColor: "rgba(217,119,6,0.10)", borderWidth: 1.5, borderColor: "#D97706" }}
          >
            <View className="h-10 w-10 items-center justify-center rounded-md" style={{ backgroundColor: "rgba(217,119,6,0.18)" }}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 21s7-7.5 7-12a7 7 0 1 0-14 0c0 4.5 7 12 7 12z"
                  stroke="#D97706"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <Text className="flex-1 text-sm font-semibold text-text-primary">Pagar no local</Text>
          </View>
          <Text className="text-xs text-text-secondary">
            Cartão e Pix pelo app chegam em breve — por enquanto o pagamento é feito direto na barbearia.
          </Text>
        </View>

        <View className="gap-2.5 pt-1">
          <SummaryRow label="Subtotal" value={`R$ ${(priceCents / 100).toFixed(2)}`} />
          <View className="h-px bg-border" />
          <View className="flex-row items-center justify-between">
            <Text className="text-[15px] font-semibold text-text-primary">Total</Text>
            <Text className="text-lg font-bold text-accent">R$ {(priceCents / 100).toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View className="items-center gap-2.5 px-5 pb-7 pt-3.5" style={{ backgroundColor: "#121214" }}>
        <Button
          label={mutation.isPending ? "Confirmando..." : "Confirmar Agendamento"}
          loading={mutation.isPending}
          onPress={() => mutation.mutate()}
        />
        <Text className="text-center text-[11px] text-text-secondary">
          Cancelamento gratuito até 2h antes do horário
        </Text>
      </View>
    </View>
  );
}
