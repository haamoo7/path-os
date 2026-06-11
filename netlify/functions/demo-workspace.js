import { neon } from "@neondatabase/serverless";

const DEMO_META = {
  seeker: {
    user_id: "demo-seeker",
    email: "jobseeker.demo@pathos.app",
    full_name: "Demo Job Seeker",
    organization: "PathOS Demo",
  },
  company: {
    user_id: "demo-company",
    email: "company.demo@pathos.app",
    full_name: "Demo Hiring Manager",
    organization: "Hatch & Co",
  },
  university: {
    user_id: "demo-university",
    email: "university.demo@pathos.app",
    full_name: "Demo Programme Lead",
    organization: "Universiti Malaya",
  },
};

function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  return databaseUrl ? neon(databaseUrl) : null;
}

export default async (request) => {
  const sql = getSql();
  if (!sql) {
    return Response.json({ error: { message: "Missing DATABASE_URL." } }, { status: 503 });
  }

  const url = new URL(request.url);
  const role = url.searchParams.get("role");

  if (!role || !DEMO_META[role]) {
    return Response.json({ error: { message: "Invalid demo role." } }, { status: 400 });
  }

  const meta = DEMO_META[role];

  try {
    if (request.method === "GET") {
      const rows = await sql`
        select workspace
        from public.account_profiles
        where user_id = ${meta.user_id}
        limit 1
      `;

      return Response.json({ workspace: rows[0]?.workspace || null });
    }

    if (request.method === "POST") {
      const body = await request.json();
      const account = body?.account;

      if (!account?.workspace || typeof account.workspace !== "object") {
        return Response.json({ error: { message: "Missing workspace payload." } }, { status: 400 });
      }

      await sql`
        insert into public.account_profiles (
          user_id,
          email,
          full_name,
          app_role,
          organization,
          workspace
        )
        values (
          ${meta.user_id},
          ${meta.email},
          ${meta.full_name},
          ${role},
          ${meta.organization},
          ${JSON.stringify(account.workspace)}::jsonb
        )
        on conflict (user_id) do update set
          email = excluded.email,
          full_name = excluded.full_name,
          app_role = excluded.app_role,
          organization = excluded.organization,
          workspace = excluded.workspace,
          updated_at = now()
      `;

      return Response.json({ ok: true });
    }

    return new Response("Method Not Allowed", { status: 405 });
  } catch (error) {
    return Response.json(
      { error: { message: error instanceof Error ? error.message : "Demo workspace sync failed." } },
      { status: 500 },
    );
  }
};
