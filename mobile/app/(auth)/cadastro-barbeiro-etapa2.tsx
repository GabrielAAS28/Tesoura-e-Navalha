import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/auth-store";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function CadastroBarbeiroEtapa2Screen() {
  const { fullName } = useLocalSearchParams<{ fullName: string; phone: string }>();
  const [tenantName, setTenantName] = useState("");
  const [loading, setLoading] = useState(false);
  const { setProfile } = useAuthStore();

  async function handleFinish() {
    if (!tenantName.trim()) {
      Alert.alert("Informe o nome da barbearia");
      return;
    }
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessão não encontrada. Faça login novamente.");

      const { data: tenant, error: tenantError } = await supabase
        .from("tenants")
        .insert({ name: tenantName, slug: slugify(tenantName) })
        .select()
        .single();
      if (tenantError) throw tenantError;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          tenant_id: tenant.id,
          role: "admin",
          full_name: fullName ?? null,
          phone: user.phone ?? null,
        })
        .select()
        .single();
      if (profileError) throw profileError;

      const { error: barberError } = await supabase.from("barbers").insert({
        tenant_id: tenant.id,
        profile_id: user.id,
      });
      if (barberError) throw barberError;

      setProfile(profile);
    } catch (err: any) {
      Alert.alert("Erro ao concluir cadastro", err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <Text className="mb-1 text-2xl font-bold text-neutral-900">Sobre a barbearia</Text>
      <Text className="mb-8 text-base text-neutral-500">Etapa 2 de 2 · Dados do negócio</Text>

      <TextInput
        className="mb-3 rounded-xl border border-neutral-200 px-4 py-3"
        placeholder="Nome da barbearia"
        value={tenantName}
        onChangeText={setTenantName}
      />

      <Pressable
        disabled={loading}
        onPress={handleFinish}
        className="items-center rounded-xl bg-neutral-900 py-4"
      >
        <Text className="font-semibold text-white">Concluir cadastro</Text>
      </Pressable>
    </View>
  );
}
