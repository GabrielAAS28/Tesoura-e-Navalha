# Barbearia do Bairro — Mobile Rewrite (bare React Native) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconstruir o app mobile `Barbearia do Bairro` em bare React Native (CLI) + TypeScript, no padrão do autor (styled-components, react-navigation, `src/screens`, contexts + services), reproduzindo 1:1 os mockups de `design/*.dc.html` e reaproveitando o backend Supabase existente.

**Architecture:** RN CLI bare. `App.tsx` monta `NavigationContainer > ThemeProvider > AuthProvider > Routes`. Estado de sessão em `AuthContext`; dados via módulos em `src/services/` que chamam Supabase direto (sem react-query/zustand). Cada tela é uma pasta `src/screens/<Nome>/{index.tsx, styles.ts}` (styled-components). Navegação ramifica por `profile.role`.

**Tech Stack:** React Native 0.80.1 (CLI), TypeScript, styled-components/native, @react-navigation (native-stack + bottom-tabs), react-native-svg, react-native-linear-gradient, @supabase/supabase-js, @react-native-async-storage/async-storage, react-native-config, @react-native-google-signin/google-signin, date-fns, Jest.

**Spec:** `docs/superpowers/specs/2026-09-02-barbearia-bairro-mobile-rewrite-design.md`

## Global Constraints

- Base **bare RN CLI 0.80.1** — sem Expo, sem `expo-*`, sem NativeWind, sem expo-router, sem zustand, sem @tanstack/react-query.
- Linguagem **TypeScript**; estilos **styled-components/native** com `theme` tipado (nunca cores hardcoded fora de `theme.ts`).
- Estrutura de tela: `src/screens/<Nome>/{index.tsx, styles.ts}`. Alias `~` → `./src` (babel module-resolver + jest moduleNameMapper).
- Tokens de cor/tipografia SOMENTE de `src/styles/theme.ts` (valores de `design/Foundations.dc.html`): bg `#121214`, surface `#1E1E24`, surfaceAlt `#26262E`, border `#3F3F46`, textPrimary `#F4F4F5`, textSecondary `#A1A1AA`, accent `#D97706`, accentHover `#B45309`, success `#22C55E`, error `#EF4444`. Fonte `Plus Jakarta Sans`.
- Backend Supabase **não é alterado** (`supabase/migrations/` intocado). Modelo: `tenants, profiles(role client|barber|admin), barbers, services, working_hours, appointments(status pending|confirmed|completed|cancelled)`.
- Criação de agendamento SEMPRE via Edge Function `create_appointment` (fonte da verdade anti-double-booking).
- Cada tela deve bater visualmente com o `.dc.html` de mesmo nome em `design/` (largura de referência 390px).
- Lint (`eslint @react-native`), prettier (`arrowParens: avoid, singleQuote, trailingComma: all`), `tsc --noEmit` e `jest` devem passar.
- Commits pequenos e frequentes; mensagens seguem Conventional Commits e terminam com `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

---

## File Structure

```
mobile/
  index.js                      # AppRegistry
  App.tsx                       # providers + Routes
  app.json                      # { name, displayName }
  babel.config.js metro.config.js jest.config.js jest.setup.js
  react-native.config.js        # link de fontes
  tsconfig.json .eslintrc.js .prettierrc.js
  android/ ios/                 # nativo (gerado pelo CLI)
  assets/fonts/                 # PlusJakartaSans-*.ttf
  src/
    config/env.ts               # SUPABASE_URL, SUPABASE_ANON_KEY, GOOGLE_WEB_CLIENT_ID
    styles/theme.ts styled.d.ts # tema + tipagem do DefaultTheme
    types/index.ts              # domínio (portado de lib/types.ts)
    services/
      supabase.ts authService.ts tenantService.ts servicoService.ts
      horarioService.ts agendamentoService.ts barberService.ts slots.ts
    contexts/AuthContext.tsx
    routes/index.tsx auth.routes.tsx client.routes.tsx barber.routes.tsx
    components/
      Icon.tsx Button/ TextField/ Badge/ Card/ ServiceCard/
      BarberCard/ Avatar/ HeroCard/ BottomTabBar.tsx
    screens/
      Splash/ Login/ BarbeiroCadastro/ BarbeiroCadastroEtapa2/
      Main/ Servicos/ Agendamento/ Checkout/ Agendamentos/ Perfil/
      BarbeiroAgenda/ BarbeiroServicos/ BarbeiroHorarios/
```

---

## Task 0: Scaffold bare RN CLI + dependências (remover Expo)

**Files:**
- Delete (Expo): `mobile/app/`, `mobile/app.json` (expo), `mobile/eas.json`, `mobile/metro.config.js`, `mobile/babel.config.js`, `mobile/global.css`, `mobile/nativewind-env.d.ts`, `mobile/tailwind.config.js`, `mobile/eslint.config.js`, `mobile/.expo/`, `mobile/components/`, `mobile/providers/`, `mobile/store/`, `mobile/hooks/`, `mobile/android/`
- Keep for porting (removidos ao fim da Task 5): `mobile/lib/`
- Keep untouched: `mobile/assets/` (imagens), `design/`, `supabase/`
- Create: projeto RN CLI (`android/`, `ios/`, `index.js`, `App.tsx`, configs)

**Interfaces:**
- Produces: projeto RN CLI 0.80.1 compilável (tela padrão), com `~`→`src`, jest, eslint, prettier configurados.

- [ ] **Step 1: Preservar lib/ para porte e limpar arquivos Expo**

O histórico git já preserva tudo. Mova `mobile/lib` para fora do caminho do scaffold e remova os arquivos Expo:

```bash
cd mobile
mkdir -p ../_port_ref && cp -r lib ../_port_ref/lib
rm -rf app .expo components providers store hooks android \
       app.json eas.json metro.config.js babel.config.js global.css \
       nativewind-env.d.ts tailwind.config.js eslint.config.js \
       package.json package-lock.json node_modules
```

- [ ] **Step 2: Gerar o projeto RN CLI num diretório temporário e mover o nativo/config para `mobile/`**

```bash
cd ..
npx @react-native-community/cli@0.80.1 init BarbeariaBairro --version 0.80.1 --skip-install --directory _rn_tmp
cp -r _rn_tmp/android mobile/android
cp -r _rn_tmp/ios mobile/ios
cp _rn_tmp/index.js _rn_tmp/metro.config.js _rn_tmp/jest.config.js \
   _rn_tmp/.watchmanconfig _rn_tmp/Gemfile mobile/
