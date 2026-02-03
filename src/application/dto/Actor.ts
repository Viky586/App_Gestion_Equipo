import { Role } from "@/domain/value-objects/Role";

export interface Actor {
  userId: string;
  role: Role;
}
