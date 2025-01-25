import React from "react";
import { motion } from "framer-motion";

export default function Tile() {
  return (
    <div className="w-screen h-screen pt-[3.7rem] px-5">
      <div className="p-5">
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
        >
          <div className="remaster-spinner w-8 h-8"></div>
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
        >
          <p className="font-bold text-lg leading-none mt-2">
            Mai Javan Kithe?
          </p>
          <p className="font-bold text-base leading-tight text-white/50">
            Kanwarnoor
          </p>
        </motion.div>
      </div>
    </div>
  );
}