cp _rn_tmp/package.json mobile/package.json
rm -rf _rn_tmp
```

- [ ] **Step 3: `mobile/app.json`, `index.js`, `babel.config.js`, `tsconfig.json`, `.eslintrc.js`, `.prettierrc.js`**

`mobile/app.json`:
```json
{ "name": "BarbeariaBairro", "displayName": "Barbearia do Bairro" }
```

`mobile/index.js`:
```js
/**
 * @format
 */
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
```

`mobile/babel.config.js`:
```js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.tsx', '.android.tsx', '.tsx', '.ts', '.js', '.json'],
        alias: {'~': './src'},
      },
    ],
  ],
};
```

`mobile/tsconfig.json`:
```json
{
  "extends": "@react-native/typescript-config/tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {"~/*": ["src/*"]}
  },
  "include": ["src", "App.tsx", "index.js"]
}
```

`mobile/.eslintrc.js`:
```js
module.exports = {root: true, extends: '@react-native'};
```

`mobile/.prettierrc.js`:
```js
module.exports = {arrowParens: 'avoid', singleQuote: true, trailingComma: 'all'};
```

- [ ] **Step 4: `mobile/jest.config.js` (alias `~` + transpile RN/nav)**

```js
const transpilar = [
  '@react-native[^/]*',
  'react-native[^/]*',
  '@react-navigation[^/]*',
  'nanoid',
  'use-latest-callback',
];
module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [`node_modules/(?!(?:${transpilar.join('|')})/)`],
  moduleNameMapper: {'^~/(.*)$': '<rootDir>/src/$1'},
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/styles/**'],
};
```

- [ ] **Step 5: `mobile/package.json` — nome, scripts e dependências**

Ajuste `name` para `barbearia-bairro` e defina scripts + deps:
```json
{
  "name": "barbearia-bairro",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "start": "react-native start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "test:ci": "jest --ci --coverage --passWithNoTests",
    "format": "prettier --write \"src/**/*.{ts,tsx}\" \"*.{js,tsx}\""
  }
}
```

Instale runtime + dev deps:
```bash
cd mobile
npm install styled-components @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-svg react-native-linear-gradient @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill react-native-config @react-native-google-signin/google-signin date-fns
npm install -D @types/styled-components @types/styled-components-react-native @types/jest
```

- [ ] **Step 6: Build de fumaça no emulador**

Substitua `mobile/App.tsx` por um placeholder mínimo (`<SafeAreaProvider>` + `<Text>Barbearia</Text>`), e rode:
```bash
cd mobile && npx react-native run-android
```
Expected: app abre no emulador (Android Studio) mostrando "Barbearia". (Se `run-android` falhar por gradle, resolver antes de prosseguir.)

- [ ] **Step 7: Commit**

```bash
git add mobile -A && git add -u
git commit -m "chore(mobile): scaffold bare RN 0.80.1 e remover stack Expo

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 1: Tema tipado + ThemeProvider + App shell

**Files:**
- Create: `mobile/src/styles/theme.ts`, `mobile/src/styles/styled.d.ts`, `mobile/App.tsx`

**Interfaces:**
- Produces: `theme` (default export) com `{colors, radius, spacing, font, type}`; `DefaultTheme` tipado globalmente (styled-components); `App` montando `SafeAreaProvider > NavigationContainer > ThemeProvider > (Routes placeholder)`.

- [ ] **Step 1: `src/styles/theme.ts`**

```ts
export const theme = {
  colors: {
    bg: '#121214',
    surface: '#1E1E24',
    surfaceAlt: '#26262E',
    border: '#3F3F46',
    textPrimary: '#F4F4F5',
    textSecondary: '#A1A1AA',
    accent: '#D97706',
    accentHover: '#B45309',
    success: '#22C55E',
    error: '#EF4444',
  },
  radius: {sm: 8, md: 12, lg: 16, full: 999},
  spacing: {xs: 4, sm: 8, md: 16, lg: 24, xl: 32},
  font: {
    regular: 'PlusJakartaSans-Regular',
    medium: 'PlusJakartaSans-Medium',
    semibold: 'PlusJakartaSans-SemiBold',
    bold: 'PlusJakartaSans-Bold',
  },
} as const;

export type AppTheme = typeof theme;
export default theme;
```

- [ ] **Step 2: `src/styles/styled.d.ts` (tipa o DefaultTheme)**

```ts
import 'styled-components/native';
import {AppTheme} from './theme';

declare module 'styled-components/native' {
  export interface DefaultTheme extends AppTheme {}
}
```

- [ ] **Step 3: `App.tsx`**

```tsx
import 'react-native-gesture-handler';
import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {ThemeProvider} from 'styled-components/native';
import theme from '~/styles/theme';
import Routes from '~/routes';

const App = () => (
  <SafeAreaProvider>
    <ThemeProvider theme={theme}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.bg} />
      <NavigationContainer>
        <Routes />
      </NavigationContainer>
    </ThemeProvider>
  </SafeAreaProvider>
);

export default App;
```

- [ ] **Step 4: Placeholder de `~/routes`**

Crie `src/routes/index.tsx` temporário exportando um `View` com `Text` "Routes" (será substituído na Task 10) só para o `App` compilar.

- [ ] **Step 5: typecheck**

Run: `cd mobile && npx tsc --noEmit`
Expected: PASS (sem erros de tipo do theme).

- [ ] **Step 6: Commit**

```bash
git add mobile/src/styles mobile/App.tsx mobile/src/routes/index.tsx
git commit -m "feat(mobile): tema dark tipado + shell do App

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Fontes Plus Jakarta Sans (linkagem nativa)

**Files:**
- Create: `mobile/assets/fonts/PlusJakartaSans-{Regular,Medium,SemiBold,Bold}.ttf`, `mobile/react-native.config.js`

**Interfaces:**
- Produces: famílias `PlusJakartaSans-Regular/Medium/SemiBold/Bold` disponíveis nativamente (Android + iOS).

- [ ] **Step 1: Baixar os `.ttf`**

Baixe os quatro pesos do Plus Jakarta Sans (Google Fonts) para `mobile/assets/fonts/` com exatamente estes nomes: `PlusJakartaSans-Regular.ttf`, `-Medium.ttf`, `-SemiBold.ttf`, `-Bold.ttf`.

- [ ] **Step 2: `react-native.config.js`**

```js
module.exports = {
  project: {ios: {}, android: {}},
  assets: ['./assets/fonts'],
};
```

- [ ] **Step 3: Linkar fontes**

```bash
cd mobile && npx react-native-asset
```
Expected: fontes copiadas para `android/app/src/main/assets/fonts` e registradas no `Info.plist` (iOS).

- [ ] **Step 4: Verificar no emulador**

Rebuild (`npx react-native run-android`) com um `<Text style={{fontFamily:'PlusJakartaSans-Bold'}}>` temporário e confirme visualmente que a fonte renderiza (não cai no system default).

- [ ] **Step 5: Commit**

```bash
git add mobile/assets/fonts mobile/react-native.config.js mobile/android mobile/ios
git commit -m "feat(mobile): adicionar e linkar fontes Plus Jakarta Sans

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Env config + cliente Supabase

