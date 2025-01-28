"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function FileUpload() {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {};

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
