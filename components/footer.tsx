"use client";

import { motion } from "framer-motion";
import React from "react";

export default function footer() {
  return (
    <div className="w-screen h-[50vh] flex flex-col bg-remaster/50 mt-auto items-center justify-center">
      <div className=" font-bold remaster text-center flex flex-row gap-1">
        {["R", "E", "M", "A", "S", "T", "E", "R"].map((letter, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{
              ease: "easeInOut",
              duration: 1,
              delay: (index + 1) * 0.1,
            }}
            viewport={{ once: true }}
            exit={{ opacity: 0 }}
            className="text-9xl font-bold remaster"
          >
            {letter}
          </motion.div>
        ))}
      </div>
      <p>
        Developed by{" "}
        <motion.a
          href="https://www.kanwarnoor.com/"
          className="underline"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            ease: "easeInOut",
            duration: 1,
            delay: 0.5,
          }}
        >
          Kanwarnoor
        </motion.a>
      </p>
    </div>
  );
}