**Files:**
- Create: `mobile/src/config/env.ts`, `mobile/src/services/supabase.ts`, `mobile/.env`, `mobile/.env.example`
- Modify: `mobile/.gitignore` (garantir `.env` ignorado)

**Interfaces:**
- Consumes: `react-native-config`.
- Produces: `supabase` (SupabaseClient) exportado de `~/services/supabase`; `ENV.{SUPABASE_URL, SUPABASE_ANON_KEY, GOOGLE_WEB_CLIENT_ID}`.

- [ ] **Step 1: `.env.example` e `.env`**

`.env.example`:
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
GOOGLE_WEB_CLIENT_ID=
```
Copie para `.env` e preencha com os valores do projeto Supabase (reaproveite os que estavam no `.env` antigo do Expo — `EXPO_PUBLIC_SUPABASE_URL`/`ANON_KEY`) e o webClientId do Google Cloud.

- [ ] **Step 2: garantir `.gitignore`**

Confirme que `mobile/.gitignore` contém `.env` (o template RN CLI já ignora `.env*` exceto `.env.example`? se não, adicione a linha `.env`).

- [ ] **Step 3: `src/config/env.ts`**

```ts
import Config from 'react-native-config';

export const ENV = {
  SUPABASE_URL: Config.SUPABASE_URL ?? '',
  SUPABASE_ANON_KEY: Config.SUPABASE_ANON_KEY ?? '',
  GOOGLE_WEB_CLIENT_ID: Config.GOOGLE_WEB_CLIENT_ID ?? '',
};

if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
  throw new Error('Faltam SUPABASE_URL / SUPABASE_ANON_KEY no .env');
}
```

- [ ] **Step 4: `src/services/supabase.ts`** (portado de `lib/supabase.ts`, sem Expo)

```ts
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createClient} from '@supabase/supabase-js';
import {ENV} from '~/config/env';

export const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

- [ ] **Step 5: Rebuild (react-native-config exige build nativo)**

```bash
cd mobile && npx react-native run-android
```
Expected: app compila; `ENV` populado (logar `ENV.SUPABASE_URL` temporariamente e confirmar não-vazio).

- [ ] **Step 6: Commit**

```bash
git add mobile/src/config mobile/src/services/supabase.ts mobile/.env.example mobile/.gitignore
git commit -m "feat(mobile): env via react-native-config + cliente Supabase

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Tipos de domínio + `slots.ts` com testes unitários

**Files:**
- Create: `mobile/src/types/index.ts`, `mobile/src/services/slots.ts`, `mobile/__tests__/slots.test.ts`
- Reference: `_port_ref/lib/types.ts`, `_port_ref/lib/slots.ts`

**Interfaces:**
- Produces: tipos `UserRole, Profile, Tenant, Service, Barber, BarberWithProfile, WorkingHours, Appointment, AppointmentStatus, AppointmentWithDetails`; `computeFreeSlots(params): Date[]`.

- [ ] **Step 1: `src/types/index.ts`**

Porte o conteúdo de `_port_ref/lib/types.ts` na íntegra (mesmos campos): `UserRole = 'client'|'barber'|'admin'`; `Profile, Tenant, Service, Barber, BarberWithProfile, WorkingHours`; `AppointmentStatus = 'pending'|'confirmed'|'completed'|'cancelled'`; `Appointment` e `AppointmentWithDetails` (com joins `service`, `barber.profile`, `client`).

- [ ] **Step 2: Escrever o teste que falha — `__tests__/slots.test.ts`**

```ts
import {computeFreeSlots} from '~/services/slots';
import type {WorkingHours, Appointment} from '~/types';

const wh = (weekday: number, start: string, end: string): WorkingHours => ({
  id: `${weekday}-${start}`,
  barber_id: 'b1',
  weekday,
  start_time: start,
  end_time: end,
});

describe('computeFreeSlots', () => {
  // 2026-09-07 é uma segunda-feira (weekday 1)
  const date = new Date(2026, 8, 7);

  it('gera slots de 15min dentro da janela de trabalho', () => {
    const slots = computeFreeSlots({
      date,
      durationMinutes: 30,
      workingHours: [wh(1, '09:00', '10:00')],
      appointments: [],
    });
    // 09:00 e 09:30 cabem (30min); 09:45 não (termina 10:15 > 10:00)
    expect(slots.map(s => s.getHours() * 60 + s.getMinutes())).toEqual([540, 555, 570]);
  });

  it('remove slots que sobrepõem um agendamento existente', () => {
    const appt: Appointment = {
      id: 'a1',
      client_id: 'c1',
      barber_id: 'b1',
      service_id: 's1',
      starts_at: new Date(2026, 8, 7, 9, 0).toISOString(),
      ends_at: new Date(2026, 8, 7, 9, 30).toISOString(),
      status: 'confirmed',
    };
    const slots = computeFreeSlots({
      date,
      durationMinutes: 30,
      workingHours: [wh(1, '09:00', '10:00')],
      appointments: [appt],
    });
    expect(slots.map(s => s.getHours() * 60 + s.getMinutes())).not.toContain(540);
  });

  it('ignora agendamentos cancelados', () => {
    const appt: Appointment = {
      id: 'a1',
      client_id: 'c1',
      barber_id: 'b1',
      service_id: 's1',
      starts_at: new Date(2026, 8, 7, 9, 0).toISOString(),
      ends_at: new Date(2026, 8, 7, 9, 30).toISOString(),
      status: 'cancelled',
    };
    const slots = computeFreeSlots({
      date,
      durationMinutes: 30,
      workingHours: [wh(1, '09:00', '10:00')],
      appointments: [appt],
    });
    expect(slots.map(s => s.getHours() * 60 + s.getMinutes())).toContain(540);
  });

  it('retorna vazio quando não há horário de trabalho no weekday', () => {
    const slots = computeFreeSlots({
      date,
      durationMinutes: 30,
      workingHours: [wh(2, '09:00', '18:00')],
      appointments: [],
    });
    expect(slots).toEqual([]);
  });
});
```

- [ ] **Step 3: Rodar o teste e confirmar que falha**

Run: `cd mobile && npx jest slots -v`
Expected: FAIL ("Cannot find module '~/services/slots'").

- [ ] **Step 4: `src/services/slots.ts`**

Porte `_port_ref/lib/slots.ts` (a função `computeFreeSlots` é pura e não depende de Expo). Ajuste imports de tipo para `~/types`. Garanta a assinatura:
```ts
export function computeFreeSlots(params: {
  date: Date;
  durationMinutes: number;
  workingHours: WorkingHours[];
  appointments: Appointment[];
  stepMinutes?: number;
}): Date[]
```

- [ ] **Step 5: Rodar os testes e confirmar que passam**

Run: `cd mobile && npx jest slots -v`
Expected: PASS (4 testes).

- [ ] **Step 6: Commit**

```bash
git add mobile/src/types mobile/src/services/slots.ts mobile/__tests__/slots.test.ts
git commit -m "feat(mobile): tipos de domínio + computeFreeSlots com testes

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Services (auth + dados)

