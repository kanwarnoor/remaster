"use client"

import React from "react";
import { motion } from "framer-motion";

interface Props {
  title: string;
  artist: string;
}

export default function Tile({ title, artist }: Props) {
  return (
    <div className="flex flex-col">
      <div className="">
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
          className="w-[200px] h-[200px] bg-[#141414] rounded justify-center items-center flex"
        ></motion.div>
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 1,
            delay: 0.3,
          }}
        >
          <p className="font-bold text-lg leading-none mt-2">{title}</p>
          <p className="font-bold text-base leading-tight text-white/50">
            {artist}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
