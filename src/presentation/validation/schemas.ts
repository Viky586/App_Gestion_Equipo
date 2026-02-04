import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
  description: z.string().optional().nullable(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1, "El nombre no puede estar vacio.").optional(),
  description: z.string().optional().nullable(),
});

export const assignUserSchema = z.object({
  userId: z.string().uuid("Usuario invalido."),
});

export const createMessageSchema = z.object({
  content: z.string().min(1, "El mensaje es obligatorio."),
});

export const createNoteSchema = z.object({
  title: z.string().min(1, "El titulo es obligatorio."),
  content: z.string().min(1, "El contenido es obligatorio."),
});

export const updateNoteSchema = z.object({
  title: z.string().min(1, "El titulo es obligatorio.").optional(),
  content: z.string().min(1, "El contenido es obligatorio.").optional(),
});

export const inviteUserSchema = z.object({
  email: z.string().email("Email invalido."),
  role: z.enum(["ADMIN", "COLLAB"]),
});

export const acceptInviteSchema = z
  .object({
    fullName: z.string().min(1, "El nombre es obligatorio."),
    password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres."),
    confirmPassword: z
      .string()
      .min(8, "La contrasena debe tener al menos 8 caracteres."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contrasenas no coinciden.",
  });

export const uuidParamSchema = z.string().uuid("ID invalido");