**Files:**
- Create: `mobile/src/services/authService.ts`, `tenantService.ts`, `servicoService.ts`, `horarioService.ts`, `agendamentoService.ts`, `barberService.ts`
- Reference: `_port_ref/lib/queries.ts`, `_port_ref/lib/auth.ts`
- Delete ao fim: `_port_ref/` e `mobile/lib` (se ainda existir)

**Interfaces:**
- Consumes: `~/services/supabase`, `~/types`, `~/config/env`.
- Produces:
  - `authService`: `signInWithGoogle(): Promise<Session|null>`, `sendPhoneOtp(phone)`, `verifyPhoneOtp(phone, token): Promise<Session>`, `signInWithPhonePassword(phone, password)`, `signInWithEmailPassword(email, password)`, `signUpWithEmailPassword(email, password, fullName)`, `signOut()`.
  - `tenantService`: `fetchTenants(): Tenant[]`, `fetchTenantBarbers(tenantId): BarberWithProfile[]`.
  - `barberService`: `fetchBarberByProfileId(profileId): Barber|null`, `fetchProfile(userId): Profile|null`.
  - `servicoService`: `fetchTenantServices(tenantId)`, `createService(params)`, `deleteService(id)`.
  - `horarioService`: `fetchBarberWorkingHours(barberId)`, `createWorkingHours(params)`, `deleteWorkingHours(id)`.
  - `agendamentoService`: `createAppointment(params): {appointment_id}`, `fetchClientAppointments(clientId)`, `fetchBarberAppointments(barberId, dayStart, dayEnd)`, `updateAppointmentStatus(id, status)`.

- [ ] **Step 1: Configurar Google Sign-In nativo**

No módulo `authService`, configure na primeira importação:
```ts
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {ENV} from '~/config/env';

GoogleSignin.configure({webClientId: ENV.GOOGLE_WEB_CLIENT_ID});
```

- [ ] **Step 2: `authService.ts`** (porta `lib/auth.ts`; troca o fluxo Google)

```ts
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import type {Session} from '@supabase/supabase-js';
import {supabase} from '~/services/supabase';
import {ENV} from '~/config/env';

GoogleSignin.configure({webClientId: ENV.GOOGLE_WEB_CLIENT_ID});

export async function signInWithGoogle(): Promise<Session | null> {
  await GoogleSignin.hasPlayServices();
  const userInfo = await GoogleSignin.signIn();
  const idToken = userInfo.data?.idToken ?? userInfo.idToken;
  if (!idToken) return null;
  const {data, error} = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });
  if (error) throw error;
  return data.session;
}

export async function sendPhoneOtp(phone: string) {
  const {error} = await supabase.auth.signInWithOtp({phone});
  if (error) throw error;
}

export async function verifyPhoneOtp(phone: string, token: string) {
  const {data, error} = await supabase.auth.verifyOtp({phone, token, type: 'sms'});
  if (error) throw error;
  return data.session;
}

export async function signInWithPhonePassword(phone: string, password: string) {
  const {data, error} = await supabase.auth.signInWithPassword({phone, password});
  if (error) throw error;
  return data.session;
}

export async function signInWithEmailPassword(email: string, password: string) {
  const {data, error} = await supabase.auth.signInWithPassword({email, password});
  if (error) throw error;
  return data.session;
}

export async function signUpWithEmailPassword(email: string, password: string, fullName: string) {
  const {data, error} = await supabase.auth.signUp({
    email,
    password,
    options: {data: {full_name: fullName}},
  });
  if (error) throw error;
  return data.session;
}

export async function signOut() {
  try {
    await GoogleSignin.signOut();
  } catch {}
  await supabase.auth.signOut();
}
```

- [ ] **Step 3: `barberService.ts` + `tenantService.ts`** (porta as queries correspondentes de `lib/queries.ts`: `fetchProfile`, `fetchBarberByProfileId`, `fetchTenants`, `fetchTenantBarbers`).

- [ ] **Step 4: `servicoService.ts` + `horarioService.ts`** (porta `fetchTenantServices`, `createService`, `deleteService`, `fetchBarberWorkingHours`, `createWorkingHours`, `deleteWorkingHours`).

- [ ] **Step 5: `agendamentoService.ts`** (porta `createAppointment` via `supabase.functions.invoke('create_appointment', {body})`, `fetchClientAppointments`, `fetchBarberAppointments`, `updateAppointmentStatus`).

- [ ] **Step 6: typecheck + remover referências de porte**

```bash
cd mobile && npx tsc --noEmit
```
Expected: PASS. Em seguida remova `../_port_ref` e qualquer `mobile/lib` remanescente.

- [ ] **Step 7: Commit**

```bash
git add mobile/src/services && git add -u
git commit -m "feat(mobile): services de auth e dados (Supabase) portados

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Componente `Icon` (react-native-svg)

**Files:**
- Create: `mobile/src/components/Icon.tsx`, `mobile/__tests__/Icon.test.tsx`

**Interfaces:**
- Produces: `<Icon name={IconName} size={number} color={string} strokeWidth={number} />` com `IconName = 'scissors'|'home'|'calendar'|'bell'|'star'|'eye'|'chevronRight'|'plus'|'trash'|'clock'|'user'|'scissorsBrand'`.

- [ ] **Step 1: Teste que falha**

```tsx
import React from 'react';
import {render} from '@testing-library/react-native';
import {ThemeProvider} from 'styled-components/native';
import theme from '~/styles/theme';
import Icon from '~/components/Icon';

