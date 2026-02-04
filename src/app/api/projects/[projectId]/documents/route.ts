import { NextResponse } from "next/server";
import { createRequestDependencies } from "@/infrastructure/di/createDependencies";
import { requireActor } from "@/presentation/routes/auth";
import { jsonError } from "@/presentation/routes/http";
import { UploadDocument } from "@/application/use-cases/UploadDocument";
import { ForbiddenError, ValidationError } from "@/domain/errors/AppError";
import { getUuidParam, RouteContext } from "@/presentation/routes/params";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: RouteContext<{ projectId: string }>
) {
  try {
    const { supabase, repos, services } = await createRequestDependencies();
    const actor = await requireActor(supabase, repos.users);
    const projectId = await getUuidParam(params, "projectId");
    if (actor.role !== "ADMIN") {
      const isMember = await repos.members.isMember(
        projectId,
        actor.userId
      );
      if (!isMember) {
        throw new ForbiddenError("No perteneces a este proyecto.");
      }
    }

    const docs = await repos.documents.listByProject(projectId);
    const authorIds = Array.from(new Set(docs.map((doc) => doc.authorId)));
    const users = await repos.users.findByIds(authorIds);
    const nameMap = new Map(
      users.map((user) => [user.id, user.fullName ?? user.email])
    );
    const ttl = Number(process.env.SIGNED_URL_TTL_SECONDS ?? "900");
    const data = await Promise.all(
      docs.map(async (doc) => ({
        ...doc,
        authorName: nameMap.get(doc.authorId) ?? doc.authorId,
        signedUrl: await services.storage.createSignedUrl(
          doc.storagePath,
          ttl
        ),
      }))
    );

    return NextResponse.json({ data });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(
  request: Request,
  { params }: RouteContext<{ projectId: string }>
) {
  try {
    const { supabase, repos, services } = await createRequestDependencies();
    const actor = await requireActor(supabase, repos.users);
    const projectId = await getUuidParam(params, "projectId");
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      throw new ValidationError("El archivo es obligatorio.");
    }

    const buffer = await file.arrayBuffer();
    const useCase = new UploadDocument(
      repos.projects,
      repos.members,
      repos.documents,
      services.storage
    );
    const doc = await useCase.execute({
      actor,
      projectId,
      file: buffer,
      originalName: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
    });

    return NextResponse.json({ data: doc }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
