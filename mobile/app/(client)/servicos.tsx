import { useState } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import Svg, { Path } from "react-native-svg";
import { fetchTenantBarbers, fetchTenantServices } from "../../lib/queries";
import { Button } from "../../components/ui/Button";
import { ScissorsIcon } from "../../components/ui/icons";
import { darkHeaderOptions } from "../../lib/nav";

function initials(fullName: string | null | undefined) {
  if (!fullName) return "?";
  const parts = fullName.trim().split(" ").filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default function ServicosScreen() {
  const { tenantId } = useLocalSearchParams<{ tenantId: string }>();
  const router = useRouter();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null);

  const { data: services, isLoading: loadingServices } = useQuery({
    queryKey: ["services", tenantId],
    queryFn: () => fetchTenantServices(tenantId),
    enabled: !!tenantId,
  });

  const { data: barbers, isLoading: loadingBarbers } = useQuery({
    queryKey: ["barbers", tenantId],
    queryFn: () => fetchTenantBarbers(tenantId),
    enabled: !!tenantId,
  });

  const canContinue = !!selectedServiceId && !!selectedBarberId;

  return (
    <View className="flex-1 bg-bg-base">
      <Stack.Screen options={{ headerShown: true, title: "Escolher Serviço", ...darkHeaderOptions }} />

      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 120, gap: 12 }}
        ListEmptyComponent={
          loadingServices ? (
            <ActivityIndicator color="#D97706" />
          ) : (
            <Text className="text-text-secondary">Nenhum serviço cadastrado ainda.</Text>
          )
        }
        renderItem={({ item }) => {
          const isSelected = selectedServiceId === item.id;
          return (
            <Pressable
              onPress={() => setSelectedServiceId(item.id)}
              className="flex-row items-center gap-3.5 rounded-lg p-4"
              style={{
                backgroundColor: isSelected ? "rgba(217,119,6,0.10)" : "#1E1E24",
                borderWidth: isSelected ? 1.5 : 1,
                borderColor: isSelected ? "#D97706" : "#3F3F46",
              }}
            >
              <View
                className="h-11 w-11 items-center justify-center rounded-md"
                style={{ backgroundColor: isSelected ? "rgba(217,119,6,0.18)" : "rgba(217,119,6,0.10)" }}
              >
                <ScissorsIcon color="#D97706" size={22} />
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="text-[15px] font-semibold text-text-primary">{item.name}</Text>
                <Text className="text-[13px] text-text-secondary">{item.duration_minutes} min</Text>
              </View>
              <View className="items-end gap-1.5">
                <Text className={`text-[15px] font-bold ${isSelected ? "text-accent" : "text-text-primary"}`}>
                  R$ {(item.price_cents / 100).toFixed(0)}
                </Text>
                {isSelected ? (
                  <View className="h-[22px] w-[22px] items-center justify-center rounded-full bg-accent">
                    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M20 6L9 17l-5-5"
                        stroke="#121214"
                        strokeWidth={2.6}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </View>
                ) : (
                  <View className="h-[22px] w-[22px] rounded-full border-[1.5px] border-border" />
                )}
              </View>
            </Pressable>
          );
        }}
        ListFooterComponent={
          <View className="mt-4 gap-3.5">
            <Text className="text-base font-semibold text-text-primary">Escolha o barbeiro</Text>
            {loadingBarbers ? (
              <ActivityIndicator color="#D97706" />
            ) : (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={barbers}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={() => <View className="w-3" />}
                renderItem={({ item }) => {
                  const isSelected = selectedBarberId === item.id;
                  return (
                    <Pressable
                      onPress={() => setSelectedBarberId(item.id)}
                      className="w-[132px] gap-2.5 rounded-lg p-3.5"
                      style={{
                        backgroundColor: "#1E1E24",
                        borderWidth: isSelected ? 1.5 : 1,
                        borderColor: isSelected ? "#D97706" : "#3F3F46",
                      }}
                    >
                      <View
                        className="h-12 w-12 items-center justify-center rounded-full"
                        style={{ backgroundColor: "#3F3F46" }}
                      >
                        <Text className="text-[15px] font-bold text-text-primary">
                          {initials(item.profile?.full_name)}
                        </Text>
                      </View>
                      <Text className="text-[13px] font-semibold text-text-primary" numberOfLines={1}>
                        {item.profile?.full_name ?? "Barbeiro"}
                      </Text>
                    </Pressable>
                  );
                }}
                ListEmptyComponent={
                  <Text className="text-text-secondary">Nenhum barbeiro disponível.</Text>
                }
              />
            )}
          </View>
        }
      />

      <View
        className="absolute bottom-0 left-0 right-0 px-5 pb-7 pt-4"
        style={{ backgroundColor: "#121214" }}
      >
        <Button
          label="Continuar"
          disabled={!canContinue}
          onPress={() =>
            router.push({
              pathname: "/(client)/agendamento",
              params: { tenantId, serviceId: selectedServiceId!, barberId: selectedBarberId! },
            })
          }
        />
      </View>
    </View>
  );
}