it('renderiza um ícone por nome sem quebrar', () => {
  const {toJSON} = render(
    <ThemeProvider theme={theme}>
      <Icon name="scissors" size={24} color="#D97706" />
    </ThemeProvider>,
  );
  expect(toJSON()).toBeTruthy();
});
```
(Instale `-D @testing-library/react-native react-test-renderer` se ainda não houver.)

Run: `cd mobile && npx jest Icon -v` → Expected: FAIL.

- [ ] **Step 2: `src/components/Icon.tsx`**

Implemente um `Svg` com `viewBox="0 0 24 24"` cujos `path`/`circle` vêm **exatamente** dos SVGs dos mockups. Copie os `d`/atributos de `design/*.dc.html`:
- `scissors`/`scissorsBrand`: `<Circle cx=6 cy=6 r=3/><Circle cx=6 cy=18 r=3/><Path d="M20 4L8.5 15.5M8.7 9.3L20 20"/>` (de `Login.dc.html`/`Foundations`)
- `home`: `M3 11l9-8 9 8` + `M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10` (Main tabbar)
- `bell`: `M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6` + `M10 21a2 2 0 0 0 4 0` (Main header)
- `calendar`: `rect 3 5 18 16 rx2` + `M16 3v4M8 3v4M3 10h18`
- `star`: `M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z` (fill)
- `eye`: `M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z` + `circle 12 12 r3`
- `chevronRight`: `M9 6l6 6-6 6`
- `plus`/`trash`/`clock`/`user`: paths equivalentes (Feather-style) reproduzindo os mockups de serviços/horários/perfil.

Ícones `stroke` usam `fill="none" stroke={color} strokeWidth={strokeWidth ?? 1.8} strokeLinecap="round" strokeLinejoin="round"`; `star` usa `fill={color}`.

- [ ] **Step 3: Rodar teste** → Run: `cd mobile && npx jest Icon -v` → Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add mobile/src/components/Icon.tsx mobile/__tests__/Icon.test.tsx mobile/package.json
git commit -m "feat(mobile): componente Icon (svg) com paths dos mockups

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: Componentes base — Button, TextField, Badge (com smoke tests)

**Files:**
- Create: `mobile/src/components/Button/{index.tsx,styles.ts}`, `TextField/{index.tsx,styles.ts}`, `Badge/{index.tsx,styles.ts}`
- Test: `mobile/__tests__/components.test.tsx`

**Interfaces:**
- Produces:
  - `Button`: props `{variant?: 'primary'|'secondary'|'ghost'; title: string; onPress?; disabled?; loading?; leftIcon?: ReactNode}`.
  - `TextField`: props `{label?: string; value: string; onChangeText; placeholder?; secureTextEntry?; keyboardType?; rightIcon?: ReactNode; autoCapitalize?}`.
  - `Badge`: props `{status: AppointmentStatus}` → texto/cor: pending→"Pendente"(textSecondary), confirmed→"Confirmado"(accent), completed→"Concluído"(success), cancelled→"Cancelado"(error); fundo `rgba` tintado 15%.

- [ ] **Step 1: Teste que falha — `__tests__/components.test.tsx`**

```tsx
import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {ThemeProvider} from 'styled-components/native';
import theme from '~/styles/theme';
import Button from '~/components/Button';
import Badge from '~/components/Badge';

const wrap = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

it('Button dispara onPress quando habilitado', () => {
  const onPress = jest.fn();
  const {getByText} = wrap(<Button title="Acessar Conta" onPress={onPress} />);
  fireEvent.press(getByText('Acessar Conta'));
  expect(onPress).toHaveBeenCalled();
});

it('Button não dispara onPress quando disabled', () => {
  const onPress = jest.fn();
  const {getByText} = wrap(<Button title="X" onPress={onPress} disabled />);
  fireEvent.press(getByText('X'));
  expect(onPress).not.toHaveBeenCalled();
});

it('Badge mostra rótulo do status', () => {
  const {getByText} = wrap(<Badge status="confirmed" />);
  expect(getByText('Confirmado')).toBeTruthy();
});
```

Run: `cd mobile && npx jest components -v` → Expected: FAIL.

- [ ] **Step 2: Implementar `Button` (styles.ts + index.tsx)**

`Button/styles.ts` — `TouchableOpacity` estilizado por `variant`: primary `background: accent`, secondary `border 1.5px accent, background transparent`, ghost transparente; `height: 52`, `borderRadius: theme.radius.md`, center; `opacity: disabled ? 0.4 : 1`. Texto: primary `color: bg (#121214)` weight 600; secondary/ghost `color: accent`/`textPrimary`. `index.tsx` compõe `leftIcon` + `ActivityIndicator` (quando `loading`).

- [ ] **Step 3: Implementar `TextField`** — label caption (`textSecondary`, 12/600), container `background: surface, border 1px border, height 52, radius md, paddingHorizontal 14`, `TextInput` `color: textPrimary`, `placeholderTextColor: textSecondary`, slot `rightIcon` (44x44).

- [ ] **Step 4: Implementar `Badge`** — pílula `height 26, paddingHorizontal 12, borderRadius full`, fundo tintado 15% da cor do status, texto 11/600 na cor do status. Mapa status→{label,color} conforme Interfaces.

- [ ] **Step 5: Rodar testes** → Run: `cd mobile && npx jest components -v` → Expected: PASS (3).

- [ ] **Step 6: Commit**

```bash
git add mobile/src/components/Button mobile/src/components/TextField mobile/src/components/Badge mobile/__tests__/components.test.tsx
git commit -m "feat(mobile): componentes base Button/TextField/Badge

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 8: Componentes compostos — Card, ServiceCard, BarberCard/Avatar, HeroCard, BottomTabBar

**Files:**
- Create: `mobile/src/components/Card/{index.tsx,styles.ts}`, `ServiceCard/{index.tsx,styles.ts}`, `Avatar/{index.tsx,styles.ts}`, `BarberCard/{index.tsx,styles.ts}`, `HeroCard/{index.tsx,styles.ts}`, `BottomTabBar.tsx`

**Interfaces:**
- Consumes: `~/components/Icon`, `~/components/Button`, `react-native-linear-gradient`.
- Produces:
  - `Card`: container `surface`+`border`, radius lg, padding 16 (wrapper genérico).
  - `Avatar`: props `{initials: string; size?: number; selected?: boolean}` — círculo gradiente `#3F3F46→#26262E`, texto bold `textPrimary`, borda `accent` se `selected`.
  - `ServiceCard`: props `{icon: IconName; name: string; durationMinutes: number; priceCents: number; onPress?}` → subtítulo `${min}min · R$ ${price}` (helper `formatBRL(cents)`).
  - `BarberCard`: props `{initials: string; name: string; rating?: number; selected?; onPress?}` → Avatar + nome + estrela/nota.
  - `HeroCard`: props `{title: string; subtitle: string; ctaLabel: string; onPress}` → LinearGradient `accent→accentHover`, textos `bg`, botão escuro.
  - `BottomTabBar`: recebe as props padrão de `BottomTabBarProps` do react-navigation; renderiza itens com `Icon` (ativo `accent`, inativo `textSecondary`), fundo `surface`, borda topo.

- [ ] **Step 1: Helper `formatBRL`** em `src/utils/format.ts`: `(cents:number)=> 'R$ ' + (cents/100).toLocaleString('pt-BR',{minimumFractionDigits:0})` (ex.: 4500 → "R$ 45").

- [ ] **Step 2: Implementar `Avatar`, `Card`, `ServiceCard`, `BarberCard`, `HeroCard`** replicando exatamente os blocos de `design/Main.dc.html` e `Foundations.dc.html` (dimensões, gaps `28`, radius `16`, tile de ícone `40x40 rgba(217,119,6,.15)`), usando tokens do theme.

- [ ] **Step 3: Implementar `BottomTabBar.tsx`** — barra custom (`height 84`, `paddingBottom 16`, fundo `surface`, `borderTopColor border`), mapeando `state.routes` para ícones (`home`, `calendar`, `user` etc.) com rótulo 11/600.

- [ ] **Step 4: Smoke test** — em `__tests__/components.test.tsx` adicione um caso que renderiza `ServiceCard` e checa que exibe "Corte Clássico" e "R$ 45". Run: `cd mobile && npx jest components -v` → Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add mobile/src/components mobile/src/utils mobile/__tests__/components.test.tsx
git commit -m "feat(mobile): cards, avatar, hero e tab bar do design system

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 9: AuthContext

**Files:**
- Create: `mobile/src/contexts/AuthContext.tsx`

**Interfaces:**
- Consumes: `~/services/supabase`, `~/services/barberService` (`fetchProfile`), `~/types`.
- Produces: `AuthProvider`; hook `useAuth()` → `{session, profile, role, signed, loading, refreshProfile, signOut}`. `signOut` delega a `authService.signOut`.

- [ ] **Step 1: Implementar** (espelha o `AuthContext.js` do padrão do autor, adaptado ao Supabase):

```tsx
import React, {createContext, useContext, useEffect, useState, useCallback} from 'react';
import type {Session} from '@supabase/supabase-js';
import {supabase} from '~/services/supabase';
import {fetchProfile} from '~/services/barberService';
import {signOut as authSignOut} from '~/services/authService';
import type {Profile, UserRole} from '~/types';

type AuthValue = {
  session: Session | null;
  profile: Profile | null;
  role: UserRole | undefined;
  signed: boolean;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue>({} as AuthValue);

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId?: string) => {
    if (!userId) return setProfile(null);
    setProfile(await fetchProfile(userId));
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({data}) => {
      setSession(data.session);
      await loadProfile(data.session?.user.id);
      setLoading(false);
    });
    const {data: sub} = supabase.auth.onAuthStateChange(async (_e, s) => {
      setSession(s);
      await loadProfile(s?.user.id);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const value: AuthValue = {
    session,
    profile,
    role: profile?.role,
    signed: !!session,
    loading,
    refreshProfile: () => loadProfile(session?.user.id),
    signOut: async () => {
      await authSignOut();
      setSession(null);
      setProfile(null);
    },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
```

- [ ] **Step 2: Montar no `App.tsx`** — envolver `<Routes/>` com `<AuthProvider>` (dentro de `NavigationContainer`). Run: `cd mobile && npx tsc --noEmit` → Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add mobile/src/contexts/AuthContext.tsx mobile/App.tsx
git commit -m "feat(mobile): AuthContext (session + profile + role)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 10: Navegação (index + auth + client + barber routes)

**Files:**
- Create: `mobile/src/routes/index.tsx` (substitui placeholder), `auth.routes.tsx`, `client.routes.tsx`, `barber.routes.tsx`
- Create (stubs de tela): `src/screens/*/index.tsx` mínimos para cada rota compilar

**Interfaces:**
- Consumes: `~/contexts/AuthContext` (`useAuth`), `~/components/BottomTabBar`, todas as telas.
- Produces: `Routes` (default) que decide `loading → Splash`, `signed ? AppRoutes : AuthRoutes`; `AppRoutes` ramifica por `role === 'barber' ? BarberRoutes : ClientRoutes`. Nomes de rota: Auth `Login`, `BarbeiroCadastro`, `BarbeiroCadastroEtapa2`; Client tabs `Main`, `Agendamentos`, `Perfil` + stack `Servicos`, `Agendamento`, `Checkout`; Barber tabs `BarbeiroAgenda`, `BarbeiroServicos`, `BarbeiroHorarios`, `Perfil`.

- [ ] **Step 1: Stubs de todas as telas** — crie `src/screens/<Nome>/index.tsx` exportando um componente com `<View style={{flex:1,background:bg}}><Text>Nome</Text></View>` para: Splash, Login, BarbeiroCadastro, BarbeiroCadastroEtapa2, Main, Servicos, Agendamento, Checkout, Agendamentos, Perfil, BarbeiroAgenda, BarbeiroServicos, BarbeiroHorarios.

- [ ] **Step 2: `auth.routes.tsx`** — `createNativeStackNavigator` com `headerShown:false`, telas Login/BarbeiroCadastro/BarbeiroCadastroEtapa2.

- [ ] **Step 3: `client.routes.tsx`** — `createBottomTabNavigator` (`tabBar={props => <BottomTabBar {...props}/>}`, `headerShown:false`) com Main/Agendamentos/Perfil; e um `createNativeStackNavigator` aninhado (`HomeStack`) para Main→Servicos→Agendamento→Checkout. A aba "Início" usa o `HomeStack`.

- [ ] **Step 4: `barber.routes.tsx`** — `createBottomTabNavigator` com BarbeiroAgenda/BarbeiroServicos/BarbeiroHorarios/Perfil.

- [ ] **Step 5: `routes/index.tsx`**

```tsx
import React from 'react';
import {useAuth} from '~/contexts/AuthContext';
import Splash from '~/screens/Splash';
import AuthRoutes from './auth.routes';
import ClientRoutes from './client.routes';
import BarberRoutes from './barber.routes';

