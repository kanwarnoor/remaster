import React from "react";
import Image from "next/image";

export default function Lander() {
  return (
    <div className="w-screen h-[500px] bg-remaster/50 flex flex-col items-center justify-center">
      <div className="w-full h-full m-6 flex items-center justify-center">
        <Image
          src="/remaster.jpg"
          alt="remaster"
          width={0}
          height={0}
          sizes="100% 100%"
          className="w-full p-14 h-full object-cover"
        />
      </div>
    </div>
  );
}
