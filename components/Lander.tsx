import React from "react";
import Image from "next/image";

export default function Lander() {
  return (
    <div className="w-screen relative h-[500px] bg-remaster/50 flex flex-col items-center justify-center ">
      <div className="w-full h-full m-6 flex items-center justify-center flex-col">
        <Image
          src="/remaster1.webp"
          alt="remaster"
          width={0}
          height={0}
          sizes="100% 100%"
          className="w-full h-full  object-cover object-[10%_15%]"
        />
        <div className="absolute left-0 pt-3 bottom-0 right-0 top-0 justify-center items-center flex flex-col">
          <p className="font-bold text-black remaster text-9xl -tracking-wide  ">
            OWN YOUR <u>MUSIC</u>
          </p>
        </div>
      </div>
    </div>
  );
}
