import { NextResponse } from "next/server";
import { createRequestDependencies } from "@/infrastructure/di/createDependencies";
import { requireActor } from "@/presentation/routes/auth";
import { jsonError } from "@/presentation/routes/http";
import { createPersonalNoteSchema } from "@/presentation/validation/schemas";
import { CreatePersonalNote } from "@/application/use-cases/CreatePersonalNote";

export async function GET() {
  try {
    const { supabase, repos } = await createRequestDependencies();
    const actor = await requireActor(supabase, repos.users);
    const notes = await repos.personalNotes.listByUser(actor.userId);
    return NextResponse.json({ data: notes });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, repos } = await createRequestDependencies();
    const actor = await requireActor(supabase, repos.users);
    const payload = createPersonalNoteSchema.parse(await request.json());
    const useCase = new CreatePersonalNote(repos.personalNotes);
    const note = await useCase.execute({
      actor,
      content: payload.content,
    });
    return NextResponse.json({ data: note }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
