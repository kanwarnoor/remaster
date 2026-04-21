"use client";

import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import { User } from "@/libs/Auth";
import { AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import MusicPage from "@/components/MusicPage";
import Player from "@/components/Player";
import { useParams } from "next/navigation";
import { usePlayer } from "@/context/PlayerContext";
import SongPageLoading from "@/components/SongPageLoading";
import { Track } from "@/app/generated/prisma/client";

interface User {
  id: string;
  username: string;
}


export default function SingleTrackClient() {
  const [user, setUser] = useState<User | null>(null);

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
      return failureCount < 1;
    },
  });

  if (isLoading) {
    return (
      // <div className="w-screen h-screen flex justify-center items-center">
      //   <div className="remaster-spinner w-10 h-10"></div>
      // </div>
      <>
        <Navbar />
        <SongPageLoading />
      </>
    );
  }

  if (!trackData || error) {
    return (
      <>
        <Navbar />
        <div className="w-screen min-h-screen flex flex-col justify-center items-center px-4">
          <Image
            src={"/dead.webp"}
            height={500}
            width={500}
            alt={"dead mouse"}
            priority
            className="w-[60vw] max-w-[500px] h-auto"
          />
          <p className="text-2xl md:text-3xl font-bold mt-5 text-center">Track does not exist!</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <MusicPage
        mode="single"
        data={trackData}
        setData={setData as unknown as (data: Track) => void}
        user={user || { id: "", username: "" }}
        playing={playing && data?.id === trackData?.track?.id}
        setPlaying={setPlaying}
      />
    </>
  );
}
