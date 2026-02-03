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
      throw new ValidationError("File name is required.");
    }
    const project = await this.projectRepo.findById(input.projectId);
    if (!project) {
      throw new NotFoundError("Project not found.");
    }
    if (input.actor.role !== "ADMIN") {
      const isMember = await this.memberRepo.isMember(
        input.projectId,
        input.actor.userId
      );
      if (!isMember) {
        throw new ForbiddenError("Not a member of this project.");
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
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
    });
  }
}
