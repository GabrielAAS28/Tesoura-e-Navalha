import React, {useState} from 'react';
import {Alert} from 'react-native';
import {useTheme} from 'styled-components/native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Svg, {Path} from 'react-native-svg';
import Button from '~/components/Button';
import TextField from '~/components/TextField';
import {supabase} from '~/services/supabase';
import {useAuth} from '~/contexts/AuthContext';
import {
  Screen,
  Scroller,
  HeaderRow,
  HeaderLeft,
  BackButton,
  HeaderTitle,
  StepBadge,
  StepBadgeLabel,
  Content,
  SectionBlock,
  SectionTitle,
  Row,
  FlexItem,
  FieldGroup,
  FieldLabel,
  PixFieldContainer,
  PixInput,
  UploadBox,
  UploadBoxLabel,
  TermosRow,
  Checkbox,
  TermosText,
  TermosLink,
} from './styles';

// Parâmetros recebidos da Etapa1 via navigation (nome/telefone confirmados
// pelo OTP + bio) — não há um tipo de ParamList compartilhado no projeto
// ainda, então este tipo é a fonte da verdade para essa navegação.
export type BarbeiroCadastroEtapa2Params = {
  nomeCompleto: string;
  telefone: string;
  bio: string;
};

// Path do chevron-left copiado de design/BarbeiroCadastroEtapa2.dc.html
// (linha 24) — Icon.tsx só tem "chevronRight".
function ChevronLeftIcon({color}: {color: string}) {
  return (
    <Svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round">
      <Path d="M15 6l-6 6 6 6" />
    </Svg>
  );
}

// Ícone de raio (chave PIX) copiado de design/BarbeiroCadastroEtapa2.dc.html
// (linha 81) — ícone fill-based, não existe em Icon.tsx.
function PixIcon({color}: {color: string}) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill={color} stroke="none">
      <Path d="M13 2L3 14h7l-1 8 11-14h-7z" />
    </Svg>
  );
}

// Ícone de upload copiado de design/BarbeiroCadastroEtapa2.dc.html (linha 90).
function UploadDocIcon({color}: {color: string}) {
  return (
    <Svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round">
      <Path d="M12 16V4M12 4l-4 4M12 4l4 4" />
      <Path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </Svg>
  );
}

// Ícone de check do checkbox de termos, copiado de
// design/BarbeiroCadastroEtapa2.dc.html (linha 97).
function CheckIcon({color}: {color: string}) {
  return (
    <Svg
      width={13}
      height={13}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round">
      <Path d="M20 6L9 17l-5-5" />
    </Svg>
  );
}

// Slug precisa ser único (constraint UNIQUE em tenants.slug) — normaliza o
// nome e agrega um sufixo aleatório curto para evitar colisão entre
// barbeiros com nomes parecidos.
const DIACRITICS_REGEX = /[̀-ͯ]/g;

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(DIACRITICS_REGEX, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '');
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

