export type FileCategory = "image" | "audio" | "document" | "video" | "other";

export interface UploadResponse {
  url: string;
  key: string;
  name: string;
  size: number;
  mimeType: string;
  category?: FileCategory;
}

export interface TempUploadResponse {
  tempKey: string;
  url: string;
}

const getApiUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (process.env.NODE_ENV !== "production") {
    if (typeof window !== "undefined") {
      return window.location.port === "3000" ? "http://localhost:5050" : "";
    }
    return "http://localhost:5050";
  }
  return "";
};

export async function uploadFile(
  file: File,
  folder: string = "uploads",
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${getApiUrl()}/upload?folder=${encodeURIComponent(folder)}`, {
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

export async function uploadTempFile(
  file: File,
): Promise<TempUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${getApiUrl()}/upload/temp`, {
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

