import React from "react";
import Image from "next/image";

export default function Lander() {
  return (
    <div className="w-screen relative h-[500px] bg-remaster/50 flex flex-col items-center justify-center">
      <div className="w-full h-full m-6 flex items-center justify-center flex-col">
        <Image
          src="/remaster1.jpg"
          alt="remaster"
          width={0}
          height={0}
          sizes="100% 100%"
          className="w-full py-16 px-5 h-full object-cover object-[10%_10%]"
        />
        <div className="absolute left-0 pt-3 bottom-0 right-0 top-0 justify-center items-center flex flex-col">
          <p className="font-bold text-black remaster text-9xl -tracking-wider  ">
            OWN YOUR <u>MUSIC</u>
          </p>
        </div>
      </div>
    </div>
  );
}
