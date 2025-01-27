import React from "react";

export default function loading() {
  return (
    <div className="h-screen w-screen flex flex-row justify-center items-center m-auto">
      <div className="flex flex-row justify-center items-center gap-10">
        {/* first tile */}
        <div className="flex flex-col">
          <div className="">
            <div className="w-[200px] h-[200px] bg-[#141414] rounded justify-center items-center flex animate-pulse"></div>
            <div>
              <p className="font-bold text-lg leading-none mt-2 w-32 h-4 bg-[#141414] animate-pulse" style={{animationDelay: "500ms"}}></p>
              <p className="font-bold text-lg leading-none w-20 mt-1 h-4 bg-[#141414]" style={{animationDelay: "500ms"}}></p>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="">
            <div className="w-[200px] h-[200px] bg-[#141414] rounded justify-center items-center flex animate-pulse"></div>
            <div>
              <p className="font-bold text-lg leading-none mt-2 w-32 h-4 bg-[#141414] animate-pulse" style={{animationDelay: "500ms"}}></p>
              <p className="font-bold text-lg leading-none w-20 mt-1 h-4 bg-[#141414]" style={{animationDelay: "500ms"}}></p>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="">
            <div className="w-[200px] h-[200px] bg-[#141414] rounded justify-center items-center flex animate-pulse"></div>
            <div>
              <p className="font-bold text-lg leading-none mt-2 w-32 h-4 bg-[#141414] animate-pulse" style={{animationDelay: "500ms"}}></p>
              <p className="font-bold text-lg leading-none w-20 mt-1 h-4 bg-[#141414]" style={{animationDelay: "500ms"}}></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
