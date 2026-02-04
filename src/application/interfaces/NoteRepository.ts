import { ProjectNote } from "@/domain/entities/ProjectNote";

export interface NoteRepository {
  create(data: {
    projectId: string;
    authorId: string;
    content: string;
  }): Promise<ProjectNote>;
  update(
    id: string,
    data: { content?: string }
  ): Promise<ProjectNote>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<ProjectNote | null>;
  listByProject(projectId: string): Promise<ProjectNote[]>;
}
