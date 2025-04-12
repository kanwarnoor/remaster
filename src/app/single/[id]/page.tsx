"use client";

import React, { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { motion } from "framer-motion";
import ColorThief from "colorthief";
import { User } from "@/libs/Auth";
import InsideNavbar from "@/app/components/InsideNavbar";

export default function page() {
  const [playing, setPlaying] = React.useState(false);
  const { id } = useParams();
  const colorThief = new ColorThief();
  const imgRef = useRef<HTMLImageElement>(null);
  const queryClient = useQueryClient();
  const [colors, setColors] = useState<[number, number, number][]>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["track", id],
    queryFn: async () => {
      const response = await axios.get(`/api/tracks/track_by_id?id=${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const s3key = data?.s3Key;

  const { data: audio } = useQuery({
    queryKey: ["audio", s3key],
    queryFn: async () => {
      const response = await axios.get(`/api/tracks/play?s3key=${s3key}`);
      return response.data;
    },
    enabled: !!id && !!s3key,
  });

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
  }, [data?.art]);

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <div className="remaster-spinner w-10 h-10"></div>
      </div>
    );
  }

  if (!data || error) {
    return (
      <>
        <InsideNavbar link="/" />
        <div className="w-screen h-screen flex flex-col justify-center items-center ">
          <Image src={"/dead.png"} height={500} width={500} alt={""} priority />
          <p className="text-3xl font-bold mt-5">Track does not exist!</p>
        </div>
      </>
    );
  }

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

  const handleSong = () => {
    if (!audio?.url) {
      return;
    }

    const sound = new Audio(audio.url);

    sound
      .play()
      .then(() => {})
      .catch((err) => {
        console.error("Playback failed:", err);
      });
  };

  const toggleVisibility = async () => {
    const visibility = data.visibility == "private" ? "public" : "private";
    try {
      const res = await axios.put(
        `/api/tracks/toggle_visibility?id=${id}&visibility=${visibility}`
      );

      if (res.status !== 200) {
        throw new Error("Failed to toggle visibility");
      }

      queryClient.invalidateQueries({ queryKey: ["track", id] });
    } catch (error) {
      console.error("Error toggling visibility:", error);
    }
  };

  return (
    <>
      <InsideNavbar link="/" />
      <div className="w-screen h-fit pt-16 text-center select-none">
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
              src={data.art || "/music.jpg"}
              height={0}
              width={0}
              sizes="100% 100%"
              alt=""
              priority
              className="w-80  h-full transition rounded"
            />
            <img
              ref={imgRef}
              src={data.art || "/music.jpg"}
              crossOrigin="anonymous"
              style={{ display: "none" }}
              alt="color-thief-img"
            />
          </motion.div>
          <div className="w-full">
            <div className="w-full h-[65%] text-ellipsis ml-10  justify-center flex flex-col">
              {data.visibility === "private" ? (
                <p
                  className="text-sm font-bold cursor-pointer"
                  onClick={() => toggleVisibility()}
                >
                  Private
                </p>
              ) : (
                <p
                  className="text-sm font-bold cursor-pointer"
                  onClick={() => toggleVisibility()}
                >
                  Public
                </p>
              )}
              <p className="text-5xl font-bold text-ellipsis overflow-hidden line-clamp-2  pb-1">
                {data.name}
              </p>
              <p className="text-lg font-bold ">{data.artist}</p>
            </div>
            <div className="w-[100%] ml-10 h-[35%] flex items-center">
              {playing ? (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-11 cursor-pointer"
                    onClick={() => {
                      setPlaying(!playing);
                    }}
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      <path
                        d="M2 6C2 4.11438 2 3.17157 2.58579 2.58579C3.17157 2 4.11438 2 6 2C7.88562 2 8.82843 2 9.41421 2.58579C10 3.17157 10 4.11438 10 6V18C10 19.8856 10 20.8284 9.41421 21.4142C8.82843 22 7.88562 22 6 22C4.11438 22 3.17157 22 2.58579 21.4142C2 20.8284 2 19.8856 2 18V6Z"
                        fill="white"
                      ></path>
                      <path
                        d="M14 6C14 4.11438 14 3.17157 14.5858 2.58579C15.1716 2 16.1144 2 18 2C19.8856 2 20.8284 2 21.4142 2.58579C22 3.17157 22 4.11438 22 6V18C22 19.8856 22 20.8284 21.4142 21.4142C20.8284 22 19.8856 22 18 22C16.1144 22 15.1716 22 14.5858 21.4142C14 20.8284 14 19.8856 14 18V6Z"
                        fill="white"
                      ></path>
                    </g>
                  </svg>
                  <p className="pl-2">Pause</p>
                </>
              ) : (
                <>
                  <svg
                    fill="white"
                    viewBox="0 0 32 32"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-14 cursor-pointer"
                    onClick={() => {
                      handleSong();
                      setPlaying(!playing);
                    }}
                  >
                    <title>play</title>
                    <path d="M5.92 24.096q0 1.088 0.928 1.728 0.512 0.288 1.088 0.288 0.448 0 0.896-0.224l16.16-8.064q0.48-0.256 0.8-0.736t0.288-1.088-0.288-1.056-0.8-0.736l-16.16-8.064q-0.448-0.224-0.896-0.224-0.544 0-1.088 0.288-0.928 0.608-0.928 1.728v16.16z"></path>
                  </svg>
                  <p>Play</p>
                </>
              )}
              <div className="justify-end ml-auto mr-10 flex cursor-pointer">
                Edit
              </div>
            </div>
          </div>
        </div>

        {/* tracklist */}
        <div className="w-full justify-start flex flex-col ">
          <div className="flex mt-10 mx-20 h-14 rounded-lg bg-neutral-800 hover:bg-neutral-700 cursor-pointer ">
            <div className="w-[5%] justify-left items-center flex ml-5">
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
              {data.name}
            </div>
            <div className=" w-[70%] text-ellipsis overflow-hidden flex items-center ml-2 text-base font-bold">
              {data.artist}
            </div>
            <div className=" w-[10%] text-ellipsis overflow-hidden flex items-center ml-2 text-base font-bold justify-end select-all pr-3">
              {formatTime(data.duration)}
            </div>
          </div>

          <div>{data.timestamps}</div>
        </div>
      </div>
    </>
  );
}
