import React from "react";
import Image from "next/image";

export default function Lander() {
  return (
    <div className="w-screen relative h-[500px] bg-remaster/50 flex flex-col items-center justify-center">
      <div className="w-full h-full m-6 flex items-center justify-center flex-col">
        <Image
          src="/remaster.jpg"
          alt="remaster"
          width={0}
          height={0}
          sizes="100% 100%"
          className="w-full p-16 h-full object-cover"
        />
        <div className="absolute left-0 pl-[58.5px] bottom-0 justify-center items-center flex flex-col">
          <p className=" font-bold text-white remaster text-9xl">
            own your MASTER
          </p>
        
        </div>
      </div>
    </div>
  );
}
