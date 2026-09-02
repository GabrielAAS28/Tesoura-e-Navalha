import { useState } from "react";
import { View, Text, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { sendPhoneOtp, verifyPhoneOtp } from "../../lib/auth";
import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/TextField";

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
    <ScrollView
      className="flex-1 bg-bg-base"
      contentContainerStyle={{ padding: 24, paddingTop: 72, gap: 16 }}
    >
      <View className="mb-2 gap-1">
        <Text className="text-2xl font-bold text-text-primary">Cadastre sua barbearia</Text>
        <Text className="text-sm text-text-secondary">Etapa 1 de 2 · Seus dados</Text>
      </View>

      <TextField
        label="Seu nome completo"
        placeholder="Seu nome"
        value={fullName}
        onChangeText={setFullName}
        editable={!otpSent}
      />
      <TextField
        label="Número de telefone"
        placeholder="(11) 98765-4321"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        editable={!otpSent}
      />

      {otpSent && (
        <TextField
          label="Código recebido por SMS"
          placeholder="000000"
          keyboardType="number-pad"
          value={otp}
          onChangeText={setOtp}
        />
      )}

      <Button
        label={otpSent ? "Confirmar e continuar" : "Enviar código"}
        loading={loading}
        onPress={otpSent ? handleVerifyOtp : handleSendOtp}
        className="mt-2"
      />
    </ScrollView>
  );
}