export default function BarbeiroCadastroEtapa2() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const {refreshProfile, setBarberOnboarding} = useAuth();

  const params = (route.params ?? {}) as Partial<BarbeiroCadastroEtapa2Params>;
  const nomeCompleto = params.nomeCompleto ?? '';
  const telefone = params.telefone ?? '';
  const bio = params.bio ?? '';

  // Campos desta etapa que não têm coluna no schema atual (endereço, PIX,
  // documento, termos) — UI-only, não persistidos. Ver
  // supabase/migrations/0001_init.sql: tenants(id,name,slug,created_at),
  // profiles(id,tenant_id,role,full_name,phone,created_at),
  // barbers(id,tenant_id,profile_id,bio,created_at).
  const [cep, setCep] = useState('');
  const [cidade, setCidade] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [pix, setPix] = useState('');
  const [termosAceitos, setTermosAceitos] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Guarda o tenant já criado numa tentativa anterior: se o profile/barber
  // falhar depois do insert de tenants (ex.: conexão instável) e o usuário
  // tocar "Finalizar Cadastro" de novo, reaproveita esse tenant em vez de
  // criar um novo — evita acumular linhas de tenants órfãs a cada retry.
  const [createdTenantId, setCreatedTenantId] = useState<string | null>(null);

  const handleFinalizar = async () => {
    if (!termosAceitos) {
      Alert.alert('Erro', 'Você precisa aceitar os Termos de Uso e a Política de Privacidade.');
      return;
    }
    if (!nomeCompleto || !telefone) {
      Alert.alert(
        'Erro',
        'Dados da etapa anterior não encontrados. Volte e refaça o cadastro.',
      );
      return;
    }

    setSubmitting(true);
    try {
      // Sessão é buscada de novo aqui (em vez de useAuth().session) para não
      // depender do timing do onAuthStateChange do AuthContext, que roda
      // de forma assíncrona após o verifyPhoneOtp da Etapa1 — se o usuário
      // chegar aqui antes desse evento processar, session do contexto
      // poderia ainda estar null.
      const {data: sessionData, error: sessionError} = await supabase.auth.getSession();
      if (sessionError) {
        Alert.alert('Erro', sessionError.message);
        return;
      }
      const session = sessionData.session;
      if (!session) {
        Alert.alert(
          'Erro',
          'Sessão não encontrada. A verificação do telefone pode não ter sido concluída — refaça o cadastro a partir da etapa anterior.',
        );
        return;
      }

      // Se uma tentativa anterior já criou o tenant e falhou depois disso
      // (profile ou barber), reaproveita o id em vez de inserir de novo.
      let tenantId = createdTenantId;
      if (!tenantId) {
        // Não há campo "nome da barbearia" no mockup desta etapa — o nome
        // do tenant é derivado do nome completo informado na Etapa1.
        const tenantName = `Barbearia de ${nomeCompleto}`;
        const slug = `${slugify(tenantName)}-${randomSuffix()}`;

        const {data: tenant, error: tenantError} = await supabase
          .from('tenants')
          .insert({name: tenantName, slug})
          .select()
          .single();
        if (tenantError || !tenant) {
          Alert.alert('Erro', tenantError?.message ?? 'Não foi possível criar a barbearia.');
          return;
        }
        tenantId = tenant.id;
        setCreatedTenantId(tenant.id);
      }

      const {error: profileError} = await supabase.from('profiles').upsert({
        id: session.user.id,
        tenant_id: tenantId,
        role: 'admin',
        full_name: nomeCompleto,
        phone: telefone,
      });
      if (profileError) {
        Alert.alert('Erro', profileError.message);
        return;
      }

      const {error: barberError} = await supabase.from('barbers').insert({
        tenant_id: tenantId,
        profile_id: session.user.id,
        bio: bio || null,
      });
      if (barberError) {
        Alert.alert('Erro', barberError.message);
        return;
      }

      // routes/index.tsx troca para BarberRoutes automaticamente assim que
      // profile.role vira 'admin' — só precisamos forçar o reload aqui.
      await refreshProfile();
      // Só agora é seguro derrubar o "modo onboarding" que mantinha
      // AuthRoutes montado apesar de signed=true (ver BarbeiroCadastro/
      // index.tsx e routes/index.tsx) — profile.role já é 'admin' neste
      // ponto, então routes/index.tsx roteia para BarberRoutes em vez de
      // cair de volta em ClientRoutes.
      setBarberOnboarding(false);
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : String(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <Scroller>
        <HeaderRow>
          <HeaderLeft>
            <BackButton onPress={() => navigation.goBack()} activeOpacity={0.8}>
              <ChevronLeftIcon color={theme.colors.textPrimary} />
            </BackButton>
            <HeaderTitle>Cadastro de Profissional</HeaderTitle>
          </HeaderLeft>
          <StepBadge>
            <StepBadgeLabel>2/2</StepBadgeLabel>
          </StepBadge>
        </HeaderRow>

        <Content>
          <SectionBlock>
            <SectionTitle>Endereço do local de trabalho</SectionTitle>

            <Row>
              <FlexItem grow={1}>
                <TextField
                  label="CEP"
                  value={cep}
                  onChangeText={setCep}
                  placeholder="00000-000"
                  keyboardType="number-pad"
                />
              </FlexItem>
              <FlexItem grow={2}>
                <TextField
                  label="Cidade"
                  value={cidade}
                  onChangeText={setCidade}
                  placeholder="São Paulo"
                />
              </FlexItem>
            </Row>

            <TextField
              label="Endereço"
              value={endereco}
              onChangeText={setEndereco}
              placeholder="Rua, avenida..."
            />

            <Row>
              <FlexItem grow={1}>
                <TextField
                  label="Número"
                  value={numero}
                  onChangeText={setNumero}
                  placeholder="123"
                  keyboardType="number-pad"
                />
              </FlexItem>
              <FlexItem grow={2}>
                <TextField
                  label="Bairro"
                  value={bairro}
                  onChangeText={setBairro}
                  placeholder="Centro"
                />
              </FlexItem>
            </Row>
          </SectionBlock>

          <SectionBlock>
            <SectionTitle>Dados para recebimento</SectionTitle>
            <FieldGroup>
              <FieldLabel>Chave PIX</FieldLabel>
              <PixFieldContainer>
                <PixIcon color={theme.colors.accent} />
                <PixInput
                  value={pix}
                  onChangeText={setPix}
                  placeholder="CPF, e-mail, telefone ou chave aleatória"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </PixFieldContainer>
            </FieldGroup>
          </SectionBlock>

          <SectionBlock>
            <SectionTitle>Documento de identificação</SectionTitle>
            <UploadBox activeOpacity={0.8}>
              <UploadDocIcon color={theme.colors.textSecondary} />
              <UploadBoxLabel>Enviar foto do RG ou CNH</UploadBoxLabel>
            </UploadBox>
          </SectionBlock>

          <TermosRow>
            <Checkbox
              checked={termosAceitos}
              onPress={() => setTermosAceitos(v => !v)}
              activeOpacity={0.8}>
              {termosAceitos ? <CheckIcon color={theme.colors.bg} /> : null}
            </Checkbox>
            <TermosText>
              Li e aceito os <TermosLink>Termos de Uso</TermosLink> e a{' '}
              <TermosLink>Política de Privacidade</TermosLink>
            </TermosText>
          </TermosRow>

          <Button title="Finalizar Cadastro" onPress={handleFinalizar} loading={submitting} />
        </Content>
      </Scroller>
    </Screen>
  );
}
