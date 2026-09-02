import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

Deno.serve(async () => {
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const email = "vrcfrancisco@gmail.com";
  const { data, error } = await admin.auth.admin.listUsers();
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  const user = data.users.find((u) => u.email === email);
  if (!user) return new Response(JSON.stringify({ error: "not found" }), { status: 404 });

  const { error: updErr } = await admin.auth.admin.updateUserById(user.id, {
    password: "vrcf1234",
    email_confirm: true,
  });
  if (updErr) return new Response(JSON.stringify({ error: updErr.message }), { status: 500 });

  return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
});
