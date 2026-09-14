import React, {useState} from 'react';
import {Alert} from 'react-native';
import {useTheme} from 'styled-components/native';
import {useNavigation} from '@react-navigation/native';
import Svg, {Path, Circle} from 'react-native-svg';
import Icon from '~/components/Icon';
import Button from '~/components/Button';
import TextField from '~/components/TextField';
import {sendPhoneOtp, verifyPhoneOtp} from '~/services/authService';
import {useAuth} from '~/contexts/AuthContext';
import type {BarbeiroCadastroEtapa2Params} from '~/screens/BarbeiroCadastroEtapa2';
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
  PhotoBlock,
  PhotoCircle,
  PhotoAddBadge,
  PhotoLabel,
  PhotoLabelText,
  FormBlock,
  FieldGroup,
  FieldLabel,
  PhoneFieldContainer,
  PhonePrefix,
  PhoneFlag,
  PhoneCode,
  PhoneInput,
  SectionBlock,
  SectionTitle,
  ChipsRow,
  Chip,
  ChipLabel,
  SegmentRow,
  SegmentItem,
  SegmentLabel,
  BioContainer,
  BioInput,
  OtpBlock,
  OtpHelperText,
  OtpChangePhoneLink,
  OtpChangePhoneLabel,
} from './styles';

// Path do chevron-left copiado de design/BarbeiroCadastro.dc.html (linha 24) —
// Icon.tsx só tem "chevronRight", não uma variante para a esquerda.
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

// Ícone de câmera copiado de design/BarbeiroCadastro.dc.html (linha 37) —
// não há ícone de câmera/upload pronto em Icon.tsx.
function CameraIcon({color}: {color: string}) {
  return (
    <Svg
      width={30}
      height={30}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round">
      <Path d="M4 8a2 2 0 0 1 2-2h1.2a2 2 0 0 0 1.6-.8l.6-.8a2 2 0 0 1 1.6-.8h2a2 2 0 0 1 1.6.8l.6.8a2 2 0 0 0 1.6.8H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
      <Circle cx="12" cy="13" r="3.5" />
    </Svg>
  );
}

const ESPECIALIDADES = ['Corte', 'Barba', 'Combo', 'Pigmentação', 'Sobrancelha'];

const EXPERIENCIAS: {key: string; label: string}[] = [
  {key: 'lt1', label: '< 1 ano'},
  {key: '1-3', label: '1–3 anos'},
  {key: '3-5', label: '3–5 anos'},
  {key: '5+', label: '5+ anos'},
];

