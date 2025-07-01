"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { usePlayer } from "@/context/PlayerContext";

import type ReactPlayer from "react-player";
import ReactPlayerComponent from "react-player";

export default function Player() {
  const { data: playerData, setPlaying, playing } = usePlayer();
  const [volume, setVolume] = useState({ value: 1, preValue: 1 });
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(0);
  const playerRef = useRef<typeof ReactPlayer>(null);
  const [progress, setProgress] = useState({
    played: 0, // 0 to 1
    playedSeconds: 0, // in seconds
    loaded: 0,
    loadedSeconds: 0,
  });

  const { data: audio } = useQuery({
    queryKey: ["audio", playerData?.track.audio],
    queryFn: async () => {
      const response = await axios.get(
        `/api/tracks/play?s3key=${playerData?.track.audio}`
      );
      return response.data;
    },
    enabled: !!playerData?.track.audio,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const player = playerRef.current as any;
      if (player) {
        setProgress({
          played: player.currentTime / player.duration,
          playedSeconds: player.currentTime,
          loaded: player.duration,
          loadedSeconds: player.duration,
        });
      }
    }, 1000);
  }, []);

  return (
    <>
      <ReactPlayerComponent
        ref={playerRef as unknown as React.RefObject<HTMLVideoElement>}
        src={audio?.url}
        playing={playing}
        volume={volume.value}
        controls={false}
        loop={repeat !== 0}
      />
      <motion.div
        initial={{
          opacity: 0,
          y: 50,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          y: 50,
        }}
        transition={{
          duration: 0.5,
          ease: "easeInOut",
        }}
        className="fixed bottom-0 left-0 right-0 mb-10 w-[800px] justify-center m-auto items-center h-16 bg-white/80 backdrop-blur-sm text-black rounded-full flex"
      >
        <div className="w-[30%] h-full flex items-center justify-start px-2 rounded-l-full">
          <div className="flex items-center gap-2">
            <Image
              src={
                playerData?.track.image
                  ? `https://remaster-storage.s3.ap-south-1.amazonaws.com/images/track/${playerData?.track.image}`
                  : "/music.jpg"
              }
              alt={playerData?.track.name || "track image"}
              width={100}
              height={100}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="font-medium">{playerData?.track.name}</h3>
              <p className="text-xs text-black">{playerData?.track.artist}</p>
            </div>
          </div>
        </div>
        <div className="relative w-[40%] h-full flex items-center justify-center gap-3">
          <div>
            {/* previous */}
            <div
              className="cursor-pointer mb-2"
              // onClick={() => handleSong("previous")}
            >
              <svg
                viewBox="0 0 24 24"
                className="size-9 fill-black"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 18L5 6M19 6V18L9 12L19 6Z"
                  stroke="#000000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {/* <svg
              viewBox="0 -2 12 12"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              className="fill-black size-9"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <title>previous [#999]</title> <desc>Created with Sketch.</desc>
                <defs> </defs>
                <g id="Page-1" stroke="none" strokeWidth="1" fillRule="evenodd">
                  <g
                    id="Dribbble-Light-Preview"
                    transform="translate(-104.000000, -3805.000000)"
                  >
                    <g id="icons" transform="translate(56.000000, 160.000000)">
                      <path
                        d="M59.9990013,3645.86816 L59.9990013,3652.13116 C59.9990013,3652.84516 58.8540013,3653.25316 58.2180013,3652.82516 L53.9990013,3650.14016 L53.9990013,3652.13116 C53.9990013,3652.84516 53.4260013,3653.25316 52.7900013,3652.82516 L48.4790013,3649.69316 C47.9650013,3649.34616 47.7980013,3648.65316 48.3120013,3648.30616 L52.7900013,3645.17516 C53.4260013,3644.74616 53.9990013,3645.15416 53.9990013,3645.86816 L53.9990013,3647.85916 L58.2180013,3645.17516 C58.8540013,3644.74616 59.9990013,3645.15416 59.9990013,3645.86816"
                        id="previous-[#999]"
                      ></path>
                    </g>
                  </g>
                </g>
              </g>
            </svg> */}
            </div>
          </div>
          {/* play/pause */}
          <div className="w-10 h-10 mb-2">
            {playing ? (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer  border-black"
                onClick={() => setPlaying(playerData?.track.id, false)}
              >
                <svg
                  viewBox="0 0 16 16"
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-7 flex fill-black"
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
              </div>
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer  border-black"
                onClick={() => setPlaying(playerData?.track._id, true)}
              >
                <svg
                  fill="white"
                  viewBox="0 0 32 32"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-10 cursor-pointer flex fill-black ml-1"
                >
                  <title>play</title>
                  <path d="M5.92 24.096q0 1.088 0.928 1.728 0.512 0.288 1.088 0.288 0.448 0 0.896-0.224l16.16-8.064q0.48-0.256 0.8-0.736t0.288-1.088-0.288-1.056-0.8-0.736l-16.16-8.064q-0.448-0.224-0.896-0.224-0.544 0-1.088 0.288-0.928 0.608-0.928 1.728v16.16z"></path>
                </svg>
              </div>
            )}
          </div>
          <div>
            {/* next */}
            <div className="cursor-pointer mb-2">
              <svg
                viewBox="0 0 24 24"
                className="size-9 fill-black rotate-180"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 18L5 6M19 6V18L9 12L19 6Z"
                  stroke="#000000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          {/* progress bar */}
          <div className="absolute w-full bottom-0 left-0 mb-2 rounded-full">
            <div
              className="bg-black/50 h-1 flex justify-end relative cursor-pointer group progress-bar"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percentage = clickX / rect.width;

                const mediaEl = document.querySelector(
                  "audio, video"
                ) as HTMLMediaElement | null;
                if (mediaEl && !isNaN(mediaEl.duration)) {
                  mediaEl.currentTime = percentage * mediaEl.duration;
                }
              }}
            >
              <div
                className="bg-black h-1 w-full absolute left-0 top-0"
                style={{ width: `${progress.played * 100}%` }}
              >
                <div className="bg-black h-3 w-1 absolute right-0 -top-1 group-hover:scale-110 transition-all"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-[30%] h-full flex items-center justify-end gap-2 px-6 rounded-r-full transition-all duration-100 z-10">
          <button
            className={`p-2  rounded-full transition-all duration-100 ${
              shuffle ? "bg-black/10" : ""
            }`}
            onClick={() => setShuffle(!shuffle)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-5"
              viewBox="0 0 24 24"
            >
              <path d="M17 17h-1.559l-9.7-10.673A1 1 0 0 0 5.001 6H2v2h2.559l4.09 4.5-4.09 4.501H2v2h3.001a1 1 0 0 0 .74-.327L10 13.987l4.259 4.686a1 1 0 0 0 .74.327H17v3l5-4-5-4v3z" />
              <path d="M15.441 8H17v3l5-4-5-4v3h-1.559a1 1 0 0 0-.741.327L13.139 8z" />
            </svg>
          </button>
          <button
            className={`p-2 justify-center items-center flex transition-all duration-100 rounded-full ${
              repeat !== 0 ? "bg-black/10" : ""
            }`}
            onClick={() => setRepeat(repeat === 0 ? 1 : repeat === 1 ? 2 : 0)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-5 transition-all duration-100"
              viewBox="0 0 24 24"
            >
              <path d="M12 16c1.671 0 3-1.331 3-3s-1.329-3-3-3-3 1.331-3 3 1.329 3 3 3z" />
              <path d="M20.817 11.186a8.94 8.94 0 0 0-1.355-3.219 9.053 9.053 0 0 0-2.43-2.43 8.95 8.95 0 0 0-3.219-1.355 9.028 9.028 0 0 0-1.838-.18V2L8 5l3.975 3V6.002c.484-.002.968.044 1.435.14a6.961 6.961 0 0 1 2.502 1.053 7.005 7.005 0 0 1 1.892 1.892A6.967 6.967 0 0 1 19 13a7.032 7.032 0 0 1-.55 2.725 7.11 7.11 0 0 1-.644 1.188 7.2 7.2 0 0 1-.858 1.039 7.028 7.028 0 0 1-3.536 1.907 7.13 7.13 0 0 1-2.822 0 6.961 6.961 0 0 1-2.503-1.054 7.002 7.002 0 0 1-1.89-1.89A6.996 6.996 0 0 1 5 13H3a9.02 9.02 0 0 0 1.539 5.034 9.096 9.096 0 0 0 2.428 2.428A8.95 8.95 0 0 0 12 22a9.09 9.09 0 0 0 1.814-.183 9.014 9.014 0 0 0 3.218-1.355 8.886 8.886 0 0 0 1.331-1.099 9.228 9.228 0 0 0 1.1-1.332A8.952 8.952 0 0 0 21 13a9.09 9.09 0 0 0-.183-1.814z" />
            </svg>
            {repeat !== 0 && (
              <span className="text-[12px] text-black ml-1 transition-all duration-100">
                {repeat === 1 ? "Project" : "Song"}
              </span>
            )}
          </button>
          <div className="flex items-center gap-0">
            <button
              className="p-2 hover:bg-black/10 rounded-full"
              onClick={() => {
                setVolume({
                  value: volume.value === 0 ? volume.preValue : 0,
                  preValue: volume.value,
                });
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-5 cursor-pointer hover:bg-black/10 rounded-full"
                viewBox="0 0 24 24"
              >
                <path d="M16 21c3.527-1.547 5.999-4.909 5.999-9S19.527 4.547 16 3v2c2.387 1.386 3.999 4.047 3.999 7S18.387 17.614 16 19v2z" />
                <path d="M16 7v10c1.225-1.1 2-3.229 2-5s-.775-3.9-2-5zM4 17h2.697l5.748 3.832a1.004 1.004 0 0 0 1.027.05A1 1 0 0 0 14 20V4a1 1 0 0 0-.527-.878 1.008 1.008 0 0 0-1.027.05L6.697 7H4c-1.103 0-2 .897-2 2v6c0 1.103.897 2 2 2z" />
              </svg>
            </button>
            <div
              className="relative w-20 h-1 bg-black/50 rounded-full cursor-pointer group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percentage = clickX / rect.width;
                setVolume({
                  value: Math.min(Math.max(percentage, 0), 1),
                  preValue: volume.value,
                });
              }}
            >
              <div
                className="absolute h-full bg-black rounded-full"
                style={{ width: `${volume.value * 100}%` }}
              >
                <div className="bg-black h-3 w-1 absolute right-0 -top-1 group-hover:scale-110 "></div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
