# Spec — Rewrite do app mobile "Barbearia do Bairro" (bare React Native)

- **Data:** 2026-09-02
- **Autor:** Gabriel (GAAS28) + Claude
- **Status:** Aprovado para planejamento
- **Projeto:** `Barbearia_Bairro/mobile`

## 1. Contexto e problema

A entrega anterior do app mobile foi feita em **Expo** (expo-router, NativeWind,
Zustand, TanStack Query, TypeScript), o que **não corresponde ao padrão de
desenvolvimento do autor**. O padrão de referência é o projeto
`gestao-condominio-app`:

- React Native **CLI/bare** (não Expo) — `react-native run-android/ios`
- **styled-components** com objeto `theme` tipado
- **@react-navigation** (`src/routes/`)
- Estado via **Contexts** (`src/contexts/`) + dados via **services** (`src/services/`)
- Estrutura **`src/screens/<Nome>/{index, styles}`**
- **Jest** para testes

Além da stack divergente, as telas entregues **não reproduzem a fidelidade
visual** dos mockups em `design/*.dc.html` (Claude Design canvas).

## 2. Objetivo

Reconstruir o app mobile **na stack/estrutura do padrão do autor**, em
**TypeScript**, reproduzindo **1:1** os mockups de `design/`, e **reaproveitando
o backend Supabase** já existente (migrations + Edge Function).

### Não-objetivos (fora de escopo)

- Alterar o schema/RLS do Supabase (`supabase/migrations/`) — permanece como está.
- Cobrança via Stripe/Pagar.me e pagamento dentro do checkout (segue MVP: PIX/manual).
- Painel web de admin.
- Publicação nas lojas (tratado depois; existe `PUBLICAR-PLAY-STORE.md` de referência).

## 3. Decisões (aprovadas)

| # | Decisão | Valor |
|---|---------|-------|
| D1 | Base | React Native CLI (bare), **não Expo** |
| D2 | Linguagem | **TypeScript** (.tsx / .ts) |
| D3 | Estilo | **styled-components** + `theme` tipado |
| D4 | Navegação | **@react-navigation** (native-stack + bottom-tabs) |
| D5 | Estado/dados | **Context** (Auth) + **services** (sem Zustand/react-query) |
| D6 | Ícones | **react-native-svg** com paths exatos dos mockups (fidelidade) |
| D7 | Backend | **Supabase mantido** (via `@supabase/supabase-js`) |
| D8 | Google login | **`@react-native-google-signin/google-signin`** → `signInWithIdToken` |
| D9 | Fontes | **Plus Jakarta Sans** via `assets/fonts` + `react-native.config.js` |
| D10 | Env | **`react-native-config`** (substitui `EXPO_PUBLIC_*`) |

## 4. Arquitetura de pastas

```
mobile/
  android/ ios/            # projeto nativo (RN CLI)
  index.js  App.tsx        # App monta ThemeProvider + AuthProvider + Routes
  react-native.config.js   # link de fontes
  src/
    config/    env.ts                      # lê SUPABASE_URL / ANON_KEY / GOOGLE_WEB_CLIENT_ID
    styles/    theme.ts                     # tokens do Foundations.dc.html
    contexts/  AuthContext.tsx
    services/  supabase.ts authService.ts tenantService.ts
               servicoService.ts horarioService.ts agendamentoService.ts
               barberService.ts slots.ts
    routes/    index.tsx auth.routes.tsx client.routes.tsx barber.routes.tsx
    components/ Button TextField Card ServiceCard BarberCard Avatar
                Badge HeroCard BottomTabBar Icon (+ styles co-locados)
    types/     index.ts                      # portado de lib/types.ts
    screens/
      Splash/ Login/ BarbeiroCadastro/ BarbeiroCadastroEtapa2/
      Main/ Servicos/ Agendamento/ Checkout/ Agendamentos/ Perfil/
      BarbeiroAgenda/ BarbeiroServicos/ BarbeiroHorarios/
        └ cada uma: index.tsx + styles.ts
```

O conteúdo Expo atual é preservado em git (histórico) e substituído; nenhuma
lógica reaproveitável é perdida (ver §7).

