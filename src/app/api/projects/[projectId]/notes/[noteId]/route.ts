import { NextResponse } from "next/server";
import { createRequestDependencies } from "@/infrastructure/di/createDependencies";
import { requireActor } from "@/presentation/routes/auth";
import { jsonError } from "@/presentation/routes/http";
import { updateNoteSchema } from "@/presentation/validation/schemas";
import { UpdateNote } from "@/application/use-cases/UpdateNote";
import { DeleteNote } from "@/application/use-cases/DeleteNote";
import { getUuidParam } from "@/presentation/routes/params";

export async function PATCH(
  request: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const { supabase, repos } = await createRequestDependencies();
    const actor = await requireActor(supabase, repos.users);
    const noteId = await getUuidParam(params, "noteId");
    const payload = updateNoteSchema.parse(await request.json());
    const useCase = new UpdateNote(repos.notes);
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
  { params }: { params: { noteId: string } }
) {
  try {
    const { supabase, repos } = await createRequestDependencies();
    const actor = await requireActor(supabase, repos.users);
    const noteId = await getUuidParam(params, "noteId");
    const useCase = new DeleteNote(repos.notes);
    await useCase.execute({ actor, noteId });
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
