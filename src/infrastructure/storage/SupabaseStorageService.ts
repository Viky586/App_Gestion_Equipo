import { SupabaseClient } from "@supabase/supabase-js";
import { StorageService } from "@/application/interfaces/StorageService";

export class SupabaseStorageService implements StorageService {
  constructor(
    private readonly client: SupabaseClient,
    private readonly bucket: string
  ) {}

  async upload(
    path: string,
    file: ArrayBuffer,
    options: { contentType: string }
  ) {
    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(path, Buffer.from(file), {
        contentType: options.contentType,
        upsert: false,
      });
    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async createSignedUrl(path: string, expiresInSeconds: number) {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .createSignedUrl(path, expiresInSeconds);
    if (error || !data?.signedUrl) {
      throw new Error(`Failed to create signed URL: ${error?.message ?? ""}`);
    }
    return data.signedUrl;
  }

  async remove(path: string) {
    const { error } = await this.client.storage
      .from(this.bucket)
      .remove([path]);
    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }
}
