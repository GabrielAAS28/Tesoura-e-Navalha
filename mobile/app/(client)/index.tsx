import { View, Text, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import Svg, { Path } from "react-native-svg";
import { fetchTenants } from "../../lib/queries";
import { useAuthStore } from "../../store/auth-store";
import { ScissorsIcon } from "../../components/ui/icons";

function firstName(fullName: string | null | undefined) {
  if (!fullName) return "";
  return fullName.trim().split(" ")[0];
}

function initials(fullName: string | null | undefined) {
  if (!fullName) return "?";
  const parts = fullName.trim().split(" ").filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default function ClientHomeScreen() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const { data: tenants, isLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn: fetchTenants,
  });

  return (
    <View className="flex-1 bg-bg-base">
      <View className="flex-row items-center justify-between px-5 pb-4 pt-14">
        <View className="gap-0.5">
          <Text className="text-[22px] font-semibold text-text-primary">
            Olá{profile?.full_name ? `, ${firstName(profile.full_name)}` : ""}
          </Text>
          <Text className="text-sm text-text-secondary">Pronto para o próximo corte?</Text>
        </View>
        <View className="flex-row items-center gap-2.5">
          <View
            className="h-11 w-11 items-center justify-center rounded-md border border-border"
            style={{ backgroundColor: "#1E1E24" }}
          >
            <Svg width={19} height={19} viewBox="0 0 24 24" fill="none">
              <Path
                d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"
                stroke="#F4F4F5"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M10 21a2 2 0 0 0 4 0"
                stroke="#F4F4F5"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <View
            className="h-11 w-11 items-center justify-center rounded-full"
            style={{ backgroundColor: "#D97706" }}
          >
            <Text className="text-sm font-bold text-bg-base">{initials(profile?.full_name)}</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={tenants}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, gap: 12 }}
        ListHeaderComponent={
          <View className="mb-7 gap-3.5 rounded-lg p-5" style={{ backgroundColor: "#D97706" }}>
            <View className="gap-1">
              <Text className="text-lg font-bold text-bg-base">Agendamento Rápido</Text>
              <Text className="text-[13px] font-medium text-bg-base opacity-75">
                Marque seu horário em poucos segundos
              </Text>
            </View>
            <View className="h-11 flex-row items-center gap-2 self-start rounded-md bg-bg-base px-4">
              <Text className="text-[13px] font-semibold text-text-primary">
                {tenants && tenants.length > 0 ? "Ver barbearias" : "Explorar"}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color="#D97706" />
          ) : (
            <Text className="text-text-secondary">Nenhuma barbearia cadastrada ainda.</Text>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({ pathname: "/(client)/servicos", params: { tenantId: item.id } })
            }
            className="flex-row items-center gap-3.5 rounded-lg border border-border bg-bg-surface p-4"
          >
            <View
              className="h-11 w-11 items-center justify-center rounded-md"
              style={{ backgroundColor: "rgba(217,119,6,0.15)" }}
            >
              <ScissorsIcon color="#D97706" size={20} />
            </View>
            <Text className="flex-1 text-[15px] font-semibold text-text-primary">{item.name}</Text>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path
                d="M9 6l6 6-6 6"
                stroke="#A1A1AA"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
        )}
      />
    </View>
  );
}