## 5. Design system (de `design/Foundations.dc.html`)

**`theme.ts`:**

```ts
colors: {
  bg: '#121214', surface: '#1E1E24', surfaceAlt: '#26262E', border: '#3F3F46',
  textPrimary: '#F4F4F5', textSecondary: '#A1A1AA',
  accent: '#D97706', accentHover: '#B45309',
  success: '#22C55E', error: '#EF4444',
}
radius:  { sm: 8, md: 12, lg: 16, full: 999 }
spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }
font:    'PlusJakartaSans' (weights 400/500/600/700/800)
type:    display 28/700 · h1 22/600 · h2 18/600 · body 15/400 · caption 13/400
```

**Componentes base** (styled-components):

- `Button` — variants `primary` (âmbar, texto `#121214`), `secondary` (outline
  âmbar), `ghost`; estados `disabled` (opacity .4) e `pressed` (`accentHover`);
  altura 52 (ação) / 44 (compacto); radius md.
- `TextField` — label caption `#A1A1AA` + campo `surface`/`border` h52 radius md,
  slot de ícone à direita (ex.: olho de senha).
- `Card` / `ServiceCard` — `surface` + `border`, radius lg, tile de ícone
  `rgba(217,119,6,.15)`, título + subtítulo "Xmin · R$Y".
- `BarberCard` / `Avatar` — círculo gradiente `#3F3F46→#26262E` com iniciais;
  estrela âmbar + nota; borda âmbar quando selecionado.
- `Badge` — pílula tintada por status: Confirmado (âmbar), Pendente (cinza),
  Concluído (verde), Cancelado (vermelho).
- `HeroCard` — gradiente `#D97706→#B45309`, texto `#121214`.
- `BottomTabBar` — custom, fundo `surface`, borda topo, item ativo âmbar.
- `Icon` — react-native-svg com paths exatos: `scissors` (marca), `home`,
  `calendar`, `bell`, `star`, `eye`, `chevron`, `plus`, `trash`, `clock`, `user`.

Gradientes: `react-native-linear-gradient`.

## 6. Telas (portadas 1:1 dos `.dc.html`)

**Auth** (`auth.routes.tsx`, native-stack):

- **Splash** — boot; enquanto `AuthContext.loading`, mostra logo/tesoura.
- **Login** (`Login.dc.html`) — botão "Continuar com Google"; divisor "ou entrar
  com telefone"; campos nome/telefone(+55)/senha/confirmar; "Esqueci minha
  senha"; botão "Acessar Conta"; link "Sou barbeiro · Acessar como Profissional".
- **BarbeiroCadastro** (`BarbeiroCadastro.dc.html`) — etapa 1: telefone + envio/
  verificação de OTP.
- **BarbeiroCadastroEtapa2** (`BarbeiroCadastroEtapa2.dc.html`) — dados da
  barbearia (cria `tenant` + `profile` role=barber/admin + `barber`).

**Cliente** (`client.routes.tsx`, bottom-tabs + stack):

- **Main / Início** (`Main.dc.html`) — header "Olá, {nome}" + avatar + sino;
  HeroCard "Agendamento Rápido"; carrossel "Serviços em destaque"; carrossel
  "Barbeiros favoritos".
- **Servicos** (`Servicos.dc.html`) — lista de serviços do tenant.
- **Agendamento** (`Agendamento.dc.html` / `Agendamentos.dc.html`) — escolher
  barbeiro, data e horário; slots via `computeFreeSlots`.
- **Checkout** (`Checkout.dc.html`) — resumo (serviço, barbeiro, data/hora,
  preço) + confirmar → `createAppointment` (Edge Function anti-double-booking).
- **Agendamentos** — "Meus Agendamentos" (`fetchClientAppointments`) com `Badge`;
  cancelar (RLS permite cliente cancelar).
- **Perfil** (`Perfil.dc.html`) — dados do usuário + logout.

**Barbeiro** (`barber.routes.tsx`, bottom-tabs):

- **BarbeiroAgenda** (`BarbeiroAgenda.dc.html`) — agenda do dia
  (`fetchBarberAppointments`), alterar status (confirmar/concluir/cancelar).
