import React from "react";

export default function LoadingTile() {
  return (
    <div className="flex flex-col w-[200px] animate-pulse">
      <div className="">
        <div className="w-[200px] h-[200px] bg-[#141414] rounded justify-center items-center flex cursor-pointer"></div>
        <div className="w-fit max-w-full cursor-pointer">
          <p className="font-bold text-lg leading-none mt-2 text-ellipsis overflow-hidden"></p>
          <p className="font-bold text-base leading-tight text-white/50 text-ellipsis overflow-hidden"></p>
        </div>
      </div>
    </div>
  );
}
