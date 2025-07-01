"use client";

import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Tile from "./Tile";

interface Props {
  title: string;
  data: {
    tracks: any;
  };
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
    if (emblaApi) emblaApi.scrollNext();
  };

  const scrollPrev = () => {
    if (emblaApi) emblaApi.scrollPrev();
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

  if (data.tracks == null || data?.tracks.length === 0) {
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

  return (
    <>
      <p className="text-3xl font-bold mb-5">{title}</p>
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-5">
            {data.tracks.map((track: any, index: number) => {
              const type = track.album == null ? "single/" : "album/";
              return (
                <div key={track._id} className="flex-[0_0_200px]">
                  <Tile
                    title={track.name}
                    artist={track.artist}
                    art={
                      track.image
                        ? `https://remaster-storage.s3.ap-south-1.amazonaws.com/images/track/${track.image}`
                        : "/music.jpg"
                    }
                    link={type + track._id}
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

        {data.tracks.length > 5 && (
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
