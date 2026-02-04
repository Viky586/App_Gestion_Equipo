"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PersonalNotesPanel } from "@/presentation/ui/PersonalNotesPanel";

type Project = {
  id: string;
  name: string;
  description: string | null;
};

export function ProjectsOverview() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((payload) => setProjects(payload.data ?? []))
      .catch(() => null);
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mis proyectos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripcion</TableHead>
                <TableHead>Accion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>{project.description ?? "-"}</TableCell>
                  <TableCell>
                    <Link className="text-sm text-primary underline" href={`/projects/${project.id}`}>
                      Abrir
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PersonalNotesPanel />
    </div>
  );
}
