# Barbearia do Bairro — mobile

Stack real deste projeto: bare React Native CLI 0.80.1 + TypeScript, styled-components/native para estilos, @react-navigation para navegação, e Supabase (via services diretos, sem react-query/zustand). Não é Expo — não existe `app/` (Expo Router), `lib/`, nem variáveis `EXPO_PUBLIC_*`.

## Convenções

- Telas em `src/screens/<Nome>/{index.tsx,styles.ts}`.
- Import absoluto com o alias `~` (ex.: `~/components/Button`).
- Tokens de tema (cores, espaçamento, tipografia) vêm só de `src/styles/theme.ts` — não hardcode valores.
- Navegação em `src/routes/` (auth, client, barber), guiada pelo `role` do `AuthContext`.
- Dados/auth via `src/services/*Service.ts` na maioria dos casos; chamadas diretas ao Supabase dentro de uma tela são aceitáveis quando não existe função de serviço dedicada para aquela operação (ex.: `BarbeiroCadastroEtapa2`, que insere tenant/profile/barber diretamente no fluxo de cadastro).
- Variáveis de ambiente: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `GOOGLE_WEB_CLIENT_ID` (ver `.env.example` e `src/config/env.ts`).

## Verificação

```bash
cd mobile
npx tsc --noEmit
npx eslint .
npx jest --ci --coverage --passWithNoTests
```
