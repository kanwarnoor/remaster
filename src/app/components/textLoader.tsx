"use client"

import React from "react";
import { motion } from "framer-motion";

export default function TextLoader() {
  return (
    <>
      <div className="w-fit h-fit fixed top-0 bottom-0 right-0 left-0 m-auto text-center justify-center items-center flex remaster text-remaster -z-10">
        {["R", "E", "M", "A", "S", "T", "E", "R"].map((letter, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              ease: "easeInOut",
              duration: 1,
              delay: (index + 1) * 0.1,
              repeat: Infinity,
              repeatType: "mirror",
              repeatDelay: 0,
            }}
            className="text-5xl font-bold"
          >
            {letter}
          </motion.div>
        ))}
      </div>
    </>
  );
}
