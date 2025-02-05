"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import cookies from "js-cookie";

export default function FileUpload() {
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("File found: " + file.name);
      if (!file.type.startsWith("audio/")) {
        console.log("Please select an audio file!");
        return;
      }

      try {
        const token = cookies.get("token");
        if (!token) {
          console.log("Please login to upload files");
          return;
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post("api/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`,
          },
        });

        if(response.status === 200){
          console.log("File uploaded successfully");
        }
        else{
          console.log("Failed to upload file");
        }
      } catch (err) {
        console.log(err);
        console.log("Failed to upload file");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen">
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
          onChange={handleFileChange}
          className="absolute inset-16 opacity-0"
        />
      </motion.div>

      {/* {file && <p className="mt-4 text-center">{file.name}</p>} */}
    </div>
  );
}
