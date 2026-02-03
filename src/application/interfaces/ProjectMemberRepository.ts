import { ProjectMember } from "@/domain/entities/ProjectMember";

export interface ProjectMemberRepository {
  addMember(data: {
    projectId: string;
    userId: string;
    assignedBy: string;
  }): Promise<ProjectMember>;
  removeMember(projectId: string, userId: string): Promise<void>;
  isMember(projectId: string, userId: string): Promise<boolean>;
  listMembers(projectId: string): Promise<ProjectMember[]>;
}
