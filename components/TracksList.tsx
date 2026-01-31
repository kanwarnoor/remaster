"use client";

import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Tile from "./Tile";

interface Props {
  title: string;
  data: any;
  deleteTrack?: (id: string) => void;
  isLoading?: boolean;
  isError?: boolean;
  error?: any;
  currentUser?: any;
  type?: string;
  setCurrentUser?: (user: any) => void;
  upload?: boolean;
}

export default function TracksList({
  title,
  data,
  isLoading,
  type,
  isError,
  upload,
  deleteTrack,
}: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    skipSnaps: false,
    dragFree: true,
  });

  const scrollNext = () => {
    if (emblaApi) emblaApi.scrollTo(4);
  };

  const scrollPrev = () => {
    if (emblaApi) emblaApi.scrollTo(-4);
  };

  if (isLoading) {
    return (
      <>
        <p className="text-3xl font-bold mb-5">{title}</p>
        <div className="relative flex-row flex gap-5 pr-20 overflow-x-hidden ">
          {[50, 100, 150, 200].map((delay, index) => {
            return (
              <div className="flex flex-col w-[200px] " key={index}>
                <div className="">
                  <div className="w-[200px] h-[200px] bg-[#3d3d3d] rounded justify-center items-center flex cursor-pointer animate-pulse"></div>
                  <div className="w-[70%] h-[15px] bg-[#3d3d3d] mt-2 animate-pulse"></div>
                  <div className="w-1/2 h-[15px] bg-[#3d3d3d] mt-2 animate-pulse"></div>
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  }

  if (data == null) {
    return (
      <>
        <p className="text-3xl font-bold mb-5">{title}</p>
        <div className="w-screen flex flex-col">
          <p className="text-lg text-white/50">
            {type === "user" ? "Upload a track!" : "No tracks found!"}
          </p>
        </div>
      </>
    );
  }

  const items = data.tracks ? data.tracks : data;

  return (
    <>
      <p className="text-3xl font-bold mb-5">{title}</p>
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-5">
            {items.map((item: any) => {
              const trackType = type === "album" ? "album/" : "single/";

              return (
                <div key={item._id} className="flex-[0_0_200px]">
                  <Tile
                    title={item.name}
                    artist={item.artist}
                    art={
                      item.image
                        ? `https://remaster-storage.s3.ap-south-1.amazonaws.com/images/track/${item.image}`
                        : "/music.jpg"
                    }
                    link={trackType + item._id}
                  />
                </div>
              );
            })}
            {upload && (
              <div className="flex-[0_0_200px]">
                <Tile
                  title="sample"
                  artist="sample"
                  link="/upload"
                  upload={upload}
                />
              </div>
            )}
          </div>
        </div>

        {items.length > 5 && (
          <>
            <div className="absolute top-0 -right-5 h-full w-[100px] bg-gradient-to-l from-black to-transparent z-10 flex items-center justify-end group">
              <button
                onClick={scrollNext}
                className="fill-white opacity-0 group-hover:opacity-100 size-12 cursor-pointer bg-white rounded-full p-3 shadow-xl transition-all duration-100 hover:scale-105"
              >
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="-2.4 -2.4 28.80 28.80"
                  stroke="#000000"
                  strokeWidth="2.4"
                  className="pl-1"
                >
                  <g>
                    <polygon points="6.8,23.7 5.4,22.3 15.7,12 5.4,1.7 6.8,0.3 18.5,12"></polygon>
                  </g>
                </svg>
              </button>
            </div>
            <div className="absolute top-0 -left-5 h-full w-[100px] bg-gradient-to-r from-black to-transparent z-10 flex items-center justify-start group">
              <button
                onClick={scrollPrev}
                className="fill-white opacity-0 group-hover:opacity-100 size-12 cursor-pointer bg-white rounded-full p-3 shadow-xl transition-all duration-100 hover:scale-105 rotate-180"
              >
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="-2.4 -2.4 28.80 28.80"
                  stroke="#000000"
                  strokeWidth="2.4"
                  className="pl-1"
                >
                  <g>
                    <polygon points="6.8,23.7 5.4,22.3 15.7,12 5.4,1.7 6.8,0.3 18.5,12"></polygon>
                  </g>
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
