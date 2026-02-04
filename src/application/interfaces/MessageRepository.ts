import { ProjectMessage } from "@/domain/entities/ProjectMessage";

export interface MessageRepository {
  create(data: {
    projectId: string;
    authorId: string;
    content: string;
  }): Promise<ProjectMessage>;
  listByProject(projectId: string): Promise<ProjectMessage[]>;
  deleteByProject(projectId: string): Promise<void>;
}
