import { describe, it, expect } from "vitest";
import { CreateProject } from "@/application/use-cases/CreateProject";
import { ProjectRepository } from "@/application/interfaces/ProjectRepository";
import { ProjectMemberRepository } from "@/application/interfaces/ProjectMemberRepository";
import { ForbiddenError, ValidationError } from "@/domain/errors/AppError";

class InMemoryProjectRepo implements ProjectRepository {
  private counter = 1;
  async create(data: {
    name: string;
    description: string | null;
    createdBy: string;
  }) {
    const now = new Date().toISOString();
    return {
      id: `proj-${this.counter++}`,
      name: data.name,
      description: data.description,
      createdBy: data.createdBy,
      createdAt: now,
      updatedAt: now,
    };
  }
  async findById(_id: string) {
    void _id;
    return null;
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
      name: _data.name ?? "Proyecto",
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

class InMemoryMemberRepo implements ProjectMemberRepository {
  public members: Array<{ projectId: string; userId: string }> = [];
  async addMember(data: {
    projectId: string;
    userId: string;
    assignedBy: string;
  }) {
    const assignedAt = new Date().toISOString();
    this.members.push({ projectId: data.projectId, userId: data.userId });
    return { ...data, assignedAt };
  }
  async removeMember() {}
  async isMember(projectId: string, userId: string) {
    return this.members.some(
      (member) => member.projectId === projectId && member.userId === userId
    );
  }
  async listMembers() {
    return [];
  }
}

describe("CreateProject", () => {
  it("creates a project and assigns the creator as member", async () => {
    const projectRepo = new InMemoryProjectRepo();
    const memberRepo = new InMemoryMemberRepo();
    const useCase = new CreateProject(projectRepo, memberRepo);

    const project = await useCase.execute({
      name: "  Proyecto Alpha  ",
      description: "Demo",
      actor: { userId: "admin-1", role: "ADMIN" },
    });

    expect(project.name).toBe("Proyecto Alpha");
    expect(memberRepo.members).toHaveLength(1);
    expect(memberRepo.members[0]).toEqual({
      projectId: project.id,
      userId: "admin-1",
    });
  });

  it("rejects non-admins", async () => {
    const projectRepo = new InMemoryProjectRepo();
    const memberRepo = new InMemoryMemberRepo();
    const useCase = new CreateProject(projectRepo, memberRepo);

    await expect(
      useCase.execute({
        name: "Proyecto",
        actor: { userId: "user-1", role: "COLLAB" },
      })
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("validates required name", async () => {
    const projectRepo = new InMemoryProjectRepo();
    const memberRepo = new InMemoryMemberRepo();
    const useCase = new CreateProject(projectRepo, memberRepo);

    await expect(
      useCase.execute({
        name: "   ",
        actor: { userId: "admin-1", role: "ADMIN" },
      })
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
