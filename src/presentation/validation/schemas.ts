import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
});

export const assignUserSchema = z.object({
  userId: z.string().uuid(),
});

export const createMessageSchema = z.object({
  content: z.string().min(1),
});

export const createNoteSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

export const updateNoteSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
});

export const inviteUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "COLLAB"]),
});

export const acceptInviteSchema = z
  .object({
    fullName: z.string().min(1),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contrasenas no coinciden.",
  });

export const uuidParamSchema = z.string().uuid("ID invalido");
