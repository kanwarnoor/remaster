"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Notification from "@/app/components/Notification";
import InsideNavbar from "../components/InsideNavbar";
import { parseBlob } from "music-metadata";
import { useRouter } from "next/navigation";

export default function FileUpload() {
  const router = useRouter();
  const [popup, setPopup] = useState<{
    show: boolean;
    message: string;
    type: "error" | "success" | "info" | "warning" | "";
  }>({ show: false, message: "", type: "" });
  const [loading, setLoading] = useState(false);

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

        const response = await axios.post("api/upload/init", {
          type: file.type,
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

        const { url, name } = response.data;
        const upload = await axios.put(url, file, {
          headers: {
            "Content-Type": file.type,
          },
        });

        if (upload.status !== 200) {
          setPopup({
            show: true,
            message: upload.data.error,
            type: "error",
          });
          setLoading(false);
          return;
        }

        const metadata = await parseBlob(file);

        const save = await axios.post("api/upload/complete", {
          name,
          type: file.type,
          fileName: file.name,
          metadata,
          size: file.size,
        });

        if (save.status === 200) {
          setPopup({
            show: true,
            message: "File uploaded successfully!",
            type: "success",
          });
        }
        setLoading(false);
        router.push("/");
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
              <p className="font-bold remaster text-5xl">Loading...</p>
            </div>
          ) : (
            <p className="font-bold remaster text-5xl">
              DROP IT LIKE IT'S HOT🔥
            </p>
          )}

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
