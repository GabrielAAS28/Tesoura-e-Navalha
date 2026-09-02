import { Pressable, Text, ActivityIndicator, PressableProps } from "react-native";

type Variant = "primary" | "secondary" | "ghost";

type Props = PressableProps & {
  variant?: Variant;
  label: string;
  loading?: boolean;
};

const VARIANT_STYLES: Record<Variant, { container: string; label: string }> = {
  primary: { container: "bg-accent", label: "text-bg-base" },
  secondary: { container: "border-[1.5px] border-accent bg-transparent", label: "text-accent" },
  ghost: { container: "bg-transparent", label: "text-text-primary" },
};

export function Button({ variant = "primary", label, loading, disabled, className, ...props }: Props) {
  const styles = VARIANT_STYLES[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      className={`h-[52px] items-center justify-center rounded-md ${styles.container} ${
        isDisabled ? "opacity-40" : ""
      } ${className ?? ""}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#121214" : "#D97706"} />
      ) : (
        <Text className={`font-semibold text-[15px] ${styles.label}`}>{label}</Text>
      )}
    </Pressable>
  );
}
