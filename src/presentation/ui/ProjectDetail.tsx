"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Project = {
  id: string;
  name: string;
  description: string | null;
};

type Message = {
  id: string;
  authorId: string;
  authorName?: string;
  content: string;
  createdAt: string;
};

type Note = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName?: string;
  updatedAt: string;
};

type DocumentItem = {
  id: string;
  originalName: string;
  signedUrl: string;
  authorId: string;
  authorName?: string;
  createdAt: string;
};

export function ProjectDetail({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [messageText, setMessageText] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [uploading, setUploading] = useState(false);

  const loadProject = async () => {
    if (!projectId) {
      setProjectError("ID de proyecto inválido.");
      return;
    }
    const res = await fetch(`/api/projects/${projectId}`);
    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      setProjectError(payload?.error?.message ?? "No se pudo cargar el proyecto.");
      return;
    }
    const { data } = await res.json();
    setProject(data);
    setProjectError(null);
  };

  const loadMessages = async () => {
    const res = await fetch(`/api/projects/${projectId}/messages`);
    if (res.ok) {
      const { data } = await res.json();
      setMessages(data ?? []);
    }
  };

  const loadNotes = async () => {
    const res = await fetch(`/api/projects/${projectId}/notes`);
    if (res.ok) {
      const { data } = await res.json();
      setNotes(data ?? []);
    }
  };

  const loadDocuments = async () => {
    const res = await fetch(`/api/projects/${projectId}/documents`);
    if (res.ok) {
      const { data } = await res.json();
      setDocuments(data ?? []);
    }
  };

  useEffect(() => {
    loadProject();
    loadMessages();
    loadNotes();
    loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    await fetch(`/api/projects/${projectId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: messageText }),
    });
    setMessageText("");
    await loadMessages();
  };

  const handleCreateNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) return;
    await fetch(`/api/projects/${projectId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: noteTitle, content: noteContent }),
    });
    setNoteTitle("");
    setNoteContent("");
    await loadNotes();
  };

  const handleEditNote = async (note: Note) => {
    const title = window.prompt("Nuevo título", note.title);
    const content = window.prompt("Nuevo contenido", note.content);
    if (!title || !content) return;
    await fetch(`/api/projects/${projectId}/notes/${note.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    await loadNotes();
  };

  const handleDeleteNote = async (noteId: string) => {
    await fetch(`/api/projects/${projectId}/notes/${noteId}`, {
      method: "DELETE",
    });
    await loadNotes();
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    await fetch(`/api/projects/${projectId}/documents`, {
      method: "POST",
      body: form,
    });
    setUploading(false);
    await loadDocuments();
  };

  const handleDeleteDocument = async (documentId: string) => {
    await fetch(`/api/projects/${projectId}/documents/${documentId}`, {
      method: "DELETE",
    });
    await loadDocuments();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{project?.name ?? "Proyecto"}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {project?.description ?? "Sin descripción"}
          </p>
          {projectError ? (
            <p className="mt-2 text-sm text-destructive">{projectError}</p>
          ) : null}
        </CardContent>
      </Card>

      <Tabs defaultValue="chat" className="space-y-4">
        <TabsList>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="notes">Notas</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardContent className="space-y-3 pt-6">
              <div className="max-h-80 space-y-2 overflow-y-auto rounded-md border p-3">
                {messages.map((msg) => (
                  <div key={msg.id} className="text-sm">
                    <span className="font-medium">
                      {msg.authorName ?? msg.authorId}
                    </span>
                    : {msg.content}
                  </div>
                ))}
                {messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay mensajes todavía.
                  </p>
                ) : null}
              </div>
              <div className="flex gap-2">
                <Textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Escribe un mensaje..."
                />
                <Button onClick={handleSendMessage}>Enviar</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardContent className="space-y-3 pt-6">
              <Input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file);
                }}
                disabled={uploading}
              />
              <ul className="space-y-2">
                {documents.map((doc) => (
                  <li key={doc.id} className="space-y-1 text-sm">
                    <div className="flex items-center justify-between">
                      <a
                        className="text-primary underline"
                        href={doc.signedUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {doc.originalName}
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Subido por {doc.authorName ?? doc.authorId}
                    </p>
                  </li>
                ))}
                {documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay documentos.</p>
                ) : null}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardContent className="space-y-3 pt-6">
              <Input
                placeholder="Título"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />
              <Textarea
                placeholder="Escribe una nota..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              />
              <Button onClick={handleCreateNote}>Guardar nota</Button>
            </CardContent>
          </Card>
          <div className="grid gap-3 md:grid-cols-2">
            {notes.map((note) => (
              <Card key={note.id}>
                <CardHeader>
                  <CardTitle className="text-base">{note.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">{note.content}</p>
                  <p className="text-xs text-muted-foreground">
                    Autor: {note.authorName ?? note.authorId}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => handleEditNote(note)}>
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteNote(note.id)}>
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay notas.</p>
            ) : null}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
