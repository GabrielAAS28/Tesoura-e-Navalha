import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { sendPhoneOtp, verifyPhoneOtp } from "../../lib/auth";

export default function CadastroBarbeiroScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSendOtp() {
    if (!fullName.trim() || !phone.trim()) {
      Alert.alert("Preencha nome e telefone");
      return;
    }
    setLoading(true);
    try {
      await sendPhoneOtp(phone);
      setOtpSent(true);
    } catch (err: any) {
      Alert.alert("Erro ao enviar código", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setLoading(true);
    try {
      await verifyPhoneOtp(phone, otp);
      router.push({
        pathname: "/(auth)/cadastro-barbeiro-etapa2",
        params: { fullName, phone },
      });
    } catch (err: any) {
      Alert.alert("Código inválido", err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <Text className="mb-1 text-2xl font-bold text-neutral-900">Cadastre sua barbearia</Text>
      <Text className="mb-8 text-base text-neutral-500">Etapa 1 de 2 · Seus dados</Text>

      <TextInput
        className="mb-3 rounded-xl border border-neutral-200 px-4 py-3"
        placeholder="Seu nome completo"
        value={fullName}
        onChangeText={setFullName}
        editable={!otpSent}
      />
      <TextInput
        className="mb-3 rounded-xl border border-neutral-200 px-4 py-3"
        placeholder="Telefone (com DDD)"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        editable={!otpSent}
      />

      {otpSent && (
        <TextInput
          className="mb-3 rounded-xl border border-neutral-200 px-4 py-3"
          placeholder="Código recebido por SMS"
          keyboardType="number-pad"
          value={otp}
          onChangeText={setOtp}
        />
      )}

      <Pressable
        disabled={loading}
        onPress={otpSent ? handleVerifyOtp : handleSendOtp}
        className="items-center rounded-xl bg-neutral-900 py-4"
      >
        <Text className="font-semibold text-white">
          {otpSent ? "Confirmar e continuar" : "Enviar código"}
        </Text>
      </Pressable>
    </View>
  );
}
