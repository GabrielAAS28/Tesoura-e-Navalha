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

## Fluxos implementados (MVP)

- **Cliente**: login (Google), listar barbearias → serviços → escolher barbeiro/data/hora → confirmar agendamento → ver "Meus Agendamentos" e Perfil.
- **Barbeiro/Admin**: cadastro de barbearia em 2 etapas (telefone + OTP), Agenda do dia, CRUD de Serviços & Preços, CRUD de Horários de trabalho.

Fora de escopo neste MVP: cobrança de assinatura via Stripe/Pagar.me (piloto cobra manual/PIX), pagamento do cliente dentro do checkout, painel web de admin.

Ver `mobile/app/` para as rotas (`(auth)`, `(client)`, `(barber)`) e `mobile/lib/` para os helpers de dados/auth.
