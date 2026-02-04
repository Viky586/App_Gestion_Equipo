import { createSupabaseAdminClient, createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { SupabaseProjectRepository } from "@/infrastructure/repositories/SupabaseProjectRepository";
import { SupabaseProjectMemberRepository } from "@/infrastructure/repositories/SupabaseProjectMemberRepository";
import { SupabaseUserRepository } from "@/infrastructure/repositories/SupabaseUserRepository";
import { SupabaseMessageRepository } from "@/infrastructure/repositories/SupabaseMessageRepository";
import { SupabaseNoteRepository } from "@/infrastructure/repositories/SupabaseNoteRepository";
import { SupabaseDocumentRepository } from "@/infrastructure/repositories/SupabaseDocumentRepository";
import { SupabasePersonalNoteRepository } from "@/infrastructure/repositories/SupabasePersonalNoteRepository";
import { SupabaseTaskRepository } from "@/infrastructure/repositories/SupabaseTaskRepository";
import { SupabaseStorageService } from "@/infrastructure/storage/SupabaseStorageService";
import { SupabaseAuthAdminService } from "@/infrastructure/supabase/SupabaseAuthAdminService";

export async function createRequestDependencies() {
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();
  const bucket =
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "project-documents";

  return {
    supabase,
    repos: {
      projects: new SupabaseProjectRepository(supabase),
      members: new SupabaseProjectMemberRepository(supabase),
      users: new SupabaseUserRepository(supabase),
      messages: new SupabaseMessageRepository(supabase),
      notes: new SupabaseNoteRepository(supabase),
      documents: new SupabaseDocumentRepository(supabase),
      personalNotes: new SupabasePersonalNoteRepository(supabase),
      tasks: new SupabaseTaskRepository(supabase),
    },
    services: {
      storage: new SupabaseStorageService(supabase, bucket),
      authAdmin: new SupabaseAuthAdminService(admin),
    },
  };
}
