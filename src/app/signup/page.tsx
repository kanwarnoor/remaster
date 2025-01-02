import React from "react";
import Image from "next/image";
import Signup from "../components/Signup";

export default function Page() {
  return (
    <div className="grid grid-cols-2 max-h-screen">
      <div className="w-full bg-white/50 flex items-center justify-center text-black">
        <Image src={"/login:signup/sideimage.jpg"} height={0} width={0} sizes="100% 100%" className="w-full h-screen object-cover" alt={""}></Image>
      </div>
      <Signup />
    </div>
  );
}
