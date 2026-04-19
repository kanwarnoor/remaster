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
  price?: number;
}

export default function Tile({
  title,
  artist,
  art,
  link,
  upload,
  price,
  index,
}: Props) {
  const router = useRouter();
  const handleClick = () => {
    if (link) {
      router.push(link);
    }
  };
  return !upload ? (
    <div className="flex flex-col w-[140px] sm:w-[170px] md:w-[200px]">
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
          className="w-[140px] h-[140px] sm:w-[170px] sm:h-[170px] md:w-[200px] md:h-[200px] bg-[#141414] rounded justify-center items-center flex cursor-pointer relative overflow-hidden"
        >
          {price && (
            <div className="w-full absolute h-full rounded ">
              <p className="text-white w-full text-center text-2xl md:text-3xl font-bold absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30  p-2 rounded">
                ₹{(price / 100).toLocaleString()}
              </p>
              <Image
                src={"/cover2.jpg"}
                alt={"art"}
                height={0}
                width={0}
                sizes="100% 100%"
                className="w-full absolute h-full rounded opacity-50 brightness-100 z-10"
              />
            </div>
          )}
          <Image
            src={art || "/music.jpg"}
            alt={"art"}
            height={0}
            width={0}
            sizes="100% 100%"
            className={`w-full h-full rounded opacity-100  ${price ? "brightness-150" : ""}`}
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
          <p className="font-bold text-base md:text-lg leading-none text-ellipsis overflow-hidden whitespace-nowrap w-full">
            {title}
          </p>
          <p className="font-bold text-sm md:text-base leading-tight text-white/50 text-ellipsis overflow-hidden whitespace-nowrap w-full">
            {artist}
          </p>
        </motion.div>
      </div>
    </div>
  ) : (
    <div className="flex flex-col rounded">
      <div className="" onClick={handleClick}>
        <div className="w-[140px] h-[140px] sm:w-[170px] sm:h-[170px] md:w-[200px] md:h-[200px] bg-[#141414] rounded justify-center hover:bg-white/80 transition-all duration-100 group items-center flex cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="size-8 md:size-10 group-hover:stroke-black transition-all duration-300"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
