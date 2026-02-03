import { Actor } from "@/application/dto/Actor";
import { DocumentRepository } from "@/application/interfaces/DocumentRepository";
import { StorageService } from "@/application/interfaces/StorageService";
import { ForbiddenError, NotFoundError } from "@/domain/errors/AppError";

export interface DeleteDocumentInput {
  actor: Actor;
  documentId: string;
}

export class DeleteDocument {
  constructor(
    private readonly documentRepo: DocumentRepository,
    private readonly storage: StorageService
  ) {}

  async execute(input: DeleteDocumentInput): Promise<void> {
    const doc = await this.documentRepo.findById(input.documentId);
    if (!doc) {
      throw new NotFoundError("Document not found.");
    }
    if (input.actor.role !== "ADMIN" && doc.authorId !== input.actor.userId) {
      throw new ForbiddenError("Only the author can delete this document.");
    }

    await this.storage.remove(doc.storagePath);
    await this.documentRepo.delete(input.documentId);
  }
}
