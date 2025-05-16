"use client";

import React, { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import { User } from "@/libs/Auth";
import { AnimatePresence } from "framer-motion";
import InsideNavbar from "@/app/components/InsideNavbar";
import SongPage from "@/app/components/SongPage";
import Player from "@/app/components/Player";
import { useParams } from "next/navigation";

export default function SingleTrackClient() {
  const [user, setUser] = useState<any>(null);
  const [playing, setPlaying] = React.useState(false);
  const [player, setPlayer] = useState(false);
  const [track, setTrack] = useState<any>(null);
  const [volume, setVolume] = useState(1);
  const queryClient = useQueryClient();
  const params = useParams();
  const id = params.id as string;

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

  const { data: audio } = useQuery({
    queryKey: ["audio", data?.track.audio],
    queryFn: async () => {
      const response = await axios.get(
        `/api/tracks/play?s3key=${data?.track.audio}`
      );
      return response.data;
    },
    enabled: !!id && !!data?.track.audio,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (audio?.url) {
      const newAudio = new Audio(audio.url);
      newAudio.volume = volume;

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
      const onTimeUpdate = () => {
        const progressBar = document.querySelector(
          ".progress-bar"
        ) as HTMLElement;
        if (progressBar) {
          const progress = (newAudio.currentTime / newAudio.duration) * 100;
          const progressFill = progressBar.querySelector("div") as HTMLElement;
          if (progressFill) {
            progressFill.style.width = `${progress}%`;
          }
        }
      };

      newAudio.addEventListener("playing", onPlay);
      newAudio.addEventListener("pause", onPause);
      newAudio.addEventListener("ended", onEnded);
      newAudio.addEventListener("reset", onReset);
      newAudio.addEventListener("timeupdate", onTimeUpdate);

      setTrack(newAudio);

      return () => {
        newAudio.pause();
        newAudio.removeEventListener("playing", onPlay);
        newAudio.removeEventListener("pause", onPause);
        newAudio.removeEventListener("ended", onEnded);
        newAudio.removeEventListener("reset", onReset);
        newAudio.removeEventListener("timeupdate", onTimeUpdate);
      };
    }
  }, [audio?.url]);

  useEffect(() => {
    if (track) {
      track.volume = volume;
    }
  }, [volume, track]);

  const handleSong = (action: string, event?: React.MouseEvent) => {
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

    if (action === "previous") {
      if (track.currentTime < 5) {
        track.currentTime = 0;
        return;
      }

      track.currentTime = 0;
      return;
    }

    if (action === "reset") {
      const resetEvent = new Event("reset");
      track.dispatchEvent(resetEvent);
    }

    if (action === "seek" && event) {
      const progressBar = document.querySelector(
        ".progress-bar"
      ) as HTMLElement;
      if (progressBar) {
        const rect = progressBar.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const percentageClicked = clickX / rect.width;
        track.currentTime = percentageClicked * track.duration;
      }
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
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
            <Player
              handleSong={handleSong}
              playing={playing}
              data={data}
              volume={volume}
              onVolumeChange={handleVolumeChange}
            />
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
