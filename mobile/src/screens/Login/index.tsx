import React, {useState} from 'react';
import {Alert} from 'react-native';
import {useTheme} from 'styled-components/native';
import {useNavigation} from '@react-navigation/native';
import Svg, {Path} from 'react-native-svg';
import Icon from '~/components/Icon';
import Button from '~/components/Button';
import TextField from '~/components/TextField';
import {signInWithGoogle, signInWithPhonePassword} from '~/services/authService';
import {
  Screen,
  Scroller,
  Content,
  HeaderBlock,
  LogoTile,
  HeaderTextBlock,
  Title,
  Subtitle,
  GoogleButton,
  GoogleButtonLabel,
  DividerRow,
  DividerLine,
  DividerLabel,
  FormBlock,
  FieldGroup,
  FieldLabel,
  PhoneFieldContainer,
  PhonePrefix,
  PhoneFlag,
  PhoneCode,
  PhoneInput,
  ForgotPasswordLink,
  ForgotPasswordLabel,
  BarberLink,
  BarberLinkLabel,
  EyeToggle,
} from './styles';

// Paths do logo do Google copiados de design/Login.dc.html (linhas 39-42) —
// não há ícone multicolor pronto em Icon.tsx para isso.
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

export default function Login() {
  const theme = useTheme();
  const navigation = useNavigation();

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // onAuthStateChange (AuthContext) redireciona sozinho ao autenticar.
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : String(error));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAcessarConta = async () => {
    if (!telefone || !senha) {
      Alert.alert('Erro', 'Informe telefone e senha.');
      return;
    }
    // "Confirmar senha" preenchido = usuário está tentando se cadastrar.
    // Não existe uma função de cadastro por telefone em authService (gap
    // conhecido do plano) — validamos a confirmação no cliente e seguimos
    // pelo mesmo login por telefone/senha.
    if (confirmarSenha && confirmarSenha !== senha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    const digits = telefone.replace(/\D/g, '');
    const phone = `+55${digits}`;

    setSubmitting(true);
    try {
      await signInWithPhonePassword(phone, senha);
      // onAuthStateChange (AuthContext) redireciona sozinho ao autenticar.
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : String(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <Scroller>
        <Content>
          <HeaderBlock>
            <LogoTile>
              <Icon name="scissors" size={28} color={theme.colors.accent} strokeWidth={1.6} />
            </LogoTile>
            <HeaderTextBlock>
              <Title>Bem-vindo de volta</Title>
              <Subtitle>Entre para continuar agendando</Subtitle>
            </HeaderTextBlock>
          </HeaderBlock>

          <GoogleButton
            onPress={handleGoogleLogin}
            disabled={googleLoading}
            activeOpacity={0.8}>
            <GoogleIcon />
            <GoogleButtonLabel>Continuar com Google</GoogleButtonLabel>
          </GoogleButton>

          <DividerRow>
            <DividerLine />
            <DividerLabel>ou entrar com telefone</DividerLabel>
            <DividerLine />
          </DividerRow>

          <FormBlock>
            <TextField
              label="Nome completo"
              value={nome}
              onChangeText={setNome}
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
                />
              </PhoneFieldContainer>
            </FieldGroup>

            <TextField
              label="Senha"
              value={senha}
              onChangeText={setSenha}
              placeholder="••••••••"
              secureTextEntry={!showSenha}
              rightIcon={
                <EyeToggle onPress={() => setShowSenha(v => !v)}>
                  <Icon name="eye" size={18} color={theme.colors.textSecondary} strokeWidth={1.8} />
                </EyeToggle>
              }
            />

            <TextField
              label="Confirmar senha"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              placeholder="••••••••"
              secureTextEntry={!showConfirmarSenha}
              rightIcon={
                <EyeToggle onPress={() => setShowConfirmarSenha(v => !v)}>
                  <Icon name="eye" size={18} color={theme.colors.textSecondary} strokeWidth={1.8} />
                </EyeToggle>
              }
            />

            <ForgotPasswordLink>
              <ForgotPasswordLabel>Esqueci minha senha</ForgotPasswordLabel>
            </ForgotPasswordLink>
          </FormBlock>

          <Button title="Acessar Conta" onPress={handleAcessarConta} loading={submitting} />

          <BarberLink onPress={() => navigation.navigate('BarbeiroCadastro' as never)}>
            <Icon name="scissors" size={15} color={theme.colors.textSecondary} strokeWidth={1.8} />
            <BarberLinkLabel>Sou barbeiro · Acessar como Profissional</BarberLinkLabel>
          </BarberLink>
        </Content>
      </Scroller>
    </Screen>
  );
}