export default function Routes() {
  const {loading, signed, role} = useAuth();
  if (loading) return <Splash />;
  if (!signed) return <AuthRoutes />;
  return role === 'barber' || role === 'admin' ? <BarberRoutes /> : <ClientRoutes />;
}
```

- [ ] **Step 6: Rodar no emulador** — `npx react-native run-android`. Expected: app abre no Login (sem sessão); navegação entre stubs funciona. typecheck PASS.

- [ ] **Step 7: Commit**

```bash
git add mobile/src/routes mobile/src/screens
git commit -m "feat(mobile): navegação por role (auth/client/barber)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 11: Telas Splash + Login

**Files:**
- Create/replace: `src/screens/Splash/{index.tsx,styles.ts}`, `src/screens/Login/{index.tsx,styles.ts}`
- Reference: `design/Splash.dc.html`, `design/Login.dc.html`

**Interfaces:**
- Consumes: `useAuth`, `authService` (`signInWithGoogle`, `signInWithEmailPassword`/`signInWithPhonePassword`, `signUpWithEmailPassword`), componentes `Button/TextField/Icon`, `useNavigation`.

- [ ] **Step 1: `Splash`** — porta `design/Splash.dc.html`: fundo `bg`, logo tesoura (`Icon scissors`) centralizado + `ActivityIndicator accent`.

