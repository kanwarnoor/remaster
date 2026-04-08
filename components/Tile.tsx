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
  index?: number;
  upload?: boolean;
}

export default function Tile({
  title,
  artist,
  art,
  link,
  upload,
  index,
}: Props) {
  const router = useRouter();
  const handleClick = () => {
    if (link) {
      router.push(link);
    }
  };
  return !upload ? (
    <div className="flex flex-col w-[200px]">
      <div onClick={handleClick}>
        <motion.div
          initial={{ opacity: 0, filter: "blur(20px)" }}
          animate={{
            opacity: 1,
            filter: "blur(0px)",
          }}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
            delay: 0.3 * (index ? index / 10 : 0),
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
            delay: 0.3 * (index ? index / 10 : 0),
          }}
          className="w-full cursor-pointer mt-2"
        >
          <p className="font-bold text-lg leading-none text-ellipsis overflow-hidden whitespace-nowrap w-full">
            {title}
          </p>
          <p className="font-bold text-base leading-tight text-white/50 text-ellipsis overflow-hidden whitespace-nowrap w-full">
            {artist}
          </p>
        </motion.div>
      </div>
    </div>
  ) : (
    <div className="flex flex-col rounded">
      <div className="" onClick={handleClick}>
        <div className="w-[200px] h-[200px] bg-[#141414] rounded justify-center hover:bg-white/80 transition-all duration-100 group items-center flex cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="size-10 group-hover:stroke-black transition-all duration-300"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>

          {/* <Image
            src={art || "/music.jpg"}
            alt={"art"}
            height={0}
            width={0}
            sizes="100% 100%"
            className="w-full h-full rounded"
          /> */}
        </div>
      </div>
    </div>
  );
}
