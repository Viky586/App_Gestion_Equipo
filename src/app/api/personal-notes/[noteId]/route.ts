import { NextResponse } from "next/server";
import { createRequestDependencies } from "@/infrastructure/di/createDependencies";
import { requireActor } from "@/presentation/routes/auth";
import { jsonError } from "@/presentation/routes/http";
import { updatePersonalNoteSchema } from "@/presentation/validation/schemas";
import { UpdatePersonalNote } from "@/application/use-cases/UpdatePersonalNote";
import { DeletePersonalNote } from "@/application/use-cases/DeletePersonalNote";
import { getUuidParam, RouteContext } from "@/presentation/routes/params";

export async function PATCH(
  request: Request,
  { params }: RouteContext<{ noteId: string }>
) {
  try {
    const { supabase, repos } = await createRequestDependencies();
    const actor = await requireActor(supabase, repos.users);
    const noteId = await getUuidParam(params, "noteId");
    const payload = updatePersonalNoteSchema.parse(await request.json());
    const useCase = new UpdatePersonalNote(repos.personalNotes);
    const note = await useCase.execute({
      actor,
      noteId,
      title: payload.title,
      content: payload.content,
    });
    return NextResponse.json({ data: note });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext<{ noteId: string }>
) {
  try {
    const { supabase, repos } = await createRequestDependencies();
    const actor = await requireActor(supabase, repos.users);
    const noteId = await getUuidParam(params, "noteId");
    const useCase = new DeletePersonalNote(repos.personalNotes);
    await useCase.execute({ actor, noteId });
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
