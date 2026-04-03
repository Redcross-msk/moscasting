import type { ObjectStorage, UploadParams } from "./types";

/**
 * MVP: заглушка под S3-совместимое хранилище (YC Object Storage, MinIO).
 * В проде подключите реализацию через @aws-sdk/client-s3.
 */
export class LocalPlaceholderStorage implements ObjectStorage {
  constructor(private readonly baseUrl: string) {}

  async putObject(params: UploadParams): Promise<{ key: string; publicUrl?: string }> {
    return {
      key: params.key,
      publicUrl: `${this.baseUrl.replace(/\/$/, "")}/${params.key}`,
    };
  }

  async deleteObject(_key: string): Promise<void> {
    /* no-op */
  }

  getPublicUrl(key: string): string {
    return `${this.baseUrl.replace(/\/$/, "")}/${key}`;
  }
}

export function createStorageFromEnv(): ObjectStorage {
  const base = process.env.S3_PUBLIC_BASE_URL?.trim() || "https://storage.local/placeholder";
  return new LocalPlaceholderStorage(base);
}