- [ ] **Step 2: `Login`** — porta `design/Login.dc.html` 1:1: header (tile 64 com tesoura, "Bem-vindo de volta"/"Entre para continuar agendando"); `Button` branco "Continuar com Google" (ícone Google inline via `Icon`/svg) → `signInWithGoogle`; divisor "ou entrar com telefone"; `TextField` Nome, Telefone (prefixo +55), Senha (olho), Confirmar senha; link "Esqueci minha senha"; `Button` primary "Acessar Conta"; link inferior "Sou barbeiro · Acessar como Profissional" → `navigation.navigate('BarbeiroCadastro')`.

- [ ] **Step 3: Lógica do Login** — estado local dos campos; "Acessar Conta" faz login (se só telefone+senha → `signInWithPhonePassword`; se e-mail → email) e, quando "Confirmar senha" preenchido, trata como cadastro (`signUpWithEmailPassword`). Erros via `Alert.alert('Erro', mensagem)`. Ao autenticar, o `onAuthStateChange` redireciona sozinho.

- [ ] **Step 4: Validar visual no emulador** contra `Login.dc.html` (espaçamentos, cores, raios). Ajustar até bater.

- [ ] **Step 5: typecheck/lint** — `npx tsc --noEmit && npx eslint src/screens/Login src/screens/Splash`. Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add mobile/src/screens/Splash mobile/src/screens/Login
git commit -m "feat(mobile): telas Splash e Login fiéis ao design

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 12: Cadastro de barbeiro (etapa 1 + etapa 2)

**Files:**
- Create/replace: `src/screens/BarbeiroCadastro/{index.tsx,styles.ts}`, `src/screens/BarbeiroCadastroEtapa2/{index.tsx,styles.ts}`
- Reference: `design/BarbeiroCadastro.dc.html`, `design/BarbeiroCadastroEtapa2.dc.html`

**Interfaces:**
- Consumes: `authService` (`sendPhoneOtp`, `verifyPhoneOtp`), `supabase` (insert `tenants`/`profiles`/`barbers`), `useNavigation`, `useAuth`.

- [ ] **Step 1: `BarbeiroCadastro` (etapa 1)** — porta o mockup: campo telefone (+55) → `sendPhoneOtp`; campo de código OTP → `verifyPhoneOtp`. Ao verificar com sucesso, `navigation.navigate('BarbeiroCadastroEtapa2')`.

- [ ] **Step 2: `BarbeiroCadastroEtapa2`** — porta o mockup: nome da barbearia, nome do profissional, bio. Ao confirmar: cria `tenant` (nome/slug), faz upsert do `profile` (`role:'admin'`, `tenant_id`, `full_name`, `phone`), cria `barber` (`tenant_id`, `profile_id`, `bio`). Usa as policies existentes (tenants insertable no signup; users upsert own profile; barbers writable by same-tenant staff).

- [ ] **Step 3: Validar visual** contra os dois `.dc.html`.

- [ ] **Step 4: typecheck/lint** → Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add mobile/src/screens/BarbeiroCadastro mobile/src/screens/BarbeiroCadastroEtapa2
git commit -m "feat(mobile): cadastro de barbeiro em 2 etapas (telefone+OTP)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 13: Tela Main (Início do cliente)

**Files:**
- Create/replace: `src/screens/Main/{index.tsx,styles.ts}`
- Reference: `design/Main.dc.html`

**Interfaces:**
- Consumes: `useAuth` (nome), `tenantService.fetchTenants`, `servicoService.fetchTenantServices`, `tenantService.fetchTenantBarbers`, componentes `HeroCard/ServiceCard/BarberCard/Avatar/Icon`, `useNavigation`.

- [ ] **Step 1: Estado/dados** — no `useEffect`, `fetchTenants()` → seleciona o primeiro tenant do piloto → `fetchTenantServices(tenantId)` e `fetchTenantBarbers(tenantId)`. Estados `loading`/`error`.

- [ ] **Step 2: UI 1:1 do `Main.dc.html`** — header "Olá, {primeiro nome}" + `Avatar` iniciais + `Icon bell`; `HeroCard` "Agendamento Rápido" (CTA "Agendar Agora" → `navigate('Servicos')`); seção "Serviços em destaque" (carrossel horizontal de `ServiceCard`, "Ver todos" → Servicos); seção "Barbeiros favoritos" (carrossel de `BarberCard`).

- [ ] **Step 3: Validar visual** contra `Main.dc.html` (hero gradiente, cards 152px, avatares 64 com borda âmbar no favorito).

- [ ] **Step 4: typecheck/lint** → PASS.

- [ ] **Step 5: Commit**

```bash
git add mobile/src/screens/Main
git commit -m "feat(mobile): tela Início do cliente (Main) com dados reais

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 14: Fluxo de agendamento — Servicos → Agendamento → Checkout

**Files:**
- Create/replace: `src/screens/Servicos/{index.tsx,styles.ts}`, `src/screens/Agendamento/{index.tsx,styles.ts}`, `src/screens/Checkout/{index.tsx,styles.ts}`
- Reference: `design/Servicos.dc.html`, `design/Agendamento.dc.html`, `design/Checkout.dc.html`

**Interfaces:**
- Consumes: `servicoService.fetchTenantServices`, `tenantService.fetchTenantBarbers`, `horarioService.fetchBarberWorkingHours`, `agendamentoService.fetchBarberAppointments` (para preview de conflito), `slots.computeFreeSlots`, `agendamentoService.createAppointment`. Params de navegação: `Servicos`→`Agendamento({serviceId})`→`Checkout({serviceId, barberId, startsAtISO})`.

- [ ] **Step 1: `Servicos`** — lista `ServiceCard` (vertical) do tenant; ao tocar → `navigate('Agendamento', {serviceId})`.

- [ ] **Step 2: `Agendamento`** — seletor de barbeiro (`BarberCard` selecionável), seletor de data (próximos ~14 dias), e grade de horários vinda de `computeFreeSlots({date, durationMinutes: service.duration_minutes + buffer, workingHours, appointments})`. Ao escolher horário → `navigate('Checkout', {serviceId, barberId, startsAtISO})`.

- [ ] **Step 3: `Checkout`** — resumo (serviço, barbeiro, data/hora, `formatBRL(price_cents)`); botão "Confirmar" → `createAppointment({barber_id, service_id, starts_at})`. Trata erro de conflito (Edge Function retorna erro) com `Alert`. Em sucesso → `navigate('Agendamentos')`.

- [ ] **Step 4: Validar visual** dos três contra seus `.dc.html`.

- [ ] **Step 5: typecheck/lint** → PASS.

- [ ] **Step 6: Commit**

```bash
git add mobile/src/screens/Servicos mobile/src/screens/Agendamento mobile/src/screens/Checkout
git commit -m "feat(mobile): fluxo de agendamento (serviço→horário→checkout)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 15: Agendamentos (meus) + Perfil

