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

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "PENDING" | "REVIEWED" | "DONE";
  isArchived: boolean;
  archivedAt: string | null;
  assignedTo: string;
  assignedToName?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
};

export function ProjectDetail({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
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
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskMembers, setTaskMembers] = useState<
    Array<{ userId: string; userName: string }>
  >([]);
  const [taskError, setTaskError] = useState<string | null>(null);

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

  const loadTasks = async () => {
    const res = await fetch(`/api/projects/${projectId}/tasks`);
    if (res.ok) {
      const { data } = await res.json();
      setTasks(data ?? []);
    }
  };

  const loadMembers = async () => {
    const res = await fetch(`/api/projects/${projectId}/members`);
    if (res.ok) {
      const { data } = await res.json();
      setTaskMembers(data ?? []);
    }
  };

  useEffect(() => {
    fetch("/api/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        setCurrentUserId(payload?.data?.id ?? null);
        setCurrentUserIsPrimaryAdmin(Boolean(payload?.data?.isPrimaryAdmin));
        setCurrentUserRole(payload?.data?.role ?? null);
      })
      .catch(() => null);
    loadProject();
    loadMessages();
    loadNotes();
    loadDocuments();
    loadTasks();
    loadMembers();
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

  const handleCreateTask = async () => {
    setTaskError(null);
    if (!taskTitle.trim()) {
      setTaskError("El titulo es obligatorio.");
      return;
    }
    if (!taskAssignee) {
      setTaskError("Selecciona un responsable.");
      return;
    }
    const response = await fetch(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: taskTitle,
        description: taskDescription || null,
        assignedTo: taskAssignee,
      }),
    });
    if (!response.ok) {
      const payload = await response.json();
      setTaskError(payload.error?.message ?? "No se pudo crear la tarea.");
      return;
    }
    setTaskTitle("");
    setTaskDescription("");
    setTaskAssignee("");
    await loadTasks();
  };

  const updateTask = async (
    taskId: string,
    payload: {
      status?: "PENDING" | "REVIEWED" | "DONE";
      assignedTo?: string;
      archived?: boolean;
    }
  ) => {
    const response = await fetch(
      `/api/projects/${projectId}/tasks/${taskId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (!response.ok) {
      const result = await response.json();
      setTaskError(result.error?.message ?? "No se pudo actualizar la tarea.");
      return;
    }
    await loadTasks();
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirmDeletion("la tarea")) return;
    const response = await fetch(
      `/api/projects/${projectId}/tasks/${taskId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      const result = await response.json();
      setTaskError(result.error?.message ?? "No se pudo eliminar la tarea.");
      return;
    }
    await loadTasks();
  };

  const getStatusMeta = (status: Task["status"]) => {
    if (status === "REVIEWED") {
      return {
        label: "Revisado",
        badge: "bg-sky-100 text-sky-800",
        dot: "bg-sky-500",
      };
    }
    if (status === "DONE") {
      return {
        label: "Terminado",
        badge: "bg-emerald-100 text-emerald-800",
        dot: "bg-emerald-500",
      };
    }
    return {
      label: "Pendiente",
      badge: "bg-amber-100 text-amber-800",
      dot: "bg-amber-500",
    };
  };

  const archivedMeta = {
    label: "Archivada",
    badge: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
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
          <TabsTrigger value="tasks">Tareas</TabsTrigger>
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

        <TabsContent value="tasks" className="space-y-4">
          {currentUserRole === "ADMIN" ? (
            <Card>
              <CardHeader>
                <CardTitle>Nueva tarea</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Input
                    placeholder="Titulo de la tarea"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Descripcion (opcional)"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                  >
                    <option value="">Selecciona responsable</option>
                    {taskMembers.map((member) => (
                      <option key={member.userId} value={member.userId}>
                        {member.userName}
                      </option>
                    ))}
                  </select>
                </div>
                {taskError ? (
                  <p className="text-sm text-destructive">{taskError}</p>
                ) : null}
                <Button onClick={handleCreateTask}>Crear tarea</Button>
              </CardContent>
            </Card>
          ) : null}

            <Card>
              <CardHeader>
                <CardTitle>Tareas del proyecto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {taskError ? (
                  <p className="text-sm text-destructive">{taskError}</p>
                ) : null}
              {[...tasks]
                .sort((a, b) => Number(a.isArchived) - Number(b.isArchived))
                .map((task) => {
                  const statusMeta = task.isArchived
                    ? archivedMeta
                    : getStatusMeta(task.status);
                  return (
                    <Card
                      key={task.id}
                      className={
                        task.isArchived
                          ? "border-slate-200 bg-slate-50/70"
                          : undefined
                      }
                    >
                      <CardContent className="space-y-2 pt-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{task.title}</p>
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-base font-semibold ${statusMeta.badge}`}
                          >
                            <span
                              className={`h-3 w-3 rounded-full ${statusMeta.dot}`}
                              aria-hidden="true"
                            />
                            {statusMeta.label}
                          </span>
                        </div>
                        {task.description ? (
                          <p className="text-sm text-muted-foreground">
                            {task.description}
                          </p>
                        ) : null}
                        <p className="text-xs text-muted-foreground">
                          Responsable: {task.assignedToName ?? task.assignedTo}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Creado por: {task.createdByName ?? task.createdBy}
                        </p>
                        {task.isArchived ? (
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                              Archivada
                            </span>
                            {currentUserIsPrimaryAdmin ? (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                  updateTask(task.id, { archived: false })
                                }
                              >
                                Reactivar
                              </Button>
                            ) : null}
                          </div>
                        ) : currentUserId === task.assignedTo ||
                          currentUserRole === "ADMIN" ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                              value={task.status}
                              onChange={(e) => {
                                const nextStatus = e.target.value as Task["status"];
                                if (nextStatus === "DONE") {
                                  const shouldArchive = window.confirm(
                                    "Archivar tarea?"
                                  );
                                  updateTask(task.id, {
                                    status: nextStatus,
                                    archived: shouldArchive,
                                  });
                                  return;
                                }
                                updateTask(task.id, { status: nextStatus });
                              }}
                            >
                              <option value="PENDING">Pendiente</option>
                              <option value="REVIEWED">Revisado</option>
                              <option value="DONE">Terminado</option>
                            </select>
                            {currentUserRole === "ADMIN" ? (
                              <>
                                <select
                                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                  value={task.assignedTo}
                                  onChange={(e) =>
                                    updateTask(task.id, {
                                      assignedTo: e.target.value,
                                    })
                                  }
                                >
                                  {taskMembers.map((member) => (
                                    <option
                                      key={member.userId}
                                      value={member.userId}
                                    >
                                      {member.userName}
                                    </option>
                                  ))}
                                </select>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteTask(task.id)}
                                >
                                  Eliminar
                                </Button>
                              </>
                            ) : null}
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  );
                })}
              {tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay tareas todavia.
                </p>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
