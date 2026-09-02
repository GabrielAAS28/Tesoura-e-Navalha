import { useState } from "react";
import { View, Text, Pressable, Alert, ScrollView } from "react-native";
import { Link } from "expo-router";
import Svg, { Path } from "react-native-svg";
import {
  sendPhoneOtp,
  signInWithEmailPassword,
  signInWithGoogle,
  signUpWithEmailPassword,
  verifyPhoneOtp,
} from "../../lib/auth";
import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/TextField";
import { Logo } from "../../components/ui/Logo";

type Mode = "client" | "barber";
type BarberMode = "otp" | "password";
type ClientEmailMode = "login" | "signup";

function GoogleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 48 48">
      <Path
        fill="#FFC107"
        d="M43.6 20.5h-1.9V20.4H24v7.2h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.1-5.1C34.3 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"
      />
      <Path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.1-5.1C34.3 6.1 29.4 4 24 4c-7.4 0-13.8 4.2-17 10.7z"
      />
      <Path
        fill="#4CAF50"
        d="M24 44c5.3 0 10.1-2 13.7-5.4l-6.3-5.4C29.3 34.7 26.8 35.6 24 35.6c-5.2 0-9.6-3.5-11.2-8.2l-6.5 5C9.9 39.7 16.4 44 24 44z"
      />
      <Path
        fill="#1976D2"
        d="M43.6 20.5H24v7.2h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.4C41.4 35.4 44 30.1 44 24c0-1.2-.1-2.4-.4-3.5z"
      />
    </Svg>
  );
}

export default function LoginScreen() {
  const [mode, setMode] = useState<Mode>("client");
  const [barberMode, setBarberMode] = useState<BarberMode>("password");
  const [clientEmailMode, setClientEmailMode] = useState<ClientEmailMode>("login");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
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

  async function handlePasswordLogin() {
    setLoading(true);
    try {
      await signInWithEmailPassword(email, password);
    } catch (err: any) {
      Alert.alert("Não foi possível entrar", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleClientEmailSignup() {
    if (!fullName.trim()) {
      Alert.alert("Informe seu nome");
      return;
    }
    setLoading(true);
    try {
      const session = await signUpWithEmailPassword(email, password, fullName);
      if (!session) {
        Alert.alert(
          "Confirme seu e-mail",
          "Enviamos um link de confirmação para o seu e-mail. Confirme e depois entre com sua senha."
        );
        setClientEmailMode("login");
      }
    } catch (err: any) {
      Alert.alert("Não foi possível criar a conta", err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-bg-base"
      contentContainerStyle={{ padding: 24, paddingTop: 72, paddingBottom: 40, gap: 28 }}
    >
      <View className="items-center gap-4">
        <Logo />
        <View className="items-center gap-1.5">
          <Text className="text-[22px] font-semibold text-text-primary">Bem-vindo de volta</Text>
          <Text className="text-center text-sm text-text-secondary">
            Entre para continuar agendando
          </Text>
        </View>
      </View>

      <View className="flex-row rounded-full bg-bg-surface p-1">
        <Pressable
          onPress={() => setMode("client")}
          className={`flex-1 rounded-full py-2.5 ${mode === "client" ? "bg-accent" : ""}`}
        >
          <Text
            className={`text-center text-[13px] font-semibold ${
              mode === "client" ? "text-bg-base" : "text-text-secondary"
            }`}
          >
            Sou Cliente
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setMode("barber")}
          className={`flex-1 rounded-full py-2.5 ${mode === "barber" ? "bg-accent" : ""}`}
        >
          <Text
            className={`text-center text-[13px] font-semibold ${
              mode === "barber" ? "text-bg-base" : "text-text-secondary"
            }`}
          >
            Sou Barbeiro
          </Text>
        </Pressable>
      </View>

      {mode === "client" ? (
        <View className="gap-5">
          <Pressable
            disabled={loading}
            onPress={handleGoogleLogin}
            className={`h-[52px] flex-row items-center justify-center gap-2.5 rounded-md bg-text-primary ${
              loading ? "opacity-40" : ""
            }`}
          >
            <GoogleIcon />
            <Text className="text-[14px] font-semibold text-bg-base">Continuar com Google</Text>
          </Pressable>

          <View className="flex-row items-center gap-3">
            <View className="h-px flex-1 bg-border" />
            <Text className="text-xs font-medium text-text-secondary">ou entrar com e-mail</Text>
            <View className="h-px flex-1 bg-border" />
          </View>

          {clientEmailMode === "signup" && (
            <TextField label="Nome completo" placeholder="Seu nome" value={fullName} onChangeText={setFullName} />
          )}
          <TextField
            label="E-mail"
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextField
            label="Senha"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Button
            label={clientEmailMode === "signup" ? "Criar conta" : "Entrar"}
            loading={loading}
            onPress={clientEmailMode === "signup" ? handleClientEmailSignup : handlePasswordLogin}
          />

          <Pressable
            onPress={() => setClientEmailMode(clientEmailMode === "signup" ? "login" : "signup")}
            className="items-center py-1"
          >
            <Text className="text-[13px] text-text-secondary">
              {clientEmailMode === "signup" ? (
                <>
                  Já tem conta? <Text className="font-semibold text-accent">Entrar</Text>
                </>
              ) : (
                <>
                  Não tem conta? <Text className="font-semibold text-accent">Criar conta</Text>
                </>
              )}
            </Text>
          </Pressable>
        </View>
      ) : (
        <View className="gap-4">
          <View className="flex-row gap-4">
            <Pressable onPress={() => setBarberMode("password")}>
              <Text
                className={`text-[13px] font-semibold ${
                  barberMode === "password" ? "text-accent" : "text-text-secondary"
                }`}
              >
                Entrar com senha
              </Text>
            </Pressable>
            <Pressable onPress={() => setBarberMode("otp")}>
              <Text
                className={`text-[13px] font-semibold ${
                  barberMode === "otp" ? "text-accent" : "text-text-secondary"
                }`}
              >
                Entrar com código SMS
              </Text>
            </Pressable>
          </View>

          {barberMode === "password" ? (
            <>
              <TextField
                label="E-mail"
                placeholder="seu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <TextField
                label="Senha"
                placeholder="••••••••"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <Button label="Entrar" loading={loading} onPress={handlePasswordLogin} />
            </>
          ) : (
            <>
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
                label={otpSent ? "Confirmar código" : "Enviar código"}
                loading={loading}
                onPress={otpSent ? handleVerifyOtp : handleSendOtp}
              />
            </>
          )}

          <Link href="/(auth)/cadastro-barbeiro" asChild>
            <Pressable className="items-center py-2">
              <Text className="text-[13px] text-text-secondary">
                Ainda não tem barbearia cadastrada?{" "}
                <Text className="font-semibold text-accent">Cadastre-se</Text>
              </Text>
            </Pressable>
          </Link>
        </View>
      )}
    </ScrollView>
  );
}
