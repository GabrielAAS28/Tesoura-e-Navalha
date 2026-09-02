import { View, Text, Pressable, Alert, ScrollView } from "react-native";
import { useQuery } from "@tanstack/react-query";
import Svg, { Path, Circle } from "react-native-svg";
import { useAuthStore } from "../../store/auth-store";
import { signOut } from "../../lib/auth";
import { fetchClientAppointments } from "../../lib/queries";
import { ScissorsIcon } from "../../components/ui/icons";

function initials(fullName: string | null | undefined) {
  if (!fullName) return "?";
  const parts = fullName.trim().split(" ").filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function ChevronRight() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M9 6l6 6-6 6" stroke="#A1A1AA" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function SettingsRow({
  icon,
  label,
  danger,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3.5 border-b py-4"
      style={{ borderColor: "#1E1E24" }}
    >
      <View
        className="h-9 w-9 items-center justify-center rounded-md"
        style={{ backgroundColor: danger ? "rgba(239,68,68,0.10)" : "#1E1E24" }}
      >
        {icon}
      </View>
      <Text className={`flex-1 text-sm font-medium ${danger ? "text-status-error" : "text-text-primary"}`}>
        {label}
      </Text>
      {!danger && <ChevronRight />}
    </Pressable>
  );
}

export default function PerfilScreen() {
  const profile = useAuthStore((s) => s.profile);
  const session = useAuthStore((s) => s.session);

  const { data: appointments } = useQuery({
    queryKey: ["client-appointments", session?.user.id],
    queryFn: () => fetchClientAppointments(session!.user.id),
    enabled: !!session,
  });

  const completedCount = appointments?.filter((a) => a.status === "completed").length ?? 0;
  const filled = Math.min(completedCount, 10);
  const remaining = Math.max(10 - completedCount, 0);

  function comingSoon() {
    Alert.alert("Em breve", "Essa área ainda está a caminho.");
  }

  return (
    <ScrollView className="flex-1 bg-bg-base" contentContainerStyle={{ padding: 20, paddingTop: 56, gap: 28 }}>
      <View className="flex-row items-center gap-4">
        <View className="h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: "#D97706" }}>
          <Text className="text-xl font-bold text-bg-base">{initials(profile?.full_name)}</Text>
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-[19px] font-semibold text-text-primary">
            {profile?.full_name ?? "Meu perfil"}
          </Text>
          <Text className="text-[13px] text-text-secondary">{profile?.phone ?? ""}</Text>
        </View>
      </View>

      <View
        className="gap-4 rounded-lg p-5"
        style={{ backgroundColor: "#1E1E24", borderWidth: 1, borderColor: "#3F3F46" }}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-[15px] font-semibold text-text-primary">Cartão Fidelidade</Text>
          <ScissorsIcon color="#D97706" size={18} />
        </View>
        <View className="flex-row flex-wrap gap-2.5">
          {Array.from({ length: 10 }, (_, i) => {
            const isFilled = i < filled;
            const isNext = i === filled;
            return (
              <View
                key={i}
                className="h-8 w-8 items-center justify-center rounded-full"
                style={
                  isFilled
                    ? { backgroundColor: "#D97706" }
                    : { borderWidth: 1.5, borderColor: "#3F3F46", borderStyle: "dashed" }
                }
              >
                {isFilled && (
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Path d="M20 6L9 17l-5-5" stroke="#121214" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                )}
                {isNext && !isFilled && <ScissorsIcon color="#A1A1AA" size={14} />}
              </View>
            );
          })}
        </View>
        <Text className="text-xs font-medium text-text-secondary">
          Faltam <Text className="font-bold text-accent">{remaining} cortes</Text> para o próximo corte grátis
        </Text>
      </View>

      <View className="gap-0.5">
        <SettingsRow
          onPress={comingSoon}
          label="Meus Dados"
          icon={
            <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
              <Circle cx="12" cy="8" r="4" stroke="#D97706" strokeWidth={1.8} />
              <Path d="M4 21c0-4 4-6 8-6s8 2 8 6" stroke="#D97706" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          }
        />
        <SettingsRow
          onPress={comingSoon}
          label="Formas de Pagamento"
          icon={
            <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
              <Path
                d="M2 8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"
                stroke="#D97706"
                strokeWidth={1.8}
              />
              <Path d="M2 10h20" stroke="#D97706" strokeWidth={1.8} />
            </Svg>
          }
        />
        <SettingsRow
          onPress={comingSoon}
          label="Notificações"
          icon={
            <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
              <Path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" stroke="#D97706" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M10 21a2 2 0 0 0 4 0" stroke="#D97706" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          }
        />
        <SettingsRow
          onPress={comingSoon}
          label="Ajuda"
          icon={
            <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
              <Circle cx="12" cy="12" r="9" stroke="#D97706" strokeWidth={1.8} />
              <Path d="M12 17v.01M12 14a2 2 0 1 0-2-2" stroke="#D97706" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          }
        />
        <Pressable onPress={signOut} className="flex-row items-center gap-3.5 py-4">
          <View className="h-9 w-9 items-center justify-center rounded-md" style={{ backgroundColor: "rgba(239,68,68,0.10)" }}>
            <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
              <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="#EF4444" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M16 17l5-5-5-5" stroke="#EF4444" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M21 12H9" stroke="#EF4444" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
          <Text className="flex-1 text-sm font-medium text-status-error">Sair</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
