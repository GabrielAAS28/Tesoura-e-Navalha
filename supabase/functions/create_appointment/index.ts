// Supabase Edge Function — cria um agendamento calculando `ends_at` no
// servidor (duração do serviço + buffer) e nunca confiando no client.
// A prevenção de double-booking é garantida pela EXCLUDE constraint da
// tabela `appointments` (ver supabase/migrations/0001_init.sql); se o
// insert colidir com outro horário do mesmo barbeiro, o Postgres recusa
// e devolvemos 409 para o app tentar outro horário.
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client autenticado como o usuário chamador — usado só para identificar
    // quem está agendando (auth.getUser), respeitando RLS.
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), { status: 401 });
    }

    const { barber_id, service_id, starts_at } = await req.json();
    if (!barber_id || !service_id || !starts_at) {
      return new Response(
        JSON.stringify({ error: "barber_id, service_id and starts_at are required" }),
        { status: 400 }
      );
    }

    // Client com service role — grava o agendamento já validado.
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: service, error: serviceError } = await adminClient
      .from("services")
      .select("tenant_id, duration_minutes, buffer_minutes")
      .eq("id", service_id)
      .single();
    if (serviceError || !service) {
      return new Response(JSON.stringify({ error: "Service not found" }), { status: 404 });
    }

    const { data: barber, error: barberError } = await adminClient
      .from("barbers")
      .select("tenant_id")
      .eq("id", barber_id)
      .single();
    if (barberError || !barber || barber.tenant_id !== service.tenant_id) {
      return new Response(JSON.stringify({ error: "Barber not found for this service" }), {
        status: 404,
      });
    }

    const startsAt = new Date(starts_at);
    const totalMinutes = service.duration_minutes + (service.buffer_minutes ?? 0);
    const endsAt = new Date(startsAt.getTime() + totalMinutes * 60_000);

    const { data: appointment, error: insertError } = await adminClient
      .from("appointments")
      .insert({
        tenant_id: service.tenant_id,
        barber_id,
        service_id,
        client_id: user.id,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        status: "confirmed",
      })
      .select("id")
      .single();

    if (insertError) {
      // Postgres exclusion constraint violation => slot já ocupado.
      const isConflict = insertError.code === "23P01";
      return new Response(
        JSON.stringify({
          error: isConflict ? "Esse horário acabou de ser reservado." : insertError.message,
        }),
        { status: isConflict ? 409 : 500 }
      );
    }

    return new Response(JSON.stringify({ appointment_id: appointment.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
