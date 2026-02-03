import { NextResponse } from "next/server";
import { createRequestDependencies } from "@/infrastructure/di/createDependencies";
import { requireActor } from "@/presentation/routes/auth";
import { jsonError } from "@/presentation/routes/http";
import { DeleteDocument } from "@/application/use-cases/DeleteDocument";
import { getUuidParam } from "@/presentation/routes/params";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const { supabase, repos, services } = await createRequestDependencies();
    const actor = await requireActor(supabase, repos.users);
    const documentId = await getUuidParam(params, "documentId");
    const useCase = new DeleteDocument(repos.documents, services.storage);
    await useCase.execute({ actor, documentId });
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
