import React from "react";

export default function SongPageLoading() {
  return (
    <div className="w-screen min-h-screen pt-10 text-center select-none ">
      <div className="absolute top-0 w-screen -z-10  h-[500px]"></div>

      <div className="rounded mx-5 md:mx-20 mt-4 md:mt-10 flex flex-col md:flex-row md:h-80 justify-left text-left gap-5 md:gap-0">
        <div className="w-48 h-48 sm:w-64 sm:h-64 md:min-w-80 md:h-80 md:w-80 -z-10 flex mx-auto md:mx-0">
          <div className="w-full h-full bg-neutral-800 rounded-lg animate-pulse"></div>
        </div>
        <div className="w-full flex flex-col md:h-full">
          <div className="w-full md:h-[65%] text-ellipsis md:ml-10 justify-center flex flex-col">
            <div className="text-3xl md:text-5xl font-bold text-ellipsis overflow-hidden line-clamp-2 pb-1 bg-neutral-800 rounded-lg animate-pulse w-40 h-10 md:h-12 [animation-delay:100ms]"></div>
            <div className="text-lg md:text-xl font-bold bg-neutral-800 rounded-lg animate-pulse w-20 h-5 md:h-6 mt-2 [animation-delay:200ms]"></div>
          </div>
          <div className="w-[100%] md:ml-10 md:h-[35%] flex items-end mt-4 md:mt-0">
            <div className="flex w-28 h-9 pr-1 justify-center items-center cursor-pointer bg-neutral-800 rounded animate-pulse [animation-delay:300ms]"></div>
          </div>
        </div>
      </div>

      {/* tracklist */}
      <div className="w-full h-fit justify-start flex flex-col gap-5 ">
        <div
          className="flex mt-6 md:mt-10 mx-5 md:mx-20 h-14 rounded-lg bg-neutral-800 animate-pulse [animation-delay:400ms]"
        ></div>
     
     

        <div className="flex mt-6 md:mt-10 text-base  text-white mx-5 md:mx-20 select-text">
          <p>{}</p>
        </div>
      </div>
    </div>
  );
}
