import { ProjectTask, TaskStatus } from "@/domain/entities/ProjectTask";

export interface TaskRepository {
  create(data: {
    projectId: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    assignedTo: string;
    createdBy: string;
  }): Promise<ProjectTask>;
  findById(id: string): Promise<ProjectTask | null>;
  listByProject(projectId: string): Promise<ProjectTask[]>;
  updateStatus(id: string, status: TaskStatus): Promise<ProjectTask>;
  updateAssignee(id: string, assignedTo: string): Promise<ProjectTask>;
  updateArchive(id: string, isArchived: boolean): Promise<ProjectTask>;
  delete(id: string): Promise<void>;
}
