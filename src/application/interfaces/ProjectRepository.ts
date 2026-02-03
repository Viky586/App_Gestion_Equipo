import { Project } from "@/domain/entities/Project";

export interface ProjectRepository {
  create(data: {
    name: string;
    description: string | null;
    createdBy: string;
  }): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  listForUser(userId: string): Promise<Project[]>;
  update(
    id: string,
    data: { name?: string; description?: string | null }
  ): Promise<Project>;
  delete(id: string): Promise<void>;
}
