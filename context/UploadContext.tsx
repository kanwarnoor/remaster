"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";
import { parseBlob } from "music-metadata";
import mime from "mime";
import {
  UploadToastStack,
  type UploadEntry,
} from "@/components/Notification";

interface UploadContextType {
  uploads: Record<string, UploadEntry>;
  uploading: boolean;
  activeCount: number;
  handleFiles: (files: FileList | null) => Promise<void>;
  hideUpload: (id: string) => void;
}

const UploadContext = createContext<UploadContextType | null>(null);

export function useUpload() {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error("useUpload must be used within UploadProvider");
  return ctx;
}

async function uploadSingleFile(
  file: File,
  onProgress: (progress: number) => void,
): Promise<void> {
  const contentType =
    file.type || mime.getType(file.name) || "application/octet-stream";

  const initRes = await axios.post("/api/upload/init", {
    type: contentType,
    size: file.size,
  });

  if (initRes.status !== 200) {
    throw new Error(initRes.data.error || "Failed to init upload");
  }

  const { urls, uploadId, key } = initRes.data;

  const chunkSize = 5 * 1024 * 1024;
  const uploadResult: { ETag: string; PartNumber: number }[] = [];
  const totalChunks = Math.ceil(file.size / chunkSize);
  let chunksUploaded = 0;

  const chunkPromises = [];

  for (let partNumber = 1; partNumber <= urls.length; partNumber++) {
    const start = (partNumber - 1) * chunkSize;
    const end = Math.min(partNumber * chunkSize, file.size);
    const chunk = file.slice(start, end);

    const presignedUrl = urls.find(
      (u: { partNumber: number }) => u.partNumber == partNumber,
    )?.url;

    if (!presignedUrl) {
      throw new Error("Missing presigned url for part " + partNumber);
    }

    const chunkPromise = axios
      .put(presignedUrl, chunk, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.progress === 1) {
            chunksUploaded += 1;
          }
          onProgress(Math.round((chunksUploaded / totalChunks) * 100));
        },
      })
      .then((response) => {
        let etag = null;

        if (response.headers.etag) {
          etag = response.headers.etag;
        } else if (response.headers.ETag) {
          etag = response.headers.ETag;
        } else if (typeof response.headers.get === "function") {
          etag = response.headers.get("etag");
        } else {
          Object.keys(response.headers).forEach((k) => {
            if (k.toLowerCase() === "etag") {
              etag = response.headers[k];
            }
          });
        }

        const cleanEtag = etag ? etag.replace(/"/g, "") : null;
        if (!cleanEtag) {
          throw new Error("ETag extraction error for part " + partNumber);
        }

        uploadResult.push({ ETag: cleanEtag, PartNumber: partNumber });
        return response;
      });

    chunkPromises.push(chunkPromise);
  }

  try {
    await Promise.all(chunkPromises);
    uploadResult.sort((a, b) => a.PartNumber - b.PartNumber);

    const metadata = await parseBlob(file);

    const completeRes = await axios.post("/api/upload/complete", {
      uploadId,
      key,
      parts: uploadResult,
      metadata,
      fileName: file.name,
      size: file.size,
      type: contentType,
    });

    if (completeRes.status !== 200) {
      throw new Error("Error completing upload");
    }
  } catch (error) {
    try {
      await axios.post("/api/upload/abort", { uploadId, key });
    } catch {
      // abort failed silently
    }
    throw error;
  }
}

export function UploadProvider({ children }: { children: ReactNode }) {
  const [uploads, setUploads] = useState<Record<string, UploadEntry>>({});

  const updateUpload = useCallback(
    (id: string, partial: Partial<UploadEntry>) => {
      setUploads((prev) => ({
        ...prev,
        [id]: { ...prev[id], ...partial },
      }));
    },
    [],
  );

  const hideUpload = useCallback((id: string) => {
    setUploads((prev) => {
      if (!prev[id]) return prev;
      return { ...prev, [id]: { ...prev[id], visible: false } };
    });
  }, []);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const audioFiles: File[] = [];

      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (
          f.type.startsWith("audio/") ||
          mime.getType(f.name)?.startsWith("audio/")
        ) {
          audioFiles.push(f);
        }
      }

      if (audioFiles.length === 0) return;

      const newEntries: Record<string, UploadEntry> = {};
      const fileMap: { id: string; file: File }[] = [];

      for (const file of audioFiles) {
        const id = crypto.randomUUID();
        newEntries[id] = {
          id,
          fileName: file.name,
          progress: 0,
          status: "uploading",
          visible: true,
        };
        fileMap.push({ id, file });
      }

      setUploads((prev) => ({ ...prev, ...newEntries }));

      const promises = fileMap.map(async ({ id, file }) => {
        try {
          await uploadSingleFile(file, (progress) => {
            updateUpload(id, { progress });
          });
          updateUpload(id, { progress: 100, status: "success" });
        } catch (err) {
          const errorMsg =
            axios.isAxiosError(err) && err.response?.data?.error
              ? err.response.data.error
              : "Upload failed";
          updateUpload(id, { status: "error", error: errorMsg });
        }
      });

      await Promise.allSettled(promises);
    },
    [updateUpload],
  );

  const uploadList = Object.values(uploads);
  const uploading = uploadList.some((u) => u.status === "uploading");
  const activeCount = uploadList.filter(
    (u) => u.status === "uploading",
  ).length;
  const visibleUploads = uploadList.filter((u) => u.visible);

  return (
    <UploadContext.Provider
      value={{ uploads, uploading, activeCount, handleFiles, hideUpload }}
    >
      {children}
      <UploadToastStack uploads={visibleUploads} onDismiss={hideUpload} />
    </UploadContext.Provider>
  );
}
