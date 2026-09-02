import { View, ViewProps } from "react-native";

export function Card({ className, ...props }: ViewProps) {
  return (
    <View
      className={`rounded-lg border border-border bg-bg-surface p-4 ${className ?? ""}`}
      {...props}
    />
  );
}
