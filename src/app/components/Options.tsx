import React from "react";
import { motion } from "framer-motion";

interface Props {
  list: {
    name: string;
    icon?: string;
    handleOption?: () => void;
  }[];
}

export default function Options({ list }: Props) {
  return (
    <>
      <motion.div
        initial={{
          opacity: 0,
          y: 25,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
        }}
        transition={{
          duration: 0.2,
        }}
        className="absolute right-10 mt-2 w-48 text-center bg-white/25 backdrop-blur-xl rounded-md shadow-lg z-10"
        key={"option"}
      >
        <ul className="">
          {list.map((option, index) => {
            return (
              <motion.li
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.2,
                  delay: index * 0.1,
                }}
                className="px-4 py-2 hover:bg-white/25 first:rounded-t-md first:pt-3 last:pb-3 last:rounded-b-md cursor-pointer"
                key={index}
                onClick={() => {
                  if (option.handleOption) {
                    option.handleOption();
                  }
                }}
              >
                {option.name}
              </motion.li>
            );
          })}
        </ul>
      </motion.div>
    </>
  );
}
