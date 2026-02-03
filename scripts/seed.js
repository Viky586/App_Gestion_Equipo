/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE env vars.");
  process.exit(1);
}

const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@teamhub.dev";
const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
const adminName = process.env.SEED_ADMIN_NAME || "Admin Seed";

const collabEmail = process.env.SEED_COLLAB_EMAIL || "collab@teamhub.dev";
const collabPassword = process.env.SEED_COLLAB_PASSWORD || "ChangeMe123!";
const collabName = process.env.SEED_COLLAB_NAME || "Collab Seed";

const projectName = process.env.SEED_PROJECT_NAME || "Proyecto Seed";

async function ensureUser(client, { email, password, fullName, role }) {
  const { data: existingProfile, error: profileError } = await client
    .from("profiles")
    .select("id, role")
    .eq("email", email)
    .maybeSingle();
  if (profileError) {
    throw new Error(profileError.message);
  }
  if (existingProfile?.id) {
    if (existingProfile.role !== role) {
      const { error: roleError } = await client
        .from("profiles")
        .update({ role })
        .eq("id", existingProfile.id);
      if (roleError) {
        throw new Error(roleError.message);
      }
    }
    return existingProfile.id;
  }

  const { data, error } = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error || !data.user) {
    if (error?.message?.includes("already been registered")) {
      const { data: fallbackProfile } = await client
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();
      if (fallbackProfile?.id) return fallbackProfile.id;
    }
    throw new Error(error?.message || "Failed to create user.");
  }

  const { error: roleError } = await client
    .from("profiles")
    .update({ role })
    .eq("id", data.user.id);
  if (roleError) {
    throw new Error(roleError.message);
  }
  return data.user.id;
}

async function main() {
  const { createClient } = await import("@supabase/supabase-js");
  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const adminId = await ensureUser(client, {
    email: adminEmail,
    password: adminPassword,
    fullName: adminName,
    role: "ADMIN",
  });

  const collabId = await ensureUser(client, {
    email: collabEmail,
    password: collabPassword,
    fullName: collabName,
    role: "COLLAB",
  });

  const { data: project, error: projectError } = await client
    .from("projects")
    .insert({
      name: projectName,
      description: "Seed inicial",
      created_by: adminId,
    })
    .select("*")
    .single();
  if (projectError || !project) {
    throw new Error(projectError?.message || "Failed to create project.");
  }

  const { error: memberError } = await client.from("project_members").insert([
    {
      project_id: project.id,
      user_id: adminId,
      assigned_by: adminId,
    },
    {
      project_id: project.id,
      user_id: collabId,
      assigned_by: adminId,
    },
  ]);
  if (memberError) {
    throw new Error(memberError.message);
  }

  console.log("Seed completed:", {
    adminEmail,
    collabEmail,
    projectId: project.id,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
