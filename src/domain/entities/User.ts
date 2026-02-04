import { Role } from "@/domain/value-objects/Role";

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  role: Role;
  isPrimaryAdmin?: boolean;
  createdAt: string;
  updatedAt: string;
}