**Files:**
- Create/replace: `src/screens/Agendamentos/{index.tsx,styles.ts}`, `src/screens/Perfil/{index.tsx,styles.ts}`
- Reference: `design/Agendamentos.dc.html`, `design/Perfil.dc.html`

**Interfaces:**
- Consumes: `agendamentoService.fetchClientAppointments`, `agendamentoService.updateAppointmentStatus` (cancelar), `useAuth` (profile, `signOut`), `Badge`, `date-fns` (format pt-BR).

- [ ] **Step 1: `Agendamentos`** — `fetchClientAppointments(session.user.id)`; lista cards com serviço, barbeiro, data/hora formatada e `<Badge status>`; ação "Cancelar" (status→'cancelled' via `updateAppointmentStatus`) nos futuros/pendentes.

- [ ] **Step 2: `Perfil`** — porta `Perfil.dc.html`: avatar+nome+telefone, itens de conta, botão "Sair" → `signOut()`.

- [ ] **Step 3: Validar visual** contra os `.dc.html`.

- [ ] **Step 4: typecheck/lint** → PASS.

- [ ] **Step 5: Commit**

```bash
git add mobile/src/screens/Agendamentos mobile/src/screens/Perfil
git commit -m "feat(mobile): Meus Agendamentos + Perfil

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 16: Área do barbeiro — Agenda, Serviços, Horários

**Files:**
- Create/replace: `src/screens/BarbeiroAgenda/{index.tsx,styles.ts}`, `src/screens/BarbeiroServicos/{index.tsx,styles.ts}`, `src/screens/BarbeiroHorarios/{index.tsx,styles.ts}`
- Reference: `design/BarbeiroAgenda.dc.html`, `design/BarbeiroServicos.dc.html`, `design/BarbeiroHorarios.dc.html`

**Interfaces:**
- Consumes: `barberService.fetchBarberByProfileId`, `agendamentoService.fetchBarberAppointments`/`updateAppointmentStatus`, `servicoService.{fetchTenantServices,createService,deleteService}`, `horarioService.{fetchBarberWorkingHours,createWorkingHours,deleteWorkingHours}`, `useAuth`.

- [ ] **Step 1: `BarbeiroAgenda`** — resolve `barber` do profile; `fetchBarberAppointments(barberId, inícioDia, fimDia)` para o dia selecionado; lista com cliente/serviço/hora + `Badge`; ações confirmar/concluir/cancelar (`updateAppointmentStatus`).

- [ ] **Step 2: `BarbeiroServicos`** — lista `ServiceCard` do tenant com "excluir" (`deleteService`); formulário/modal "novo serviço" (nome, duração, preço em reais → `price_cents`) → `createService`.

- [ ] **Step 3: `BarbeiroHorarios`** — lista de `working_hours` por dia da semana; adicionar (weekday, start_time, end_time → `createWorkingHours`) e remover (`deleteWorkingHours`).

- [ ] **Step 4: Validar visual** contra os três `.dc.html`.

- [ ] **Step 5: typecheck/lint** → PASS.

- [ ] **Step 6: Commit**

```bash
git add mobile/src/screens/BarbeiroAgenda mobile/src/screens/BarbeiroServicos mobile/src/screens/BarbeiroHorarios
git commit -m "feat(mobile): área do barbeiro (agenda, serviços, horários)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 17: Verificação final + README + CI

**Files:**
- Modify: `README.md` (seção mobile: bare RN em vez de Expo), `mobile/README` opcional
- Verify: `.github/workflows/*` (ajustar se referenciam Expo/EAS)

**Interfaces:**
- Produces: build verde, verificação completa.

- [ ] **Step 1: Suite completa**

```bash
cd mobile
npx tsc --noEmit
npx eslint .
npx jest --ci --coverage --passWithNoTests
```
Expected: os três PASS.

- [ ] **Step 2: Smoke manual no emulador** — percorrer: Login (telefone) → Main → Servicos → Agendamento → Checkout → Agendamentos; e (como barbeiro) Cadastro → Agenda/Serviços/Horários. Comparar cada tela ao `.dc.html`.

- [ ] **Step 3: Atualizar `README.md`** — trocar instruções Expo (`npm start`, `EXPO_PUBLIC_*`) por bare RN (`npm run android`, `.env` com `SUPABASE_URL`/`ANON_KEY`/`GOOGLE_WEB_CLIENT_ID`, `react-native-asset`). Remover menção a "Expo Router + NativeWind + Zustand + TanStack Query".

- [ ] **Step 4: Revisar CI** — se `.github/workflows` roda `eas update`/typecheck com paths Expo, ajustar para o novo `mobile/` (scripts `lint`/`typecheck`/`test`). Se não se aplicar, deixar registrado.

- [ ] **Step 5: Commit + finalizar branch**

```bash
git add README.md mobile/README* .github -A
git commit -m "docs(mobile): atualizar README/CI para bare React Native

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```
Depois, seguir a skill `superpowers:finishing-a-development-branch` para decidir merge/PR.

---

## Self-Review (preenchido)

**Spec coverage:** Stack bare RN (T0), TS+styled+theme (T1), fontes (T2), env+Supabase (T3), tipos+slots (T4), services auth/dados (T5), ícones (T6), componentes base/compostos (T7–T8), AuthContext (T9), navegação por role (T10), todas as telas do §6 (T11–T16: Splash/Login, cadastro barbeiro, Main, Servicos/Agendamento/Checkout, Agendamentos/Perfil, Barbeiro×3), testes (T4/T6/T7/T8 + verificação T17), critérios de aceitação (T17). Sem lacunas.

**Placeholder scan:** Passos com código trazem código real; telas apontam para o `.dc.html` de origem (artefato concreto de fidelidade) + wiring de dados explícito, sem "TODO/TBD". OK.

**Type consistency:** `computeFreeSlots` (assinatura idêntica em T4/T14); `fetchProfile` exposto por `barberService` e consumido por `AuthContext` (T5/T9); `useAuth` retorna `{session,profile,role,signed,loading,refreshProfile,signOut}` usado em T10–T16; nomes de rota consistentes entre T10 e as telas. OK.
