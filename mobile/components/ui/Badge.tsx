import { Text, View } from "react-native";

export type BadgeStatus = "pending" | "confirmed" | "cancelled" | "completed";

const STATUS_CONFIG: Record<BadgeStatus, { label: string; color: string; bg: string }> = {
  confirmed: { label: "Confirmado", color: "#D97706", bg: "rgba(217,119,6,0.15)" },
  pending: { label: "Pendente", color: "#A1A1AA", bg: "rgba(161,161,170,0.15)" },
  completed: { label: "Concluído", color: "#22C55E", bg: "rgba(34,197,94,0.15)" },
  cancelled: { label: "Cancelado", color: "#EF4444", bg: "rgba(239,68,68,0.15)" },
};

export function StatusBadge({ status }: { status: BadgeStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <View
      className="h-[26px] items-center justify-center self-start rounded-full px-3"
      style={{ backgroundColor: config.bg }}
    >
      <Text className="text-[11px] font-semibold" style={{ color: config.color }}>
        {config.label}
      </Text>
    </View>
  );
}
