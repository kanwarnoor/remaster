"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Notification from "@/components/Notification";
import Navbar from "@/components/Navbar";
import { useUpload } from "@/context/UploadContext";
import mime from "mime";

export default function FileUpload() {
  const { uploading, activeCount, handleFiles } = useUpload();
  const [popup, setPopup] = useState<{
    show: boolean;
    message: string;
    type: "error" | "success" | "info" | "warning" | "";
  }>({ show: false, message: "", type: "" });

  const showPopup = useCallback(
    (message: string, type: "error" | "success" | "info" | "warning") => {
      setPopup({ show: true, message, type });
      setTimeout(
        () => setPopup({ show: false, message: "", type: "" }),
        5000,
      );
    },
    [],
  );

  const onFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      let skipped = 0;
      let hasAudio = false;

      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (
          f.type.startsWith("audio/") ||
          mime.getType(f.name)?.startsWith("audio/")
        ) {
          hasAudio = true;
        } else {
          skipped++;
        }
      }

      if (skipped > 0) {
        showPopup(
          `${skipped} non-audio file${skipped > 1 ? "s" : ""} skipped`,
          "warning",
        );
      }

      if (!hasAudio && skipped === 0) {
        showPopup("Please select audio files!", "error");
      }

      handleFiles(files);
    },
    [handleFiles, showPopup],
  );

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onFiles(e.dataTransfer?.files);
  };

  return (
    <>
      <Navbar />
      <AnimatePresence>
        {popup.show && (
          <Notification message={popup.message} type={popup.type} />
        )}
      </AnimatePresence>
      <div className="flex flex-col items-center justify-center min-h-screen w-screen overflow-hidden px-4 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className=" font-bold text-white/50"
        >
          {uploading
            ? "dropping the heat, please wait!"
            : "drag and drop your audio files here"}{" "}
          <br />
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`relative border-2 w-[90vw] max-w-[500px] rounded-2xl md:rounded-full flex flex-col items-center justify-center cursor-pointer border-white/50 p-6 md:p-10 border-dashed mt-4 ${
            uploading && "upload"
          }`}
        >
          {uploading ? (
            <div className="flex gap-2 items-center">
              <div className="w-8 h-8 md:w-10 md:h-10 remaster-spinner"></div>
              <p className="font-bold remaster text-2xl md:text-5xl">
                Uploading {activeCount} file{activeCount !== 1 ? "s" : ""}
              </p>
            </div>
          ) : (
            <p className="font-bold remaster text-2xl md:text-5xl">
              DROP IT LIKE IT&apos;S HOT🔥
            </p>
          )}

          <input
            type="file"
            accept="audio/*"
            multiple
            onChange={(e) => onFiles(e.target.files)}
            onDrop={handleFileDrop}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </motion.div>
      </div>
    </>
  );
}
