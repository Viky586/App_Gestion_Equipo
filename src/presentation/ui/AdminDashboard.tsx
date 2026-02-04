"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Project = {
  id: string;
  name: string;
  description: string | null;
};

type User = {
  id: string;
  email: string;
  fullName: string | null;
  role: "ADMIN" | "COLLAB";
};

export function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "COLLAB">("COLLAB");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    const [projectsRes, usersRes] = await Promise.all([
      fetch("/api/projects"),
      fetch("/api/admin/users"),
    ]);
    if (projectsRes.ok) {
      const { data } = await projectsRes.json();
      setProjects(data);
    }
    if (usersRes.ok) {
      const { data } = await usersRes.json();
      setUsers(data);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData().catch(() => null);
  }, []);

  const handleCreateProject = async () => {
    setError(null);
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: projectName,
        description: projectDescription || null,
      }),
    });
    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error?.message ?? "No se pudo crear el proyecto.");
      return;
    }
    setProjectName("");
    setProjectDescription("");
    await loadData();
  };

  const handleInviteUser = async () => {
    setError(null);
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: inviteEmail,
        role: inviteRole,
      }),
    });
    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error?.message ?? "No se pudo enviar la invitacion.");
      return;
    }
    setInviteEmail("");
    setInviteRole("COLLAB");
    await loadData();
  };

  const handleAssign = async () => {
    if (!selectedProject || !selectedUser) {
      setError("Selecciona proyecto y usuario.");
      return;
    }
    setError(null);
    const response = await fetch(`/api/projects/${selectedProject}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selectedUser }),
    });
    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error?.message ?? "No se pudo asignar el usuario.");
      return;
    }
    setSelectedProject("");
    setSelectedUser("");
  };

  const handleEditProject = async (project: Project) => {
    if (!project.id) {
      setError("Proyecto inválido.");
      return;
    }
    const name = window.prompt("Nuevo nombre", project.name);
    if (!name) return;
    const description = window.prompt(
      "Nueva descripción (opcional)",
      project.description ?? ""
    );
    const response = await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error?.message ?? "No se pudo actualizar.");
      return;
    }
    await loadData();
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!projectId) {
      setError("Proyecto inválido.");
      return;
    }
    const confirmation = window.prompt(
      "Escribe BORRAR para eliminar el proyecto."
    );
    if (confirmation !== "BORRAR") return;
    const response = await fetch(`/api/projects/${projectId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error?.message ?? "No se pudo eliminar.");
      return;
    }
    await loadData();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Nuevo proyecto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} />
            </div>
            <Button onClick={handleCreateProject}>Crear proyecto</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invitar usuario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={inviteRole}
                onChange={(e) =>
                  setInviteRole(e.target.value === "ADMIN" ? "ADMIN" : "COLLAB")
                }
              >
                <option value="COLLAB">Colaborador</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <p className="text-xs text-muted-foreground">
              Se enviara un email para definir nombre y contraseña.
            </p>
            <Button onClick={handleInviteUser}>Enviar invitacion</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asignar a proyecto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Proyecto</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                <option value="">Selecciona</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Colaborador</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Selecciona</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName ?? user.email} ({user.role})
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={handleAssign}>Asignar</Button>
          </CardContent>
        </Card>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Proyectos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
              <TableHead>Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>{project.name}</TableCell>
                <TableCell>{project.description ?? "-"}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    <Link className="text-sm text-primary underline" href={`/projects/${project.id}`}>
                      Abrir
                    </Link>
                    <Button variant="secondary" size="sm" onClick={() => handleEditProject(project)}>
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteProject(project.id)}>
                      Eliminar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
