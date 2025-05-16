"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Notification from "@/app/components/Notification";
import InsideNavbar from "../components/InsideNavbar";
import { parseBlob } from "music-metadata";
import { useRouter } from "next/navigation";
import mime from "mime";

export default function FileUpload() {
  const router = useRouter();
  const [popup, setPopup] = useState<{
    show: boolean;
    message: string;
    type: "error" | "success" | "info" | "warning" | "";
  }>({ show: false, message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPopup({ show: false, message: "", type: "" });
    }, 5000);

    return () => clearTimeout(timer);
  }, [popup]);

  // handle file upload
  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer?.files;
    const file = droppedFiles?.[0] || null;
    setLoading(true);

    if (file) {
      if (!file.type.startsWith("audio/")) {
        setPopup({
          show: true,
          message: "Please select an audio file!",
          type: "error",
        });
        setLoading(false);
        return;
      }

      try {
        const formData = new FormData();
        formData.append("file", file);

        const contentType =
          file.type || mime.getType(file.name) || "application/octet-stream";

        const response = await axios.post("api/upload/init", {
          type: contentType,
          size: file.size,
        });

        if (response.status !== 200) {
          setPopup({
            show: true,
            message: response.data.error,
            type: "error",
          });
          setLoading(false);
          return;
        }

        const { urls, uploadId, key } = response.data;

        const chunkSize = 5 * 1024 * 1024; // 5MB
        const uploadPromises = [];
        const uploadResult: { ETag: any; PartNumber: number }[] = [];
        const totalChunks = Math.ceil(file.size / chunkSize);
        let chunksUploaded = 0;

        for (let partNumber = 1; partNumber <= urls.length; partNumber++) {
          const start = (partNumber - 1) * chunkSize;
          const end = Math.min(partNumber * chunkSize, file.size);
          const chunk = file.slice(start, end);

          const presignedUrl = urls.find(
            (u: any) => u.partNumber == partNumber
          )?.url;

          if (!presignedUrl) {
            console.log("Missing presigned url for part " + partNumber);
            return;
          }

          const uploadPromise = axios
            .put(presignedUrl, chunk, {
              headers: {
                "Content-Type": file.type,
              },
              onUploadProgress: (progressEvent) => {
                // calculate progress
                if (progressEvent.progress === 1) {
                  chunksUploaded += 1;
                }
                const percentage = Math.round(
                  (chunksUploaded / totalChunks) * 100
                );
                // Update progress bar or UI element with the percentage
                setProgress(percentage);
              },
            })
            .then((response) => {
              console.log("Response headers:", response.headers);
              // extract ETag
              let etag = null;

              if (response.headers.etag) {
                etag = response.headers.etag;
              } else if (response.headers.ETag) {
                etag = response.headers.ETag;
              } else if (typeof response.headers.get === "function") {
                etag = response.headers.get("etag");
              } else {
                Object.keys(response.headers).forEach((key) => {
                  if (key.toLowerCase() === "etag") {
                    etag = response.headers[key];
                  }
                });
              }

              console.log(`Part ${partNumber} ETag extracted:`, etag);
              // make sure etag exists
              const cleanEtag = etag ? etag.replace(/"/g, "") : null;

              if (!cleanEtag) {
                console.log(
                  "Error uploading chunk (etag extraction error) " + partNumber
                );
                setLoading(false);
                return;
              }

              uploadResult.push({
                ETag: cleanEtag,
                PartNumber: partNumber,
              });

              return response;
            });

          uploadPromises.push(uploadPromise);
        }

        try {
          // upload in parallel
          await Promise.all(uploadPromises);

          uploadResult.sort((a, b) => a.PartNumber - b.PartNumber);

          const metadata = await parseBlob(file);

          const completeResponse = await axios.post("/api/upload/complete", {
            uploadId,
            key,
            parts: uploadResult,
            metadata,
            fileName: file.name,
            size: file.size,
            type: contentType,
          });

          if (completeResponse.status === 200) {
            setLoading(false);
            setPopup({
              show: true,
              message: "File uploaded successfully!",
              type: "success",
            });
            router.push("/");
          } else {
            throw new Error("Error completing upload");
          }
        } catch (error) {
          console.log("Error uploading file", error);
          setPopup({
            show: true,
            message: "Error uploading file",
            type: "error",
          });

          try {
            await axios.post("/api/upload/abort", {
              uploadId,
              key,
            });
          } catch (error) {
            console.log("Error aborting upload", error);
            setPopup({
              show: true,
              message: "Error aborting upload",
              type: "error",
            });
          }
        }
      } catch (err) {
        console.log(err);
        setPopup({
          show: true,
          message:
            axios.isAxiosError(err) && err.response?.data?.error
              ? err.response.data.error
              : "Failed to upload file",
          type: "error",
        });
        setLoading(false);
      }
    }
  };

  return (
    <>
      <InsideNavbar link={"/"} />
      <AnimatePresence>
        {popup.show && (
          <Notification message={popup.message} type={popup.type} />
        )}
      </AnimatePresence>
      <div className="flex flex-col items-center justify-center h-screen w-screen overflow-hidden ">
        <motion.p
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.3,
            delay: 0.3,
          }}
          className=" font-bold text-white/50"
        >
          {loading
            ? "dropping the heat, please wait!"
            : "drag and drop your audio files here"}{" "}
          <br />
        </motion.p>
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
          }}
          className={`border-2 w-[500px] rounded-full flex flex-col items-center justify-center cursor-pointer border-white/50 p-10 border-dashed ${
            loading && "upload"
          }`}
        >
          {loading ? (
            <div className="flex gap-2">
              <div className="w-10 h-10 remaster-spinner"></div>
              <p className="font-bold remaster text-5xl">
                {progress}% Uploaded{" "}
              </p>
            </div>
          ) : (
            <p className="font-bold remaster text-5xl">
              DROP IT LIKE IT'S HOT🔥
            </p>
          )}

          <input
            type="file"
            accept="audio/*"
            capture
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const dummyEvent = {
                  preventDefault: () => {},
                  dataTransfer: {
                    files: e.target.files,
                  },
                } as React.DragEvent<HTMLDivElement>;
                handleFileDrop(dummyEvent);
              }
            }}
            onDrop={handleFileDrop}
            className="absolute inset-16 opacity-0"
          />
        </motion.div>

        {/* {file && <p className="mt-4 text-center">{file.name}</p>} */}
      </div>
    </>
  );
}
