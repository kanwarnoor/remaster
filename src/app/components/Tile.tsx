"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Props {
  title: string;
  artist: string;
  art?: string;
  link?: string;
}

export default function Tile({ title, artist, art, link }: Props) {
  const router = useRouter();
  const handleClick = () => {
    if (link) {
      router.push(link);
    }
  };
  return (
    <div className="flex flex-col w-[200px]">
      <div className="" onClick={handleClick}>
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
          className="w-[200px] h-[200px] bg-[#141414] rounded justify-center items-center flex cursor-pointer"
        >
   
            <Image
              src={art || "/music.jpg"}
              alt={"art"}
              height={0}
              width={0}
              sizes="100% 100%"
              className="w-full h-full rounded"
            />
  
        </motion.div>
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
          className="w-fit max-w-full cursor-pointer"
        >
          <p className="font-bold text-lg leading-none mt-2 text-ellipsis overflow-hidden">{title}</p>
          <p className="font-bold text-base leading-tight text-white/50 text-ellipsis overflow-hidden">
            {artist}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
