import { Actor } from "@/application/dto/Actor";
import { DocumentRepository } from "@/application/interfaces/DocumentRepository";
import { ProjectMemberRepository } from "@/application/interfaces/ProjectMemberRepository";
import { ProjectRepository } from "@/application/interfaces/ProjectRepository";
import { StorageService } from "@/application/interfaces/StorageService";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/domain/errors/AppError";
import { ProjectDocument } from "@/domain/entities/ProjectDocument";

export interface UploadDocumentInput {
  actor: Actor;
  projectId: string;
  file: ArrayBuffer;
  originalName: string;
  description: string;
  mimeType: string;
  sizeBytes: number;
}

export class UploadDocument {
  constructor(
    private readonly projectRepo: ProjectRepository,
    private readonly memberRepo: ProjectMemberRepository,
    private readonly documentRepo: DocumentRepository,
    private readonly storage: StorageService
  ) {}

  async execute(input: UploadDocumentInput): Promise<ProjectDocument> {
    if (!input.originalName.trim()) {
      throw new ValidationError("El nombre del archivo es obligatorio.");
    }
    if (!input.description.trim()) {
      throw new ValidationError("La descripcion es obligatoria.");
    }
    const project = await this.projectRepo.findById(input.projectId);
    if (!project) {
      throw new NotFoundError("Proyecto no encontrado.");
    }
    if (input.actor.role !== "ADMIN") {
      const isMember = await this.memberRepo.isMember(
        input.projectId,
        input.actor.userId
      );
      if (!isMember) {
        throw new ForbiddenError("No perteneces a este proyecto.");
      }
    }

    const safeName = input.originalName.replace(/[^\w.\-]+/g, "_");
    const storagePath = `projects/${input.projectId}/${crypto.randomUUID()}-${safeName}`;

    await this.storage.upload(storagePath, input.file, {
      contentType: input.mimeType,
    });

    return this.documentRepo.create({
      projectId: input.projectId,
      authorId: input.actor.userId,
      storagePath,
      originalName: input.originalName,
      description: input.description.trim(),
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
    });
  }
}