- **BarbeiroServicos** (`BarbeiroServicos.dc.html`) — CRUD serviços & preços.
- **BarbeiroHorarios** (`BarbeiroHorarios.dc.html`) — CRUD horários de trabalho.
- **Perfil** — compartilhado.

## 7. Camada de dados e auth

**Reaproveitado 1:1 do `mobile/lib/` atual** (Supabase puro, sem Expo):

- `lib/queries.ts` → dividido nos `services/*` (mesmas queries).
- `lib/types.ts` → `src/types/index.ts`.
- `lib/slots.ts` → `src/services/slots.ts` (regra pura; alvo de teste unitário).

**Reescrito** (era Expo):

- `authService.signInWithGoogle` — `@react-native-google-signin/google-signin`
  (`GoogleSignin.signIn()` → `idToken`) → `supabase.auth.signInWithIdToken(
  { provider: 'google', token })`. Requer `GOOGLE_WEB_CLIENT_ID`.
- OTP telefone / phone+senha / email+senha / signUp / signOut — Supabase puro,
  portados de `lib/auth.ts` (sem `expo-web-browser`/`expo-linking`).
- `supabase.ts` — `createClient` com `AsyncStorage`; env via `react-native-config`.

**AuthContext** (`contexts/AuthContext.tsx`):

- Estado: `session`, `profile`, `loading`.
- `useEffect` inicial: `supabase.auth.getSession()` + `fetchProfile`.
- `supabase.auth.onAuthStateChange` → atualiza sessão/profile.
- Deriva `signed = !!session`, `role = profile?.role`.
- Expõe `signIn*`, `signOut`.

## 8. Modelo de dados (existente, não alterar)

`tenants` · `profiles(id, tenant_id, role: client|barber|admin, full_name, phone)`
· `barbers(tenant_id, profile_id, bio)` · `services(tenant_id, name,
duration_minutes, price_cents, buffer_minutes)` · `working_hours(barber_id,
weekday, start_time, end_time)` · `appointments(client_id, barber_id, service_id,
starts_at, status: pending|confirmed|completed|cancelled)`.

RLS multi-tenant + `EXCLUDE` anti-double-booking; criação de agendamento pela
Edge Function `create_appointment` (fonte da verdade contra conflito).

## 9. Estratégia de testes

- **Jest** (config espelhando `gestao-condominio-app`).
- **Unitário:** `services/slots.ts` (`computeFreeSlots`) — casos de borda de
  janela/duração/sobreposição/cancelado.
- **Componente (smoke):** `Button`, `TextField`, `Badge` renderizam por variant.
- **`typecheck`** (`tsc --noEmit`) e **`lint`** (eslint) verdes.
- Validação visual manual tela-a-tela no emulador (Android Studio aberto) contra
  cada `.dc.html`.

## 10. Riscos e mitigações

| Risco | Mitigação |
|-------|-----------|
| Google Sign-In nativo exige `webClientId` + config no Android (SHA-1) | Documentar setup; OTP telefone funciona como caminho alternativo no piloto |
| Linkagem de fontes nativas quebrar build | `react-native-asset` + verificação no emulador cedo |
| Divergência de versões RN vs `gestao-condominio-app` | Alinhar toolchain às versões do projeto de referência |
| Perda de lógica ao trocar de Expo | `lib/queries|types|slots` portados 1:1 antes de remover Expo |
| `.env` do Supabase versionado por engano | `.gitignore` cobrindo `.env`; usar `react-native-config` |

## 11. Critérios de aceitação

1. `mobile/` roda via `react-native run-android` (bare, sem Expo).
2. Estrutura `src/screens/<Nome>/{index.tsx, styles.ts}`, styled-components,
   `@react-navigation`, contexts + services — igual ao padrão do autor.
3. Todas as telas do §6 batem visualmente com os `.dc.html` correspondentes.
4. Fluxos MVP funcionais: login (Google + telefone), cliente agenda →
   confirma → vê "Meus Agendamentos"; barbeiro cadastra, gerencia agenda/
   serviços/horários.
5. `typecheck`, `lint` e `jest` verdes.
