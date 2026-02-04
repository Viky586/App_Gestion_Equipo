"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type PersonalNote = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
};

export function PersonalNotesPanel() {
  const [notes, setNotes] = useState<PersonalNote[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadNotes = async () => {
    const res = await fetch("/api/personal-notes");
    if (!res.ok) return;
    const { data } = await res.json();
    setNotes(data ?? []);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadNotes().catch(() => null);
  }, []);

  const confirmDeletion = () => {
    const answer = window.prompt(
      "Escribe BORRAR para eliminar la nota."
    );
    return answer === "BORRAR";
  };

  const handleCreate = async () => {
    setError(null);
    const res = await fetch("/api/personal-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    if (!res.ok) {
      const payload = await res.json();
      setError(payload.error?.message ?? "No se pudo guardar la nota.");
      return;
    }
    setTitle("");
    setContent("");
    await loadNotes();
  };

  const handleEdit = async (note: PersonalNote) => {
    const nextTitle = window.prompt("Nuevo titulo", note.title);
    if (!nextTitle) return;
    const nextContent = window.prompt("Nuevo contenido", note.content);
    if (!nextContent) return;
    const res = await fetch(`/api/personal-notes/${note.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: nextTitle, content: nextContent }),
    });
    if (!res.ok) {
      const payload = await res.json();
      setError(payload.error?.message ?? "No se pudo actualizar la nota.");
      return;
    }
    await loadNotes();
  };

  const handleDelete = async (noteId: string) => {
    if (!confirmDeletion()) return;
    const res = await fetch(`/api/personal-notes/${noteId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const payload = await res.json();
      setError(payload.error?.message ?? "No se pudo eliminar la nota.");
      return;
    }
    await loadNotes();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notas personales</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Titulo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Escribe una nota privada..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}
          <Button onClick={handleCreate}>Guardar nota</Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardHeader>
                <CardTitle className="text-base">{note.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {note.content}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(note)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(note.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No tienes notas privadas.
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
