"use client";

import React, { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import { User } from "@/libs/Auth";
import { AnimatePresence } from "framer-motion";
import InsideNavbar from "@/components/InsideNavbar";
import SongPage from "@/components/SongPage";
import Player from "@/components/Player";
import { useParams } from "next/navigation";
import { usePlayer } from "@/context/PlayerContext";
import SongPageLoading from "@/components/SongPageLoading";

export default function SingleTrackClient() {
  const [user, setUser] = useState<any>(null);

  const queryClient = useQueryClient();
  const params = useParams();
  const id = params.id as string;

  const { data, setData, playing, setPlaying } = usePlayer();

  useEffect(() => {
    const getUser = async () => {
      const user = await User();
      if (!user) {
        return;
      }
      setUser(user);
    };

    getUser();
  }, []);

  const {
    data: trackData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["single", id],
    queryFn: async () => {
      return (await axios.get(`/api/tracks/track_by_id?id=${id}`)).data;
    },
    enabled: !!id,
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) return false;
      }
      return failureCount < 3;
    },
  });

  const toggleVisibility = async () => {
    const visibility =
      data.track.visibility == "private" ? "public" : "private";
    try {
      const res = await axios.put(
        `/api/tracks/toggle_visibility?id=${id}&visibility=${visibility}`
      );

      if (res.status !== 200) {
        throw new Error("Failed to toggle visibility");
      }

      queryClient.invalidateQueries({ queryKey: ["single", id] });
    } catch (error) {
      console.error("Error toggling visibility:", error);
    }
  };

  if (isLoading) {
    return (
      // <div className="w-screen h-screen flex justify-center items-center">
      //   <div className="remaster-spinner w-10 h-10"></div>
      // </div>
      <>
        <InsideNavbar link="/" /> 
        <SongPageLoading />
      </>
    );
  }

  if (!trackData || error) {
    return (
      <>
        <InsideNavbar link="/" />
        <div className="w-screen h-screen flex flex-col justify-center items-center ">
          <Image src={"/dead.webp"} height={500} width={500} alt={"dead mouse"} priority />
          <p className="text-3xl font-bold mt-5">Track does not exist!</p>
        </div>
      </>
    );
  }

  return (
    <>
      <InsideNavbar link="/" />
      <SongPage
        data={trackData}
        setData={setData}
        user={user}
        playing={playing}
        setPlaying={setPlaying}
      
        toggleVisibility={toggleVisibility}
      />
    </>
  );
}
