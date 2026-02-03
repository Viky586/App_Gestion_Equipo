import { Project } from "@/domain/entities/Project";
import { ProjectMessage } from "@/domain/entities/ProjectMessage";
import { ProjectNote } from "@/domain/entities/ProjectNote";
import { ProjectDocument } from "@/domain/entities/ProjectDocument";
import { User } from "@/domain/entities/User";

type ProjectRow = {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type MessageRow = {
  id: string;
  project_id: string;
  author_id: string;
  content: string;
  created_at: string;
};

type NoteRow = {
  id: string;
  project_id: string;
  author_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

type DocumentRow = {
  id: string;
  project_id: string;
  author_id: string;
  storage_path: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
};

type UserRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: "ADMIN" | "COLLAB";
  created_at: string;
  updated_at: string;
};

export const mapProject = (row: ProjectRow): Project => ({
  id: row.id,
  name: row.name,
  description: row.description,
  createdBy: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapMessage = (row: MessageRow): ProjectMessage => ({
  id: row.id,
  projectId: row.project_id,
  authorId: row.author_id,
  content: row.content,
  createdAt: row.created_at,
});

export const mapNote = (row: NoteRow): ProjectNote => ({
  id: row.id,
  projectId: row.project_id,
  authorId: row.author_id,
  title: row.title,
  content: row.content,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapDocument = (row: DocumentRow): ProjectDocument => ({
  id: row.id,
  projectId: row.project_id,
  authorId: row.author_id,
  storagePath: row.storage_path,
  originalName: row.original_name,
  mimeType: row.mime_type,
  sizeBytes: row.size_bytes,
  createdAt: row.created_at,
});

export const mapUser = (row: UserRow): User => ({
  id: row.id,
  email: row.email,
  fullName: row.full_name,
  role: row.role,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});
