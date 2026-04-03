export type UploadParams = {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
};

export interface ObjectStorage {
  putObject(params: UploadParams): Promise<{ key: string; publicUrl?: string }>;
  deleteObject(key: string): Promise<void>;
  getPublicUrl(key: string): string;
}
