import React from "react";
import {motion} from "framer-motion"

interface Props {
  click: () => void;
}

export default function Upload({click}: Props) {
  return (
    <motion.div initial={{
      scale: 0.8
    }}
    animate={{
      scale:1,
    }}
    whileTap={{
      scale:1.2,
    }}
     className="bg-[#141414] w-fit h-fit p-10 rounded-xl cursor-pointer" onClick={click}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="white"
        viewBox="0 0 24 24"
        strokeWidth="3"
        stroke="white"
        className="size-10"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4.5v15m7.5-7.5h-15"
        />
      </svg>
 
    </motion.div>
  );
}
