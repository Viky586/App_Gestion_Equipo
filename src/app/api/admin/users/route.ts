import { NextResponse } from "next/server";
import { createRequestDependencies } from "@/infrastructure/di/createDependencies";
import { requireActor } from "@/presentation/routes/auth";
import { jsonError } from "@/presentation/routes/http";
import { createCollaboratorSchema } from "@/presentation/validation/schemas";
import { CreateCollaborator } from "@/application/use-cases/CreateCollaborator";
import { ForbiddenError } from "@/domain/errors/AppError";

export async function POST(request: Request) {
  try {
    const { supabase, repos, services } = await createRequestDependencies();
    const actor = await requireActor(supabase, repos.users);
    const payload = createCollaboratorSchema.parse(await request.json());
    const useCase = new CreateCollaborator(services.authAdmin, repos.users);
    const result = await useCase.execute({
      actor,
      email: payload.email,
      password: payload.password,
      fullName: payload.fullName,
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
      throw new ForbiddenError("Admins only.");
    }
    const users = await repos.users.listCollaborators();
    return NextResponse.json({ data: users });
  } catch (error) {
    return jsonError(error);
  }
}
