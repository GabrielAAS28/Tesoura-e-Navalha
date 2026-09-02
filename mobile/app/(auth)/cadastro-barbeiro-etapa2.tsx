import { useState } from "react";
import { View, Text, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../store/auth-store";
import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/TextField";

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
    <View className="flex-1 justify-center gap-4 bg-bg-base px-6">
      <View className="mb-2 gap-1">
        <Text className="text-2xl font-bold text-text-primary">Sobre a barbearia</Text>
        <Text className="text-sm text-text-secondary">Etapa 2 de 2 · Dados do negócio</Text>
      </View>

      <TextField
        label="Nome da barbearia"
        placeholder="Ex: Barbearia do Bairro"
        value={tenantName}
        onChangeText={setTenantName}
      />

      <Button label="Concluir cadastro" loading={loading} onPress={handleFinish} className="mt-2" />
    </View>
  );
}
