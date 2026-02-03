export interface StorageService {
  upload(
    path: string,
    file: ArrayBuffer,
    options: { contentType: string }
  ): Promise<void>;
  createSignedUrl(path: string, expiresInSeconds: number): Promise<string>;
  remove(path: string): Promise<void>;
}
