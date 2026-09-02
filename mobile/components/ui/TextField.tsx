import { View, Text, TextInput, TextInputProps } from "react-native";

type Props = TextInputProps & {
  label?: string;
};

export function TextField({ label, className, ...props }: Props) {
  return (
    <View className="gap-2">
      {label && <Text className="text-xs font-semibold text-text-secondary">{label}</Text>}
      <View className="h-[52px] flex-row items-center rounded-md border border-border bg-bg-surface px-3.5">
        <TextInput
          className={`flex-1 font-medium text-[14px] text-text-primary ${className ?? ""}`}
          placeholderTextColor="#A1A1AA"
          {...props}
        />
      </View>
    </View>
  );
}
