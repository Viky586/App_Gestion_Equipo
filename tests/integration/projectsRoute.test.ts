import { describe, it, expect, vi, beforeEach } from "vitest";

type MockFn = ReturnType<typeof vi.fn>;

type MockDeps = {
  supabase: {
    auth: {
      getUser: MockFn;
    };
  };
  repos: {
    users: {
      findById: MockFn;
    };
    projects: {
      create: MockFn;
    };
    members: {
      addMember: MockFn;
    };
  };
};

let mockDeps: MockDeps;

vi.mock("@/infrastructure/di/createDependencies", () => ({
  createRequestDependencies: () => mockDeps,
}));

describe("POST /api/projects", () => {
  let POST: typeof import("@/app/api/projects/route").POST;

  beforeEach(() => {
    mockDeps = {
      supabase: {
        auth: {
          getUser: vi.fn(),
        },
      },
      repos: {
        users: {
          findById: vi.fn(),
        },
        projects: {
          create: vi.fn(),
        },
        members: {
          addMember: vi.fn(),
        },
      },
    };
  });

  beforeEach(async () => {
    const mod = await import("@/app/api/projects/route");
    POST = mod.POST;
  });

  it("creates a project for admin (happy path)", async () => {
    mockDeps.supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "admin-1" } },
      error: null,
    });
    mockDeps.repos.users.findById.mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      fullName: "Admin",
      role: "ADMIN",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    mockDeps.repos.projects.create.mockResolvedValue({
      id: "proj-1",
      name: "Proyecto",
      description: null,
      createdBy: "admin-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    mockDeps.repos.members.addMember.mockResolvedValue({
      projectId: "proj-1",
      userId: "admin-1",
      assignedBy: "admin-1",
      assignedAt: new Date().toISOString(),
    });

    const request = new Request("http://localhost/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Proyecto" }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.data.name).toBe("Proyecto");
  });

  it("rejects non-admins (forbidden)", async () => {
    mockDeps.supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    mockDeps.repos.users.findById.mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      fullName: "User",
      role: "COLLAB",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const request = new Request("http://localhost/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Proyecto" }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error.code).toBe("FORBIDDEN");
  });
});
