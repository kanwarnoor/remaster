"use client";

import { motion } from "framer-motion";

export default function Lander() {
  return (
    <div className="w-screen relative h-[55vh] sm:h-[65vh] md:h-[70vh] flex flex-col items-center justify-center ">
      <div className="w-full h-full m-2 sm:m-4 md:m-6 flex items-center justify-center flex-col">
        <video
          src="/home.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/videos/placeholder.webp"
          className="w-full h-screen object-cover   britness-200 contrast-200 overflow-hidden"
        />
        <div className="absolute left-0 pt-3 bottom-0 right-0 top-0 justify-center items-center flex flex-col px-4">
          <div className="font-bold text-white remaster text-5xl sm:text-7xl md:text-8xl lg:text-9xl -tracking-wide gap-2 sm:gap-3 md:gap-5 flex flex-wrap justify-center">
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
