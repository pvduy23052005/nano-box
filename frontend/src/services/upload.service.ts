export type FileCategory = "image" | "audio" | "document" | "video" | "other";

export interface UploadResponse {
  url: string;
  key: string;
  name: string;
  size: number;
  mimeType: string;
  category?: FileCategory;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

export async function uploadFile(
  file: File,
  folder: string = "uploads",
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/upload?folder=${encodeURIComponent(folder)}`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Upload failed");
  }

  return response.json();
}

export async function uploadMultipleFiles(
  files: File[],
  folder: string = "uploads",
): Promise<UploadResponse[]> {
  return Promise.all(files.map((file) => uploadFile(file, folder)));
}
