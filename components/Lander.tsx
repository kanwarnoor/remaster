"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Lander() {
  return (
    <div className="w-screen relative h-[70vh] flex flex-col items-center justify-center ">
      <div className="w-full h-full m-6 flex items-center justify-center flex-col">
        <video
          src="/home.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="true"
          crossOrigin="anonymous"
          poster="/videos/placeholder.webp"
          className="w-full h-full object-cover britness-200 contrast-200  overflow-hidden"
          // onLoadStart={() => setVideoLoaded(false)}
          // onCanPlay={() => setVideoLoaded(true)}
        />
        <div className="absolute left-0 pt-3 bottom-0 right-0 top-0 justify-center items-center flex flex-col">
          <div className="font-bold text-white remaster text-9xl -tracking-wide  gap-5 flex">
            {["OWN", "YOUR", "MUSIC"].map((word, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, filter: "blur(20px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{
                  duration: 1,
                  ease: "easeInOut",
                  delay: (index + 1) * 0.2,
                }}
                className="inline-block gap-2 last:underline"
              >
                {word}
              </motion.p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
