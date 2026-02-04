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
  description: string;
  createdAt: string;
};

export function ProjectDetail({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [messageText, setMessageText] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [uploading, setUploading] = useState(false);
  const [documentDescription, setDocumentDescription] = useState("");
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserIsPrimaryAdmin, setCurrentUserIsPrimaryAdmin] =
    useState(false);

  const confirmDeletion = (label: string) => {
    const answer = window.prompt(
      `Escribe BORRAR para eliminar ${label}.`
    );
    return answer === "BORRAR";
  };

  const loadProject = async () => {
    if (!projectId) {
      setProjectError("ID de proyecto invalido.");
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
    fetch("/api/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        setCurrentUserId(payload?.data?.id ?? null);
        setCurrentUserIsPrimaryAdmin(Boolean(payload?.data?.isPrimaryAdmin));
      })
      .catch(() => null);
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
    if (!noteContent.trim()) return;
    await fetch(`/api/projects/${projectId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: noteContent }),
    });
    setNoteContent("");
    await loadNotes();
  };

  const handleEditNote = async (note: Note) => {
    const content = window.prompt("Nuevo contenido", note.content);
    if (!content) return;
    await fetch(`/api/projects/${projectId}/notes/${note.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    await loadNotes();
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirmDeletion("la nota")) return;
    await fetch(`/api/projects/${projectId}/notes/${noteId}`, {
      method: "DELETE",
    });
    await loadNotes();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setDocumentError("Selecciona un archivo.");
      return;
    }
    if (!documentDescription.trim()) {
      setDocumentError("La descripcion es obligatoria.");
      return;
    }
    setDocumentError(null);
    setUploading(true);
    const form = new FormData();
    form.append("file", selectedFile);
    form.append("description", documentDescription.trim());
    await fetch(`/api/projects/${projectId}/documents`, {
      method: "POST",
      body: form,
    });
    setUploading(false);
    setDocumentDescription("");
    setSelectedFile(null);
    setFileInputKey((value) => value + 1);
    await loadDocuments();
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirmDeletion("el documento")) return;
    await fetch(`/api/projects/${projectId}/documents/${documentId}`, {
      method: "DELETE",
    });
    await loadDocuments();
  };

  const handleClearChat = async () => {
    if (!confirmDeletion("todos los mensajes del chat")) return;
    await fetch(`/api/projects/${projectId}/messages`, {
      method: "DELETE",
    });
    await loadMessages();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{project?.name ?? "Proyecto"}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {project?.description ?? "Sin descripcion"}
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
              {currentUserIsPrimaryAdmin ? (
                <div className="flex justify-end">
                  <Button variant="destructive" onClick={handleClearChat}>
                    Vaciar chat
                  </Button>
                </div>
              ) : null}
              <div className="max-h-80 space-y-2 overflow-y-auto rounded-md border p-3">
                {messages.map((msg) => (
                  <div key={msg.id} className="text-sm">
                    <span className="font-medium">
                      {msg.authorName ?? msg.authorId}
                    </span>
                    <span className="whitespace-pre-wrap break-words">
                      : {msg.content}
                    </span>
                  </div>
                ))}
                {messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay mensajes todavia.
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
              <div className="space-y-2">
                <Input
                  placeholder="Descripcion del documento"
                  value={documentDescription}
                  onChange={(e) => {
                    setDocumentDescription(e.target.value);
                    if (documentError) {
                      setDocumentError(null);
                    }
                  }}
                />
                {documentError ? (
                  <p className="text-sm text-destructive">{documentError}</p>
                ) : null}
              </div>
              <Input
                type="file"
                key={fileInputKey}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setSelectedFile(file ?? null);
                  if (documentError) {
                    setDocumentError(null);
                  }
                }}
                disabled={uploading}
              />
              {selectedFile ? (
                <p className="text-xs text-muted-foreground">
                  Archivo seleccionado: {selectedFile.name}
                </p>
              ) : null}
              <Button
                onClick={handleUpload}
                disabled={uploading || !selectedFile || !documentDescription.trim()}
              >
                {uploading ? "Subiendo..." : "Subir documento"}
              </Button>
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
                      {doc.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Subido por {doc.authorName ?? doc.authorId}
                    </p>
                  </li>
                ))}
                {documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay documentos.
                  </p>
                ) : null}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardContent className="space-y-3 pt-6">
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
                <CardContent className="space-y-2 pt-6">
                  <p className="text-sm text-muted-foreground">{note.content}</p>
                  <p className="text-xs text-muted-foreground">
                    Autor: {note.authorName ?? note.authorId}
                  </p>
                  <div className="flex gap-2">
                    {currentUserId === note.authorId ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditNote(note)}
                      >
                        Editar
                      </Button>
                    ) : null}
                    {currentUserId === note.authorId ||
                    currentUserIsPrimaryAdmin ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        Eliminar
                      </Button>
                    ) : null}
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
