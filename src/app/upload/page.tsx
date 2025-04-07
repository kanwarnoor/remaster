"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { User } from "@/libs/Auth";
import Notification from "@/app/components/Notification";

export default function FileUpload() {
  const [popup, setPopup] = useState<{
    show: boolean;
    message: string;
    type: "error" | "success" | "info" | "warning" | "";
  }>({ show: false, message: "", type: "" });

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
    if (file) {
      console.log("File found: " + file.name);
      if (!file.type.startsWith("audio/")) {
        console.log("Please select an audio file!");
        setPopup({
          show: true,
          message: "Please select an audio file!",
          type: "error",
        });
        return;
      }

      try {
        const decoded = await User();

        if (!decoded) {
          console.log("user not logged in!")
          setPopup({
            show: true,
            message: "Please login to upload files",
            type: "error",
          });
          return;
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post("api/upload", formData);

        if (response.status === 200) {
          console.log("File uploaded successfully");
          setPopup({
            show: true,
            message: "File uploaded successfully",
            type: "success",
          });
        }
      } catch (err) {
        console.log(err);
        setPopup({
          show: true,
          message: "Failed to upload file!",
          type: "error",
        });
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        {popup.show && (
          <Notification message={popup.message} type={popup.type} />
        )}
      </AnimatePresence>
      <div className="flex flex-col items-center justify-center h-screen w-screen overflow-hidden">
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
          upload your audio files here
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
          className="border-2 rounded-full flex flex-col items-center justify-center cursor-pointer border-white/50 p-10 border-dashed"
        >
          <p className="font-bold remaster text-5xl">DROP IT LIKE IT'S HOT🔥</p>

          <input
            type="file"
            accept="audio/*"
            // onChange={handleFileChange}
            onDrop={handleFileDrop}
            className="absolute inset-16 opacity-0"
          />
        </motion.div>

        {/* {file && <p className="mt-4 text-center">{file.name}</p>} */}
      </div>
    </>
  );
}
