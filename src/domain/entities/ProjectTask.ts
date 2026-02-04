export type TaskStatus = "PENDING" | "REVIEWED" | "DONE";

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  isArchived: boolean;
  archivedAt: string | null;
  assignedTo: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
