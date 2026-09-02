import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { fetchClientAppointments } from "../../lib/queries";
import { useAuthStore } from "../../store/auth-store";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  completed: "Concluído",
};

export default function AgendamentosScreen() {
  const session = useAuthStore((s) => s.session);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["client-appointments", session?.user.id],
    queryFn: () => fetchClientAppointments(session!.user.id),
    enabled: !!session,
  });

  return (
    <View className="flex-1 bg-white px-6 pt-16">
      <Text className="mb-6 text-2xl font-bold text-neutral-900">Meus agendamentos</Text>

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
                {new Date(item.starts_at).toLocaleString("pt-BR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </Text>
              <Text className="text-neutral-500">{STATUS_LABEL[item.status] ?? item.status}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text className="text-neutral-400">Você ainda não tem agendamentos.</Text>
          }
        />
      )}
    </View>
  );
}
