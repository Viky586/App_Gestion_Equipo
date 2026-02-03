import { describe, it, expect } from "vitest";
import { AssignUserToProject } from "@/application/use-cases/AssignUserToProject";
import { ProjectRepository } from "@/application/interfaces/ProjectRepository";
import { UserRepository } from "@/application/interfaces/UserRepository";
import { ProjectMemberRepository } from "@/application/interfaces/ProjectMemberRepository";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@/domain/errors/AppError";

class InMemoryProjectRepo implements ProjectRepository {
  constructor(private exists: boolean) {}
  async create(_data: {
    name: string;
    description: string | null;
    createdBy: string;
  }) {
    const now = new Date().toISOString();
    return {
      id: "proj-1",
      name: _data.name,
      description: _data.description,
      createdBy: _data.createdBy,
      createdAt: now,
      updatedAt: now,
    };
  }
  async findById(_id: string) {
    void _id;
    if (!this.exists) return null;
    return {
      id: "proj-1",
      name: "Project",
      description: null,
      createdBy: "admin-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  async listForUser(_userId: string) {
    void _userId;
    return [];
  }
  async update(
    _id: string,
    _data: { name?: string; description?: string | null }
  ) {
    void _id;
    void _data;
    const now = new Date().toISOString();
    return {
      id: _id,
      name: _data.name ?? "Project",
      description: _data.description ?? null,
      createdBy: "admin-1",
      createdAt: now,
      updatedAt: now,
    };
  }
  async delete(_id: string) {
    void _id;
    throw new Error("Not implemented");
  }
}

class InMemoryUserRepo implements UserRepository {
  constructor(private exists: boolean) {}
  async findById(_id: string) {
    void _id;
    if (!this.exists) return null;
    return {
      id: "user-1",
      email: "user@example.com",
      fullName: "User",
      role: "COLLAB" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  async findByEmail(_email: string) {
    void _email;
    return null;
  }
  async listCollaborators() {
    return [];
  }
  async updateRole(_id: string, _role: "ADMIN" | "COLLAB") {
    void _id;
    void _role;
  }
}

class InMemoryMemberRepo implements ProjectMemberRepository {
  public members = new Set<string>();
  async addMember(data: {
    projectId: string;
    userId: string;
    assignedBy: string;
  }) {
    const assignedAt = new Date().toISOString();
    this.members.add(`${data.projectId}:${data.userId}`);
    return { ...data, assignedAt };
  }
  async removeMember(_projectId: string, _userId: string) {
    void _projectId;
    void _userId;
  }
  async isMember(projectId: string, userId: string) {
    return this.members.has(`${projectId}:${userId}`);
  }
  async listMembers(_projectId: string) {
    void _projectId;
    return [];
  }
}

describe("AssignUserToProject", () => {
  it("assigns a user to a project", async () => {
    const projectRepo = new InMemoryProjectRepo(true);
    const userRepo = new InMemoryUserRepo(true);
    const memberRepo = new InMemoryMemberRepo();
    const useCase = new AssignUserToProject(projectRepo, userRepo, memberRepo);

    await useCase.execute({
      actor: { userId: "admin-1", role: "ADMIN" },
      projectId: "proj-1",
      userId: "user-1",
    });

    expect(await memberRepo.isMember("proj-1", "user-1")).toBe(true);
  });

  it("rejects non-admins", async () => {
    const projectRepo = new InMemoryProjectRepo(true);
    const userRepo = new InMemoryUserRepo(true);
    const memberRepo = new InMemoryMemberRepo();
    const useCase = new AssignUserToProject(projectRepo, userRepo, memberRepo);

    await expect(
      useCase.execute({
        actor: { userId: "user-1", role: "COLLAB" },
        projectId: "proj-1",
        userId: "user-1",
      })
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("fails when project does not exist", async () => {
    const projectRepo = new InMemoryProjectRepo(false);
    const userRepo = new InMemoryUserRepo(true);
    const memberRepo = new InMemoryMemberRepo();
    const useCase = new AssignUserToProject(projectRepo, userRepo, memberRepo);

    await expect(
      useCase.execute({
        actor: { userId: "admin-1", role: "ADMIN" },
        projectId: "proj-1",
        userId: "user-1",
      })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("fails when user already assigned", async () => {
    const projectRepo = new InMemoryProjectRepo(true);
    const userRepo = new InMemoryUserRepo(true);
    const memberRepo = new InMemoryMemberRepo();
    await memberRepo.addMember({
      projectId: "proj-1",
      userId: "user-1",
      assignedBy: "admin-1",
    });
    const useCase = new AssignUserToProject(projectRepo, userRepo, memberRepo);

    await expect(
      useCase.execute({
        actor: { userId: "admin-1", role: "ADMIN" },
        projectId: "proj-1",
        userId: "user-1",
      })
    ).rejects.toBeInstanceOf(ConflictError);
  });
});
