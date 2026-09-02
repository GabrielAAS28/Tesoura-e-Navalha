import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { Link } from "expo-router";
import { sendPhoneOtp, signInWithGoogle, verifyPhoneOtp } from "../../lib/auth";

type Mode = "client" | "barber";

export default function LoginScreen() {
  const [mode, setMode] = useState<Mode>("client");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleGoogleLogin() {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      Alert.alert("Erro ao entrar com Google", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOtp() {
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
    } catch (err: any) {
      Alert.alert("Código inválido", err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <Text className="mb-2 text-3xl font-bold text-neutral-900">Navalha</Text>
      <Text className="mb-8 text-base text-neutral-500">
        Agende seu horário ou gerencie sua barbearia.
      </Text>

      <View className="mb-6 flex-row rounded-full bg-neutral-100 p-1">
        <Pressable
          onPress={() => setMode("client")}
          className={`flex-1 rounded-full py-2 ${mode === "client" ? "bg-neutral-900" : ""}`}
        >
          <Text
            className={`text-center font-medium ${mode === "client" ? "text-white" : "text-neutral-600"}`}
          >
            Sou Cliente
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setMode("barber")}
          className={`flex-1 rounded-full py-2 ${mode === "barber" ? "bg-neutral-900" : ""}`}
        >
          <Text
            className={`text-center font-medium ${mode === "barber" ? "text-white" : "text-neutral-600"}`}
          >
            Sou Barbeiro
          </Text>
        </Pressable>
      </View>

      {mode === "client" ? (
        <Pressable
          disabled={loading}
          onPress={handleGoogleLogin}
          className="items-center rounded-xl bg-neutral-900 py-4"
        >
          <Text className="font-semibold text-white">Entrar com Google</Text>
        </Pressable>
      ) : (
        <View>
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
              {otpSent ? "Confirmar código" : "Enviar código"}
            </Text>
          </Pressable>

          <Link href="/(auth)/cadastro-barbeiro" asChild>
            <Pressable className="mt-4 items-center py-2">
              <Text className="text-neutral-500">Ainda não tem barbearia cadastrada? Cadastre-se</Text>
            </Pressable>
          </Link>
        </View>
      )}
    </View>
  );
}
