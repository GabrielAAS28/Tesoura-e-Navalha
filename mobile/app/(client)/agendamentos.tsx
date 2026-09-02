import { useMemo, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Pressable } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { fetchClientAppointments } from "../../lib/queries";
import { useAuthStore } from "../../store/auth-store";
import { StatusBadge, BadgeStatus } from "../../components/ui/Badge";

function initials(fullName: string | null | undefined) {
  if (!fullName) return "?";
  const parts = fullName.trim().split(" ").filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

type Tab = "upcoming" | "history";

export default function AgendamentosScreen() {
  const [tab, setTab] = useState<Tab>("upcoming");
  const session = useAuthStore((s) => s.session);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["client-appointments", session?.user.id],
    queryFn: () => fetchClientAppointments(session!.user.id),
    enabled: !!session,
  });

  // Congela o instante em que a tela montou (lazy initializer é o jeito
  // reconhecido de fazer uma leitura impura fora do corpo de render).
  const [now] = useState(() => Date.now());

  const filtered = useMemo(() => {
    if (!appointments) return [];
    return appointments.filter((a) => {
      const isFuture = new Date(a.starts_at).getTime() >= now && a.status !== "cancelled";
      return tab === "upcoming" ? isFuture : !isFuture;
    });
  }, [appointments, tab, now]);

  return (
    <View className="flex-1 bg-bg-base">
      <View className="px-5 pb-1 pt-14">
        <Text className="text-[22px] font-semibold text-text-primary">Meus Agendamentos</Text>
      </View>

      <View className="flex-row gap-2 px-5 py-4">
        <Pressable
          onPress={() => setTab("upcoming")}
          className="h-11 flex-1 items-center justify-center rounded-md"
          style={{ backgroundColor: tab === "upcoming" ? "#D97706" : "#1E1E24", borderWidth: tab === "upcoming" ? 0 : 1, borderColor: "#3F3F46" }}
        >
          <Text className={`text-[13px] ${tab === "upcoming" ? "font-semibold text-bg-base" : "text-text-secondary"}`}>
            Próximos
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab("history")}
          className="h-11 flex-1 items-center justify-center rounded-md"
          style={{ backgroundColor: tab === "history" ? "#D97706" : "#1E1E24", borderWidth: tab === "history" ? 0 : 1, borderColor: "#3F3F46" }}
        >
          <Text className={`text-[13px] ${tab === "history" ? "font-semibold text-bg-base" : "text-text-secondary"}`}>
            Histórico
          </Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator color="#D97706" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24, gap: 12 }}
          renderItem={({ item }) => (
            <View
              className="gap-3.5 rounded-lg p-4"
              style={{
                backgroundColor: "#1E1E24",
                borderWidth: 1,
                borderColor: "#3F3F46",
                opacity: item.status === "cancelled" ? 0.7 : 1,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="gap-0.5">
                  <Text className="text-sm font-semibold text-text-primary">
                    {item.service?.name ?? "Serviço"}
                  </Text>
                  <Text className="text-xs text-text-secondary">
                    {new Date(item.starts_at).toLocaleDateString("pt-BR", {
                      weekday: "short",
                      day: "2-digit",
                      month: "long",
                    })}{" "}
                    ·{" "}
                    {new Date(item.starts_at).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
                <StatusBadge status={item.status as BadgeStatus} />
              </View>
              <View className="h-px bg-border" />
              <View className="flex-row items-center gap-2.5">
                <View className="h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: "#3F3F46" }}>
                  <Text className="text-xs font-bold text-text-primary">
                    {initials(item.barber?.profile?.full_name)}
                  </Text>
                </View>
                <Text className="text-xs text-text-secondary">
                  {item.barber?.profile?.full_name ?? "Barbeiro"} · R${" "}
                  {((item.service?.price_cents ?? 0) / 100).toFixed(2)}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text className="text-text-secondary">
              {tab === "upcoming" ? "Você não tem agendamentos futuros." : "Nenhum histórico ainda."}
            </Text>
          }
        />
      )}
    </View>
  );
}