export default function BarbeiroCadastro() {
  const theme = useTheme();
  const navigation = useNavigation();
  const {setBarberOnboarding} = useAuth();

  // Nome/telefone/bio são os únicos campos desta etapa efetivamente
  // persistidos (via Etapa2). E-mail, CPF, especialidades e anos de
  // experiência são UI-only: não existe coluna para eles no schema atual
  // (ver supabase/migrations/0001_init.sql) — gap de produto conhecido e
  // aceito, não algo a esconder.
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [especialidades, setEspecialidades] = useState<string[]>(['Corte', 'Barba']);
  const [experiencia, setExperiencia] = useState<string>('1-3');
  const [sobreMim, setSobreMim] = useState('');

  const [otpEnviado, setOtpEnviado] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [enviandoOtp, setEnviandoOtp] = useState(false);
  const [verificandoOtp, setVerificandoOtp] = useState(false);

  const toggleEspecialidade = (item: string) => {
    setEspecialidades(prev =>
      prev.includes(item) ? prev.filter(current => current !== item) : [...prev, item],
    );
  };

  const buildPhone = () => `+55${telefone.replace(/\D/g, '')}`;

  const handleEnviarCodigo = async () => {
    if (!nomeCompleto.trim() || !telefone.trim()) {
      Alert.alert('Erro', 'Informe nome completo e telefone.');
      return;
    }

    setEnviandoOtp(true);
    try {
      await sendPhoneOtp(buildPhone());
      setOtpEnviado(true);
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : String(error));
    } finally {
      setEnviandoOtp(false);
    }
  };

  const handleVerificarCodigo = async () => {
    if (!codigo.trim()) {
      Alert.alert('Erro', 'Informe o código recebido por SMS.');
      return;
    }

    setVerificandoOtp(true);
    // Precisa ser setado ANTES de verifyPhoneOtp, não depois: o cliente
    // @supabase/auth-js internamente AGUARDA cada subscriber de
    // onAuthStateChange (incluindo o do AuthContext, que por sua vez aguarda
    // um loadProfile assíncrono) antes de verifyPhoneOtp em si resolver. Ou
    // seja, o React já commitou pelo menos um frame com signed=true e
    // barberOnboarding=false ANTES do `await` abaixo retornar — se
    // setBarberOnboarding(true) só rodasse depois do await, routes/index.tsx
    // já teria desmontado AuthRoutes (que hospeda esta tela) nesse meio
    // tempo, e o navigate() subsequente miraria uma stack já desmontada
    // (falha silenciosa) com barberOnboarding travado em true para sempre.
    // Setar antes garante que AuthRoutes já está sendo mantido montado pelo
    // guard de barberOnboarding quando o subscriber do AuthContext rodar.
    setBarberOnboarding(true);
    try {
      await verifyPhoneOtp(buildPhone(), codigo.trim());
      const params: BarbeiroCadastroEtapa2Params = {
        nomeCompleto: nomeCompleto.trim(),
        telefone: buildPhone(),
        bio: sobreMim.trim(),
      };
      navigation.navigate('BarbeiroCadastroEtapa2' as never, params as never);
    } catch (error) {
      // Verificação falhou (código inválido, rede etc.) — nenhuma sessão real
      // foi criada, então não há onboarding de barbeiro em andamento. Limpa a
      // flag para não deixá-la travada em true para um usuário que nunca
      // chegou a autenticar.
      setBarberOnboarding(false);
      Alert.alert('Erro', error instanceof Error ? error.message : String(error));
    } finally {
      setVerificandoOtp(false);
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
            <StepBadgeLabel>1/2</StepBadgeLabel>
          </StepBadge>
        </HeaderRow>

        <Content>
          <PhotoBlock>
            <PhotoCircle>
              <CameraIcon color={theme.colors.textSecondary} />
              <PhotoAddBadge>
                <Icon name="plus" size={14} color={theme.colors.bg} strokeWidth={2.4} />
              </PhotoAddBadge>
            </PhotoCircle>
            <PhotoLabel activeOpacity={0.8}>
              <PhotoLabelText>Adicionar foto de perfil</PhotoLabelText>
            </PhotoLabel>
          </PhotoBlock>

          <FormBlock>
            <TextField
              label="Nome completo"
              value={nomeCompleto}
              onChangeText={setNomeCompleto}
              placeholder="Seu nome"
              autoCapitalize="words"
            />

            <FieldGroup>
              <FieldLabel>Número de telefone</FieldLabel>
              <PhoneFieldContainer>
                <PhonePrefix>
                  <PhoneFlag>🇧🇷</PhoneFlag>
                  <PhoneCode>+55</PhoneCode>
                </PhonePrefix>
                <PhoneInput
                  value={telefone}
                  onChangeText={setTelefone}
                  placeholder="(11) 98765-4321"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="phone-pad"
                  editable={!otpEnviado}
                />
              </PhoneFieldContainer>
            </FieldGroup>

            <TextField
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              placeholder="voce@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextField
              label="CPF"
              value={cpf}
              onChangeText={setCpf}
              placeholder="000.000.000-00"
              keyboardType="numeric"
            />
          </FormBlock>

          <SectionBlock>
            <SectionTitle>Especialidades</SectionTitle>
            <ChipsRow>
              {ESPECIALIDADES.map(item => {
                const selected = especialidades.includes(item);
                return (
                  <Chip
                    key={item}
                    selected={selected}
                    onPress={() => toggleEspecialidade(item)}
                    activeOpacity={0.8}>
                    <ChipLabel selected={selected}>{item}</ChipLabel>
                  </Chip>
                );
              })}
            </ChipsRow>
          </SectionBlock>

          <SectionBlock>
            <SectionTitle>Anos de experiência</SectionTitle>
            <SegmentRow>
              {EXPERIENCIAS.map(item => {
                const selected = experiencia === item.key;
                return (
                  <SegmentItem
                    key={item.key}
                    selected={selected}
                    onPress={() => setExperiencia(item.key)}
                    activeOpacity={0.8}>
                    <SegmentLabel selected={selected}>{item.label}</SegmentLabel>
                  </SegmentItem>
                );
              })}
            </SegmentRow>
          </SectionBlock>

          <FieldGroup>
            <FieldLabel>Sobre mim</FieldLabel>
            <BioContainer>
              <BioInput
                value={sobreMim}
                onChangeText={setSobreMim}
                placeholder="Conte um pouco sobre sua experiência e estilo de trabalho..."
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                textAlignVertical="top"
              />
            </BioContainer>
          </FieldGroup>

          {!otpEnviado ? (
            <Button title="Continuar" onPress={handleEnviarCodigo} loading={enviandoOtp} />
          ) : (
            <OtpBlock>
              <OtpHelperText>
                Enviamos um código por SMS para {buildPhone()}. Informe-o abaixo para continuar.
              </OtpHelperText>
              <TextField
                label="Código de verificação"
                value={codigo}
                onChangeText={setCodigo}
                placeholder="000000"
                keyboardType="number-pad"
              />
              <Button
                title="Verificar código"
                onPress={handleVerificarCodigo}
                loading={verificandoOtp}
              />
              <OtpChangePhoneLink
                onPress={() => {
                  setOtpEnviado(false);
                  setCodigo('');
                }}
                activeOpacity={0.8}>
                <OtpChangePhoneLabel>Alterar telefone</OtpChangePhoneLabel>
              </OtpChangePhoneLink>
            </OtpBlock>
          )}
        </Content>
      </Scroller>
    </Screen>
  );
}
