import { NextResponse } from "next/server";
import { createRequestDependencies } from "@/infrastructure/di/createDependencies";
import { requireActor } from "@/presentation/routes/auth";
import { jsonError } from "@/presentation/routes/http";
import { inviteUserSchema } from "@/presentation/validation/schemas";
import { InviteUser } from "@/application/use-cases/InviteUser";
import { ForbiddenError } from "@/domain/errors/AppError";

export async function POST(request: Request) {
  try {
    const { supabase, repos, services } = await createRequestDependencies();
    const actor = await requireActor(supabase, repos.users);
    const payload = inviteUserSchema.parse(await request.json());
    const useCase = new InviteUser(services.authAdmin, repos.users);
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
    const redirectTo = `${origin}/accept-invite`;
    const result = await useCase.execute({
      actor,
      email: payload.email,
      role: payload.role,
      redirectTo,
    });
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}

export async function GET() {
  try {
    const { supabase, repos } = await createRequestDependencies();
    const actor = await requireActor(supabase, repos.users);
    if (actor.role !== "ADMIN") {
      throw new ForbiddenError("Solo administradores.");
    }
    const users = await repos.users.listUsers();
    return NextResponse.json({ data: users });
  } catch (error) {
    return jsonError(error);
  }
}
