import { describe, it, expect } from "vitest";
import { PostProjectMessage } from "@/application/use-cases/PostProjectMessage";
import { ProjectRepository } from "@/application/interfaces/ProjectRepository";
import { ProjectMemberRepository } from "@/application/interfaces/ProjectMemberRepository";
import { MessageRepository } from "@/application/interfaces/MessageRepository";
import { ForbiddenError, NotFoundError } from "@/domain/errors/AppError";

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

class InMemoryMemberRepo implements ProjectMemberRepository {
  private members = new Set<string>();
  async addMember(data: {
    projectId: string;
    userId: string;
    assignedBy: string;
  }) {
    const assignedAt = new Date().toISOString();
    this.members.add(`${data.projectId}:${data.userId}`);
    return { ...data, assignedAt };
  }
  async removeMember() {}
  async isMember(projectId: string, userId: string) {
    return this.members.has(`${projectId}:${userId}`);
  }
  async listMembers() {
    return [];
  }
}

class InMemoryMessageRepo implements MessageRepository {
  public created: Array<{ projectId: string; authorId: string; content: string }> =
    [];
  async create(data: {
    projectId: string;
    authorId: string;
    content: string;
  }) {
    const createdAt = new Date().toISOString();
    this.created.push(data);
    return { id: "msg-1", ...data, createdAt };
  }
  async listByProject(_projectId: string) {
    void _projectId;
    return [];
  }
  async deleteByProject(_projectId: string) {
    void _projectId;
  }
}

describe("PostProjectMessage", () => {
  it("allows project members to post", async () => {
    const projectRepo = new InMemoryProjectRepo(true);
    const memberRepo = new InMemoryMemberRepo();
    await memberRepo.addMember({
      projectId: "proj-1",
      userId: "user-1",
      assignedBy: "admin-1",
    });
    const messageRepo = new InMemoryMessageRepo();
    const useCase = new PostProjectMessage(
      projectRepo,
      memberRepo,
      messageRepo
    );

    const message = await useCase.execute({
      actor: { userId: "user-1", role: "COLLAB" },
      projectId: "proj-1",
      content: "Hola equipo",
    });

    expect(message.id).toBe("msg-1");
    expect(messageRepo.created).toHaveLength(1);
  });

  it("rejects non-members", async () => {
    const projectRepo = new InMemoryProjectRepo(true);
    const memberRepo = new InMemoryMemberRepo();
    const messageRepo = new InMemoryMessageRepo();
    const useCase = new PostProjectMessage(
      projectRepo,
      memberRepo,
      messageRepo
    );

    await expect(
      useCase.execute({
        actor: { userId: "user-1", role: "COLLAB" },
        projectId: "proj-1",
        content: "Hola",
      })
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("fails when project does not exist", async () => {
    const projectRepo = new InMemoryProjectRepo(false);
    const memberRepo = new InMemoryMemberRepo();
    const messageRepo = new InMemoryMessageRepo();
    const useCase = new PostProjectMessage(
      projectRepo,
      memberRepo,
      messageRepo
    );

    await expect(
      useCase.execute({
        actor: { userId: "admin-1", role: "ADMIN" },
        projectId: "proj-1",
        content: "Admin message",
      })
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
