"use client";

import React, { useEffect, useState } from "react";
import Loader from "@/app/components/Loader";
import { motion } from "framer-motion";
import Tile from "./components/Tile";
import Upload from "./components/Upload";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { User } from "@/libs/Auth";
import Navbar from "./components/Navbar";

export default function Page() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["user"],
    queryFn: async () => await User(),
    staleTime: 1000 * 60 * 5,
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["userTracks"],
    queryFn: () => axios.get("/api/tracks/user_tracks"),
    refetchOnWindowFocus: false,
    enabled: !!currentUser?.username,
  });

  const deleteTrack = async (id: string) => {
    const res = await axios.delete("/api/tracks/delete_track", { data: { id } });
    if (res.status === 200) {
      queryClient.invalidateQueries({ queryKey: ["userTracks"] });
    } else {
      console.log("Error deleting track");
    }
  };

  if (isError) {
    return <div>Error: {error?.message || "Something went wrong"}</div>;
  }

  return (
    <>
      {currentUser && isLoading && (
        <div className="w-screen h-screen flex justify-center items-center">
          <Loader />
        </div>
      )}
      <Navbar/>
      <section className="w-screen h-screen flex flex-col justify-center items-center">
        <div className="flex-row flex gap-5">
          {data?.data.map((track: any) => {
            const type = track.album == null ? "single/" : "album/";
            return (
              <div key={track._id}>
                <Tile title={track.name} artist={track.artist} art={track.art} link={type + track._id} />
                <p className="text-remaster cursor-pointer" onClick={() => deleteTrack(track._id)}>
                  delete
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

