export interface ProjectDocument {
  id: string;
  projectId: string;
  authorId: string;
  storagePath: string;
  originalName: string;
  description: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}
