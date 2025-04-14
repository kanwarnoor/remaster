"use client";

import React from "react";
import Tile from "./Tile";

interface Props {
  title: string;
  data: any;
  deleteTrack: (id: string) => void;
  isLoading?: boolean;
  isError?: boolean;
  error?: any;
  currentUser?: any;
  type?: string;
  setCurrentUser?: (user: any) => void;
}

export default function TracksList({
  title,
  data,
  isLoading,
  type,
  isError,
  deleteTrack
}: Props) {
  if (isLoading) {
    return (
      <>
        <p className="text-3xl font-bold mb-5">{title}</p>
        <div className="relative flex-row flex gap-5 pr-20 overflow-x-hidden mb-[2.9rem]">
          <div className="flex flex-col w-[200px] animate-pulse">
            <div className="">
              <div className="w-[200px] h-[200px] bg-[#141414] rounded justify-center items-center flex cursor-pointer"></div>
            </div>
          </div>
          <div className="flex flex-col w-[200px] animate-pulse delay-75">
            <div className="">
              <div className="w-[200px] h-[200px] bg-[#141414] rounded justify-center items-center flex cursor-pointer"></div>
            </div>
          </div>
          <div className="flex flex-col w-[200px] animate-pulse delay-100">
            <div className="">
              <div className="w-[200px] h-[200px] bg-[#141414] rounded justify-center items-center flex cursor-pointer"></div>
            </div>
          </div>
          <div className="flex flex-col w-[200px] animate-pulse delay-150">
            <div className="">
              <div className="w-[200px] h-[200px] bg-[#141414] rounded justify-center items-center flex cursor-pointer"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (data == null || data?.data.length === 0) {
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
      <div className="absolute mt-[180px] mx-20 top-0 right-0 h-[250px] w-[300px] bg-gradient-to-l from-black to-transparent group flex duration-300">
        <svg
          version="1.1"
          id="XMLID_287_"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="-2.4 -2.4 28.80 28.80"
          xmlSpace="preserve"
          stroke="#000000"
          strokeWidth="2.4"
          transform="matrix(1, 0, 0, 1, 0, 0)rotate(0)"
          className="fill-white group-hover:opacity-100  opacity-0 size-12 cursor-pointer bg-white rounded-full pt-3 pl-3 pb-3 pr-2  my-auto ml-auto text-right shadow-xl transotion-all duration-100 hover:scale-105"
        >
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            strokeLinecap="round"
            strokeLinejoin="round"
            stroke="#CCCCCC"
            strokeWidth="0.048"
          ></g>
          <g id="SVGRepo_iconCarrier">
            <g id="next">
              <g>
                <polygon points="6.8,23.7 5.4,22.3 15.7,12 5.4,1.7 6.8,0.3 18.5,12 "></polygon>{" "}
              </g>
            </g>
          </g>
        </svg>
      </div>
      <div className="relative flex-row flex gap-5 pr-20 overflow-x-hidden">
        {data?.data.map((track: any) => {
          const type = track.album == null ? "single/" : "album/";
          return (
            <div key={track._id}>
              <Tile
                title={track.name}
                artist={track.artist}
                art={track.art}
                link={type + track._id}
              />
              <p className="text-remaster text-base cursor-pointer" onClick={() => deleteTrack(track._id)}>delete</p>
            </div>
          );
        })}
      </div>
    </>
  );
}
