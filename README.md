# Navalha

Plataforma SaaS multi-tenant de agendamento para barbearias (Cliente + Barbeiro/Admin).

## Estrutura

- `design/` — mockups visuais originais (Claude Design canvas, `.dc.html`)
- `mobile/` — app React Native (Expo Router + NativeWind + Zustand + TanStack Query)
- `supabase/migrations/` — schema Postgres (multi-tenant, RLS, anti-double-booking)
- `supabase/functions/` — Edge Functions (`create_appointment`)

## Setup

1. Crie um projeto em [supabase.com](https://supabase.com) (free tier).
2. No SQL editor do projeto, rode `supabase/migrations/0001_init.sql`.
3. Configure Auth no painel do Supabase:
   - Habilite o provider **Google** (OAuth) e informe as credenciais do Google Cloud.
   - Habilite **Phone** auth e configure um provedor de SMS (Twilio, por exemplo).
4. Deploy da Edge Function (requer [Supabase CLI](https://supabase.com/docs/guides/cli)):
   ```
   supabase functions deploy create_appointment --project-ref <seu-project-ref>
   ```
5. No app mobile:
   ```
   cd mobile
   cp .env.example .env   # preencha EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY
   npm install
   npm start
   ```

## Deploy automatizado

Todo push (merge) na branch `master` que tocar `supabase/**` ou `mobile/**` dispara os workflows em `.github/workflows/`:

- **`supabase-deploy.yml`** — roda `supabase db push` (migrations) e `supabase functions deploy`.
- **`eas-update.yml`** — publica um OTA update via `eas update --branch production` (Expo/EAS Update).

Configure em *Settings → Secrets and variables → Actions* do repositório (ambiente `production`):

| Secret | Onde obter |
| --- | --- |
| `SUPABASE_ACCESS_TOKEN` | [app.supabase.com/account/tokens](https://app.supabase.com/account/tokens) |
| `SUPABASE_PROJECT_ID` | Ref do projeto (Settings → General) |
| `SUPABASE_DB_PASSWORD` | Senha do banco (definida na criação do projeto) |
| `EXPO_TOKEN` | `eas token:create` (ou expo.dev → Access Tokens) |
| `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Mesmos valores do `mobile/.env` |

Antes do primeiro deploy do mobile, rode uma vez localmente (necessário para vincular o projeto ao EAS e gerar `extra.eas.projectId` em `app.json`):
```
cd mobile
npx eas init
npx eas update:configure
```

## Fluxos implementados (MVP)

- **Cliente**: login (Google), listar barbearias → serviços → escolher barbeiro/data/hora → confirmar agendamento → ver "Meus Agendamentos" e Perfil.
- **Barbeiro/Admin**: cadastro de barbearia em 2 etapas (telefone + OTP), Agenda do dia, CRUD de Serviços & Preços, CRUD de Horários de trabalho.

Fora de escopo neste MVP: cobrança de assinatura via Stripe/Pagar.me (piloto cobra manual/PIX), pagamento do cliente dentro do checkout, painel web de admin.

Ver `mobile/app/` para as rotas (`(auth)`, `(client)`, `(barber)`) e `mobile/lib/` para os helpers de dados/auth.
