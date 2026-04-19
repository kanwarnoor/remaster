"use client";

import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Tile from "./Tile";
import Link from "next/link";

interface Track {
  default: boolean;
  price: number;
  id: string;
  name: string;
  artist: string;
  image: string;
  link: string;
  size: number;
  duration: number;
  audio: string;
}

interface User {
  id: string;
  username: string;
}

interface Props {
  title: string;
  data: {
    tracks: Track[];
  };
  deleteTrack?: (id: string) => void;
  isLoading?: boolean;
  isError?: boolean;
  error?: string;
  currentUser?: User;
  type?: string;
  setCurrentUser?: (user: User) => void;
  upload?: boolean;
  link?: string;
}

export default function TracksList({
  title,
  data,
  isLoading,
  type,
  isError,
  link,
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
        <p className="text-2xl md:text-3xl font-bold mb-5">{title}</p>
        <div className="relative flex-row flex gap-3 md:gap-5 pr-5 md:pr-20 overflow-hidden">
          {[50, 100, 150, 200].map((delay, index) => {
            return (
              <div className="flex flex-col w-[140px] sm:w-[170px] md:w-[200px] shrink-0" key={index}>
                <div className="">
                  <div className="w-[140px] h-[140px] sm:w-[170px] sm:h-[170px] md:w-[200px] md:h-[200px] bg-[#3d3d3d] rounded justify-center items-center flex cursor-pointer animate-pulse"></div>
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
        <p className="text-2xl md:text-3xl font-bold mb-5">{title}</p>
        <div className="w-full flex flex-col">
          <p className="text-base md:text-lg text-white/50">
            {type === "user" ? "Upload a track!" : "No tracks found!"}
          </p>
        </div>
      </>
    );
  }

  const items = data.tracks ? data.tracks : data;

  return (
    <>
      <div className="flex justify-between items-top h-full  ">
        <p className="text-2xl md:text-3xl font-bold mb-5">{title}</p>
        {link && (
          <Link
            href={link || "/"}
            className="text-sm mt-2 hover:underline text-white/50 hover:text-white transition-all duration-300"
          >
            View more
          </Link>
        )}
      </div>

      <div className="relative">
        <div className="overflow-hidden py-3 -my-3" ref={emblaRef}>
          <div className="flex gap-3 md:gap-5">
            {(data.tracks ?? []).map((item: Track, index: number) => {
              const trackType =
                type === "album"
                  ? "album/"
                  : type === "playlist"
                    ? "playlist/"
                    : "single/";

              return (
                <div key={item.id + index} className="flex-[0_0_140px] sm:flex-[0_0_170px] md:flex-[0_0_200px] transition-all duration-300">
                  <Tile
                    title={item.name}
                    artist={item.artist}
                    art={
                      item.image
                        ? `https://remaster-storage.s3.ap-south-1.amazonaws.com/images/${type === "album" ? "track" : type === "playlist" ? "playlist" : "track"}/${item.image}`
                        : "/music.jpg"
                    }
                    link={
                      (item?.price
                        ? "/album/"
                        : item?.default
                          ? "/playlist/"
                          : "/single/") + item.id
                    }
                    price={type !== "album" ? item?.price : undefined}
                  />
                </div>
              );
            })}
            {upload && (
              <div className="flex-[0_0_140px] sm:flex-[0_0_170px] md:flex-[0_0_200px]">
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

        {(data.tracks?.length ?? 0) > 5 && (
          <>
            <div className="hidden md:flex absolute top-0 -right-5 h-[105%] w-[100px] bg-gradient-to-l from-black to-transparent z-10 items-center justify-end group">
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
            <div className="hidden md:flex absolute top-0 -left-5 h-full w-[50px] bg-gradient-to-r from-black to-transparent z-10 items-center justify-start group">
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
