import { ProjectDocument } from "@/domain/entities/ProjectDocument";

export interface DocumentRepository {
  create(data: {
    projectId: string;
    authorId: string;
    storagePath: string;
    originalName: string;
    description: string;
    mimeType: string;
    sizeBytes: number;
  }): Promise<ProjectDocument>;
  findById(id: string): Promise<ProjectDocument | null>;
  delete(id: string): Promise<void>;
  listByProject(projectId: string): Promise<ProjectDocument[]>;
}
