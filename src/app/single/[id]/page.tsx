"use client";

import React, { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { User } from "@/libs/Auth";
import { AnimatePresence } from "framer-motion";
import InsideNavbar from "@/app/components/InsideNavbar";
import SongPage from "@/app/components/SongPage";
import Player from "@/app/components/Player";

export default function page() {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [playing, setPlaying] = React.useState(false);
  const [player, setPlayer] = useState(false);
  const [track, setTrack] = useState<any>(null);
  const queryClient = useQueryClient();

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

  const { data, isLoading, error } = useQuery({
    queryKey: ["track", id],
    queryFn: async () => {
      return (await axios.get(`/api/tracks/track_by_id?id=${id}`)).data;
    },
    enabled: !!id,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) return false; // No retry on 403
      }
      return failureCount < 3; // Retry up to 3 times for other errors
    },
  });

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

  const s3key = data?.s3Key;

  const { data: audio } = useQuery({
    queryKey: ["audio", s3key],
    queryFn: async () => {
      const response = await axios.get(`/api/tracks/play?s3key=${s3key}`);
      return response.data;
    },
    enabled: !!id && !!s3key,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (audio?.url) {
      const newAudio = new Audio(audio.url);

      const onPlay = () => {
        setPlaying(true);
        setPlayer(true);
      };
      const onPause = () => setPlaying(false);
      const onEnded = () => setPlaying(false);
      const onReset = () => {
        newAudio.currentTime = 0;
        newAudio.play();
      };

      newAudio.addEventListener("playing", onPlay);
      newAudio.addEventListener("pause", onPause);
      newAudio.addEventListener("ended", onEnded);
      newAudio.addEventListener("reset", onReset);

      setTrack(newAudio);

      return () => {
        newAudio.pause();
        newAudio.removeEventListener("playing", onPlay);
        newAudio.removeEventListener("pause", onPause);
        newAudio.removeEventListener("ended", onEnded);
        newAudio.removeEventListener("reset", onReset);
      };
    }
  }, [audio?.url]);

  const handleSong = (action: string) => {
    if (!audio?.url) {
      return;
    }

    if (action === "play") {
      track.play();
      return;
    }

    if (action === "pause") {
      track.pause();
      return;
    }

    if(action == "previous") {

      if (track.currentTime < 5) {
        track.currentTime = 0;
        return;
      }
  
      track.currentTime = 0;
      return;
    }

    if (action == "reset") {
      const resetEvent = new Event("reset");
      track.dispatchEvent(resetEvent);
    }
  };

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

  return (
    <>
      <InsideNavbar link="/" />
      <SongPage
        data={data}
        audio={audio}
        user={user}
        toggleVisibility={toggleVisibility}
        handleSong={handleSong}
        playing={playing}
      />
      <AnimatePresence>
        {player && (
          <div className="fixed bottom-0 w-full h-20 px-20 mb-10">
            <Player handleSong={handleSong} playing={playing} />
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
