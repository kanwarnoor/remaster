"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { usePlayer } from "@/context/PlayerContext";
import { getPaletteSync } from "colorthief";

import type ReactPlayer from "react-player";
import ReactPlayerComponent from "react-player";

interface PlayerData {
  id: string;
  name: string;
  artist: string;
  image: string;
  audio: string;
  currentTime: number;
  duration: number;
}

export default function Player() {
  const [mounted, setMounted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const {
    data: playerData,
    setPlaying,
    playing,
    color,
    setColor,
    queue,
    queueIndex,
    playNext,
    playPrev,
    jumpToQueueIndex,
    shuffle,
    setShuffle,
    repeat,
    setRepeat,
    showQueue,
    setShowQueue,
  } = usePlayer();

  const [volume, setVolume] = useState({ value: 1, preValue: 1 });
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  // Fetch liked track IDs
  const { data: likedData } = useQuery({
    queryKey: ["liked-tracks"],
    queryFn: async () => {
      const res = await axios.get("/api/tracks/liked");
      return res.data.trackIds as string[];
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (likedData) {
      setTimeout(() => {
        setLikedIds(new Set(likedData));
      }, 1000);
    }
  }, [likedData]);

  const toggleLike = async (trackId: string) => {
    try {
      const res = await axios.post("/api/tracks/like", { trackId });
      if (res.status === 200) {
        setLikedIds((prev) => {
          const next = new Set(prev);
          if (res.data.liked) {
            next.add(trackId);
          } else {
            next.delete(trackId);
          }
          return next;
        });
      }
    } catch (error) {
      console.error("Failed to toggle like", error);
    }
  };
  const playerRef = useRef<typeof ReactPlayer>(null);
  const colorImgRef = useRef<HTMLImageElement>(null);
  const [progress, setProgress] = useState({
    played: 0,
    playedSeconds: 0,
    loaded: 0,
    loadedSeconds: 0,
  });

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 1000);
  }, []);

  // Extract colors from the currently playing track's image
  useEffect(() => {
    if (!playerData?.image) return;

    const img = colorImgRef.current;
    if (!img) return;

    function extractColors() {
      try {
        if (!img) return;
        const palette = getPaletteSync(img, { colorCount: 5 });
        if (palette && palette.length > 0) {
          setColor(palette.map((c) => c.array()));
        }
      } catch (err) {
        console.error("Player color extraction error:", err);
      }
    }

    if (img.complete && img.naturalWidth > 0) {
      extractColors();
    } else {
      img.onload = extractColors;
    }

    return () => {
      if (img) img.onload = null;
    };
  }, [playerData?.id]);

  const { data: audio } = useQuery({
    queryKey: ["audio", playerData?.id],
    queryFn: async () => {
      const response = await axios.get(
        `/api/tracks/play?s3key=${playerData?.audio}`,
      );
      return response.data;
    },
    enabled: !!playerData?.id,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const player = playerRef.current as unknown as PlayerData;
      if (player) {
        setProgress({
          played: player.currentTime / player.duration,
          playedSeconds: player.currentTime,
          loaded: player.duration,
          loadedSeconds: player.duration,
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleEnded = () => {
    if (repeat === 2) {
      // Repeat one: restart current track
      const mediaEl = document.querySelector(
        "audio, video",
      ) as HTMLMediaElement | null;
      if (mediaEl) {
        mediaEl.currentTime = 0;
        mediaEl.play();
      }
      return;
    }
    playNext();
  };

  if (!mounted) return null;
  if (!playerData) return null;

  function getLuminance(color: [number, number, number]) {
    const [r, g, b] = color;
    const normalizedR = r / 255;
    const normalizedG = g / 255;
    const normalizedB = b / 255;
    return 0.2126 * normalizedR + 0.7152 * normalizedG + 0.0722 * normalizedB;
  }

  const safeColor =
    Array.isArray(color) && color.length >= 5
      ? color
      : [
          [249, 84, 108],
          [249, 84, 108],
          [247, 109, 124],
          [251, 36, 60],
          [250, 229, 230],
        ];

  const dark = safeColor.slice().sort((a, b) => {
    return (
      getLuminance(a as [number, number, number]) -
      getLuminance(b as [number, number, number])
    );
  });

  // Determine if player bar text should be white or black
  // The bar has bg-white/50 backdrop-blur, so mix palette with white
  const avgLuminance =
    safeColor.reduce(
      (sum, c) => sum + getLuminance(c as [number, number, number]),
      0,
    ) / safeColor.length;
  // Account for the white/50 overlay: effective ≈ 0.5 * white + 0.5 * blur(palette)
  const effectiveLuminance = 0.5 * 1.0 + 0.5 * avgLuminance;
  const isDarkBg = effectiveLuminance < 0.55;
  const textColor = isDarkBg ? "white" : "black";

  return (
    <>
      <div className="hidden ">
        <ReactPlayerComponent
          ref={playerRef as unknown as React.RefObject<HTMLVideoElement>}
          src={audio?.url}
          playing={playing}
          volume={volume.value}
          controls={false}
          loop={false}
          onEnded={handleEnded}
        />
        <img
          ref={colorImgRef}
          src={
            playerData?.image
              ? `https://remaster-storage.s3.ap-south-1.amazonaws.com/images/track/${playerData.image}`
              : "/music.jpg"
          }
          crossOrigin="anonymous"
          alt="color-extract"
        />
      </div>

      {/* Queue Drawer */}
      <AnimatePresence>
        {showQueue && (
          <>
            <div
              className="fixed inset-0 z-[58]"
              onClick={() => setShowQueue(false)}
            />
            <motion.div
              initial={{ y: "45%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "45%", opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed bottom-28 left-0 right-0 m-auto w-[500px] max-h-[400px] z-[59]  border-t-1 backdrop-blur-xl rounded-2xl overflow-hidden"
              style={{
                background: dark
                  ? `rgba(${dark[4]?.[0] ?? 32},${dark[4]?.[1] ?? 32},${dark[4]?.[2] ?? 32},0.50)`
                  : `rgba(${color[0]?.[0] ?? 32},${color[0]?.[1] ?? 32},${color[0]?.[2] ?? 32},0.20)`,
                borderTop: dark
                  ? `2px solid rgba(${dark[4][0]},${dark[4][1]},${dark[4][2]},1)`
                  : "2px solid rgba(32,32,32,0.15)",
                color: textColor,
              }}
            >
              <div className="flex justify-between items-center p-4 border-b border-white/10">
                <p className="text-lg font-bold text-white">Queue</p>
                <div
                  className="cursor-pointer p-1 hover:bg-white/10 rounded-full transition-all"
                  onClick={() => setShowQueue(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="white"
                    className="size-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
              <div className="overflow-y-auto max-h-[340px] p-2 ">
                {queue.length === 0 && (
                  <p className="text-white/50 text-center py-4">
                    Queue is empty
                  </p>
                )}
                {queue.map((track, index) => (
                  <div
                    key={track.id + index}
                    className={`flex items-center gap-3 p-2 rounded-lg first:mt-0 mt-1 cursor-pointer transition-all hover:bg-white/10 ${
                      index === queueIndex ? "bg-white/15" : ""
                    }`}
                    onClick={() => jumpToQueueIndex(index)}
                  >
                    <p className="text-white/40 text-sm w-6 text-right">
                      {index + 1}
                    </p>
                    <img
                      src={
                        track.image
                          ? `https://remaster-storage.s3.ap-south-1.amazonaws.com/images/track/${track.image}`
                          : "/music.jpg"
                      }
                      alt={track.name || "track"}
                      width={40}
                      height={40}
                      className="rounded w-10 h-10 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/music.jpg";
                      }}
                    />
                    <div className="flex flex-col overflow-hidden">
                      <p
                        className={`text-sm text-ellipsis overflow-hidden line-clamp-1 font-medium ${index === queueIndex ? "text-white" : "text-white/70"}`}
                      >
                        {track.name}
                      </p>
                      <p className="text-xs text-white/40 truncate">
                        {track.artist}
                      </p>
                    </div>
                    {index === queueIndex && (
                      <div className="ml-auto">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="white"
                          className="size-4"
                        >
                          <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Player Bar */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{
          opacity: fullscreen ? 0 : 1,
          y: fullscreen ? 50 : 0,
        }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        style={{
          background: dark
            ? `rgba(${dark[4]?.[0] ?? 32},${dark[4]?.[1] ?? 32},${dark[4]?.[2] ?? 32},0.50)`
            : `rgba(${color[0]?.[0] ?? 32},${color[0]?.[1] ?? 32},${color[0]?.[2] ?? 32},0.20)`,
          borderTop: dark
            ? `2px solid rgba(${dark[4][0]},${dark[4][1]},${dark[4][2]},1)`
            : "2px solid rgba(32,32,32,0.15)",
          color: textColor,
        }}
        className={`fixed shadow-2xl bottom-0 left-0 right-0 mb-10 justify-center m-auto items-center h-16 z-[60] bg-white/50 backdrop-blur-md rounded-full flex transition-[color,filter,width] duration-300 ${repeat !== 0 ? "w-[830px]" : "w-[800px]"}`}
      >
        <div className="w-[240px] h-full flex items-center justify-start px-2 rounded-l-full shrink-0 overflow-hidden">
          <div className="flex items-center gap-2 cursor-pointer">
            <div
              className="shrink-0 flex group"
              onClick={() => setFullscreen(!fullscreen)}
            >
              <svg
                className="size-5 opacity-0 absolute top-0 left-0 m-[1.45rem] group-hover:opacity-100 transition-all duration-100 fill-current"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M21.7092 2.29502C21.8041 2.3904 21.8757 2.50014 21.9241 2.61722C21.9727 2.73425 21.9996 2.8625 22 2.997L22 3V9C22 9.55228 21.5523 10 21 10C20.4477 10 20 9.55228 20 9V5.41421L14.7071 10.7071C14.3166 11.0976 13.6834 11.0976 13.2929 10.7071C12.9024 10.3166 12.9024 9.68342 13.2929 9.29289L18.5858 4H15C14.4477 4 14 3.55228 14 3C14 2.44772 14.4477 2 15 2H20.9998C21.2749 2 21.5242 2.11106 21.705 2.29078L21.7092 2.29502Z" />
                <path d="M10.7071 14.7071L5.41421 20H9C9.55228 20 10 20.4477 10 21C10 21.5523 9.55228 22 9 22H3.00069L2.997 22C2.74301 21.9992 2.48924 21.9023 2.29502 21.7092L2.29078 21.705C2.19595 21.6096 2.12432 21.4999 2.07588 21.3828C2.02699 21.2649 2 21.1356 2 21V15C2 14.4477 2.44772 14 3 14C3.55228 14 4 14.4477 4 15V18.5858L9.29289 13.2929C9.68342 12.9024 10.3166 12.9024 10.7071 13.2929C11.0976 13.6834 11.0976 14.3166 10.7071 14.7071Z" />
              </svg>
              <Image
                src={
                  playerData?.image
                    ? `https://remaster-storage.s3.ap-south-1.amazonaws.com/images/track/${playerData?.image}`
                    : "/music.jpg"
                }
                alt={playerData?.name || "track image"}
                width={100}
                height={100}
                className="w-12 h-12 rounded-full opacity-100 group-hover:opacity-20 transition-all duration-100"
              />
            </div>
            <div className="max-w-xs">
              <h3 className="font-medium line-clamp-1">{playerData?.name}</h3>
              <p className="text-xs opacity-70 line-clamp-1">
                {playerData?.artist}
              </p>
            </div>
          </div>
        </div>
        <div className="relative w-[320px] h-full flex items-center justify-center gap-3 shrink-0">
          <div>
            {/* previous */}
            <div className="cursor-pointer mb-2" onClick={() => playPrev()}>
              <svg
                viewBox="0 0 24 24"
                className="size-9 fill-current"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 18L5 6M19 6V18L9 12L19 6Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          {/* play/pause */}
          <div className="w-10 h-10 mb-2">
            {playing ? (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer  border-black"
                onClick={() => setPlaying(playerData?.id, false)}
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
                onClick={() => setPlaying(playerData?.id, true)}
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
            <div className="cursor-pointer mb-2" onClick={() => playNext()}>
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
                  "audio, video",
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

        <div className="h-full flex items-center justify-center gap-2 px-2 rounded-r-full shrink-0">
          {/* Queue button */}
          <button
            className={`p-2 rounded-full transition-all duration-100 shrink-0 ${
              showQueue ? "bg-black/10" : ""
            }`}
            onClick={() => setShowQueue(!showQueue)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
          {/* Shuffle button */}
          <button
            className={`p-2 rounded-full transition-all duration-100 shrink-0 ${
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
          {/* Repeat button */}
          <button
            className={`p-2 justify-center items-center flex transition-all duration-100 rounded-full shrink-0 ${
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
            <span
              className={`text-[12px] text-black overflow-hidden whitespace-nowrap inline-block transition-all duration-300 ${repeat !== 0 ? "w-6 ml-1 opacity-100" : "w-0 ml-0 opacity-0"}`}
            >
              {repeat === 1 ? "All" : repeat === 2 ? "One" : "All"}
            </span>
          </button>
          <div className="flex items-center gap-0 shrink-0">
            <button
              className="p-1 hover:bg-black/10 rounded-full shrink-0"
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
              className="relative w-16 h-1 bg-black/50 rounded-full cursor-pointer group shrink-0"
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

      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-0 left-0 w-full h-full z-50 flex justify-center items-center"
          >
            <div className="backbacktainer -z-10 w-full h-full fixed top-0 left-0">
              <div id="body" className="backcontainer">
                <div
                  id="1st"
                  style={{ backgroundColor: `rgb(${dark[1].join(",")})` }}
                ></div>
                <div
                  id="2nd"
                  style={{ backgroundColor: `rgb(${dark[4].join(",")})` }}
                ></div>
                <div
                  id="3rd"
                  style={{ backgroundColor: `rgb(${dark[2].join(",")})` }}
                ></div>
                <div
                  id="4th"
                  style={{ backgroundColor: `rgb(${dark[0].join(",")})` }}
                ></div>
                <div
                  id="5th"
                  style={{
                    backgroundColor: `rgb(${dark[4].join(",") || "222, 222, 222"})`,
                  }}
                ></div>
              </div>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              onClick={() => setFullscreen(false)}
              stroke="currentColor"
              className="size-10 hover:scale-110 transition-all duration-100 stroke-white absolute top-0 right-0 m-4 cursor-pointer"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>

            <div className="w-full h-fit flex flex-col justify-center items-center">
              {playerData ? (
                <div className="flex flex-col justify-center items-center w-full h-full">
                  <Image
                    src={
                      playerData?.image
                        ? `https://remaster-storage.s3.ap-south-1.amazonaws.com/images/track/${playerData?.image}`
                        : "/music.jpg"
                    }
                    alt={playerData?.name || "track image"}
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="w-[31.3%] h-auto object-cover shadow-2xl rounded-xl"
                  />
                  <div className="flex flex-row w-[31.3%] mt-2 text-left justify-start items-center ">
                    {" "}
                    <div className="flex w-[80%] flex-col justify-start items-start ">
                      <p className="text-2xl text-white font-bold leading-tight">
                        {playerData?.name || "LOCKED"}
                      </p>

                      <p className="text-xl text-white leading-tight">
                        {playerData?.artist || "undefined"}
                      </p>
                    </div>
                    <div
                      className="flex w-[20%] flex-col items-end"
                      onClick={() => toggleLike(playerData.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill={likedIds.has(playerData.id) ? "white" : "none"}
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        className="size-7 stroke-white cursor-pointer hover:scale-110 transition-transform"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-white text-3xl font-bold">
                  nothing is playing!
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
