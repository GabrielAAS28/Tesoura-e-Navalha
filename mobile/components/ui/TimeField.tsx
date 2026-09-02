import { useState } from "react";
import { View, Text, TextInput } from "react-native";

type Props = {
  label?: string;
  value: string; // sempre "HH:MM" normalizado
  onChangeValue: (value: string) => void;
};

function formatDigitsAsMask(digits: string) {
  const clipped = digits.slice(0, 4);
  if (clipped.length <= 2) return clipped;
  return `${clipped.slice(0, 2)}:${clipped.slice(2)}`;
}

function normalize(raw: string) {
  const [hourPart = "", minutePart = ""] = raw.split(":");

  let hour = hourPart === "" ? "00" : hourPart.padStart(2, "0");
  let minute = minutePart === "" ? "00" : minutePart.padStart(2, "0");

  hour = String(Math.min(23, Math.max(0, Number(hour) || 0))).padStart(2, "0");
  minute = String(Math.min(59, Math.max(0, Number(minute) || 0))).padStart(2, "0");

  return `${hour}:${minute}`;
}

// Input de horário com máscara "HH:MM" ao digitar (aceita só dígitos, insere
// o ":" automaticamente) e normalização ao perder o foco: qualquer parte
// incompleta (hora ou minuto) vira "00" em vez de mandar um valor inválido
// pro banco (coluna `time` do Postgres rejeita "9", "9:3", etc.).
export function TimeField({ label, value, onChangeValue }: Props) {
  const [text, setText] = useState(value);

  function handleChangeText(raw: string) {
    const digits = raw.replace(/[^0-9]/g, "");
    setText(formatDigitsAsMask(digits));
  }

  function handleBlur() {
    const normalized = normalize(text);
    setText(normalized);
    onChangeValue(normalized);
  }

  return (
    <View className="gap-2">
      {label && <Text className="text-xs font-semibold text-text-secondary">{label}</Text>}
      <View className="h-[52px] flex-row items-center rounded-md border border-border bg-bg-surface px-3.5">
        <TextInput
          className="flex-1 font-medium text-[14px] text-text-primary"
          placeholder="HH:MM"
          placeholderTextColor="#A1A1AA"
          keyboardType="number-pad"
          maxLength={5}
          value={text}
          onChangeText={handleChangeText}
          onBlur={handleBlur}
        />
      </View>
    </View>
  );
}
