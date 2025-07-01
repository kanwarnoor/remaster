import React from "react";

export default function SongPageLoading() {
  return (
    <div className="w-screen min-h-screen pt-10 text-center select-none ">
      <div className="absolute top-0 w-screen -z-10  h-[500px]"></div>

      <div className="h-80 rounded mx-20 mt-10 flex justify-left text-left ">
        <div className="min-w-80 h-80 -z-10 flex w-80">
          <div className="w-80 h-80 bg-neutral-800 rounded-lg animate-pulse"></div>
        </div>
        <div className="w-full">
          <div className="w-full h-[65%] text-ellipsis ml-10  justify-center flex flex-col">
            <div className="text-5xl font-bold text-ellipsis overflow-hidden line-clamp-2 pb-1 bg-neutral-800 rounded-lg animate-pulse w-40 h-12 [animation-delay:100ms]"></div>
            <div className="text-xl font-bold bg-neutral-800 rounded-lg animate-pulse w-20 h-6 mt-2 [animation-delay:200ms]"></div>
          </div>
          <div className="w-[100%] ml-10 h-[35%] flex items-end">
            <div className="flex w-28 h-9 pr-1 justify-center items-center cursor-pointer bg-neutral-800 rounded animate-pulse [animation-delay:300ms]"></div>
          </div>
        </div>
      </div>

      {/* tracklist */}
      <div className="w-full h-fit justify-start flex flex-col gap-5 ">
        <div
          className="flex mt-10 mx-20 h-14 rounded-lg bg-neutral-800 animate-pulse [animation-delay:400ms]"
          // onDoubleClick={() => props.handleSong("reset")}
        ></div>
     
     

        <div className="flex mt-10 text-base  text-white mx-20 select-text">
          <p>{}</p>
        </div>
      </div>
    </div>
  );
}
