"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import ColorThief from "colorthief";
import Options from "./Options";

interface Props {
  data: {
    name: string;
    artist: string;
    duration: number;
    art: string;
    timestamps: string[];
    visibility: string;
    user: string;
    createdAt: string;
  };
  audio: {
    url: string;
  };
  user: {
    _id: string;
  };
  playing?: boolean | false;
  toggleVisibility: () => void;
  handleSong: (action: string) => void;
}

const list = [
  {
    name: "Delete",
  },
];

export default function SongPage(props: Props) {
  const [options, setOptions] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const date = new Date(props.data.createdAt);
  const createdAt = `${date.toLocaleString("default", {
    month: "long",
  })} ${date.getDate()}, ${date.getFullYear()}`;
  const [colors, setColors] = useState<[number, number, number][]>([]);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete) {
      getColor();
    } else {
      if (img) {
        img.onload = getColor;
      }
    }

    function getColor() {
      try {
        const colorThief = new ColorThief();
        const palette = colorThief.getPalette(img).slice(0, 5);
        setColors(palette);
      } catch (err) {
        console.error("Color Thief error:", err);
      }
    }
  }, [props.data?.art]);

  function formatTime(seconds: number) {
    seconds = Math.floor(seconds);
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(
        2,
        "0"
      )}`;
    } else {
      return `${mins}:${String(secs).padStart(2, "0")}`;
    }
  }

  return (
    <div className="w-screen min-h-screen pt-10 text-center select-none">
      <div
        className="absolute top-0 w-screen -z-10  h-[500px]"
        style={
          colors.length >= 1
            ? {
                backgroundImage: `linear-gradient(to bottom, 
              rgba(${colors[0].join(",")}, 0.7) 5%,
              rgba(0, 0, 0, 1) 100%, rgb(0, 0, 0) 100%`,
              }
            : {}
        }
      ></div>
      <div className="h-80 rounded mx-20 mt-10 flex justify-left text-left">
        <motion.div
          initial={{ opacity: 0, filter: "blur(20px)" }}
          animate={{
            opacity: 1,
            filter: "blur(0px)",
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="min-w-80 h-80"
        >
          <Image
            src={props.data.art || "/music.jpg"}
            height={0}
            width={0}
            sizes="100% 100%"
            alt=""
            priority
            className="w-80  h-full transition rounded"
          />
          <img
            ref={imgRef}
            src={props.data.art || "/music.jpg"}
            crossOrigin="anonymous"
            style={{ display: "none" }}
            alt="color-thief-img"
          />
        </motion.div>
        <div className="w-full">
          <div className="w-full h-[65%] text-ellipsis ml-10  justify-center flex flex-col">
            {props.user && props.user._id === props.data.user ? (
              <>
                {props.data.visibility === "private" ? (
                  <p
                    className="text-sm font-bold cursor-pointer"
                    onClick={() => props.toggleVisibility()}
                  >
                    Private
                  </p>
                ) : (
                  <p
                    className="text-sm font-bold cursor-pointer"
                    onClick={() => props.toggleVisibility()}
                  >
                    Public
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm h-5 font-bold cursor-pointer "></p>
            )}

            <p className="text-5xl font-bold text-ellipsis overflow-hidden line-clamp-2  pb-1">
              {props.data.name}
            </p>
            <p className="text-lg font-bold ">{props.data.artist}</p>
          </div>
          <div className="w-[100%] ml-10 h-[35%] flex items-end">
            {props.playing ? (
              <div
                className="flex w-28 h-9 justify-center items-center cursor-pointer bg-white/20 rounded hover:bg-white/30"
                onClick={() => {
                  props.handleSong("pause");
                }}
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="white"
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-5 flex"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    <path d="M7 1H2V15H7V1Z"></path>
                    <path d="M14 1H9V15H14V1Z"></path>
                  </g>
                </svg>
                <p className="flex pl-1">Stop</p>
              </div>
            ) : (
              <div
                className="flex w-28 h-9 pr-1 justify-center items-center cursor-pointer bg-white/20 rounded  hover:bg-white/30 "
                onClick={() => {
                  props.handleSong("play");
                }}
              >
                <svg
                  fill="white"
                  viewBox="0 0 32 32"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-7 cursor-pointer flex"
                >
                  <title>play</title>
                  <path d="M5.92 24.096q0 1.088 0.928 1.728 0.512 0.288 1.088 0.288 0.448 0 0.896-0.224l16.16-8.064q0.48-0.256 0.8-0.736t0.288-1.088-0.288-1.056-0.8-0.736l-16.16-8.064q-0.448-0.224-0.896-0.224-0.544 0-1.088 0.288-0.928 0.608-0.928 1.728v16.16z"></path>
                </svg>
                <p className="flex">Play</p>
              </div>
            )}
            <div
              className="justify-end ml-auto mr-10 flex cursor-pointer"
              onClick={() => setOptions(!options)}
            >
              Edit
            </div>
          </div>
          {options && (
            <>
              <div
                className="fixed inset-0 z-0 cursor-pointer"
                onClick={() => setOptions(false)}
              ></div>
              <Options list={list} />
            </>
          )}
        </div>
      </div>

      {/* tracklist */}
      <div className="w-full h-fit justify-start flex flex-col ">
        <div
          className="flex  mt-10 mx-20 h-14 rounded-lg bg-neutral-800 hover:bg-neutral-700 cursor-pointer "
          onDoubleClick={() => props.handleSong("reset")}
        >
          <div className="w-[5%] justify-left items-center flex ml-5 ">
            <svg
              viewBox="0 0 24.00 24.00"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-white size-6"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                {" "}
                <path
                  d="M12 3L14.0357 8.16153C14.2236 8.63799 14.3175 8.87622 14.4614 9.0771C14.5889 9.25516 14.7448 9.41106 14.9229 9.53859C15.1238 9.68245 15.362 9.77641 15.8385 9.96432L21 12L15.8385 14.0357C15.362 14.2236 15.1238 14.3175 14.9229 14.4614C14.7448 14.5889 14.5889 14.7448 14.4614 14.9229C14.3175 15.1238 14.2236 15.362 14.0357 15.8385L12 21L9.96432 15.8385C9.77641 15.362 9.68245 15.1238 9.53859 14.9229C9.41106 14.7448 9.25516 14.5889 9.0771 14.4614C8.87622 14.3175 8.63799 14.2236 8.16153 14.0357L3 12L8.16153 9.96432C8.63799 9.77641 8.87622 9.68245 9.0771 9.53859C9.25516 9.41106 9.41106 9.25516 9.53859 9.0771C9.68245 8.87622 9.77641 8.63799 9.96432 8.16153L12 3Z"
                  strokeWidth="0.9600000000000002"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>{" "}
              </g>
            </svg>
          </div>
          <div className="w-[70%] text-ellipsis overflow-hidden flex items-center ml-2 text-xl font-bold">
            {props.data.name}
          </div>
          <div className=" w-[70%] text-ellipsis overflow-hidden flex items-center ml-2 text-base font-bold">
            {props.data.artist}
          </div>
          <div className=" w-[10%] text-ellipsis overflow-hidden flex items-center ml-2 text-base font-bold justify-end select-all pr-3">
            {formatTime(props.data.duration)}
          </div>
        </div>

        <div className="flex mt-10 text-base  text-white mx-20 select-text">
          <p>{createdAt}</p>
        </div>
      </div>
    </div>
  );
}
