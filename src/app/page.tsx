"use client";

import React, { useEffect, useState } from "react";
import Loader from "@/app/components/Loader";
import Tile from "./components/Tile";
import Upload from "./components/Upload";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { User } from "@/libs/Auth";
import Navbar from "./components/Navbar";
import TracksList from "./components/TracksList";

export default function Page() {
  const { data: currentUser } = useQuery({
    queryKey: ["user"],
    queryFn: async () => await User(),
  });

  const {
    data: userTracks,
    isLoading: userLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["userTracks"],
    queryFn: () => axios.get("/api/tracks/user_tracks"),
    retry: false,
  });

  const { data: publicTracks, isLoading: publicLoading } = useQuery({
    queryKey: ["publicTracks"],
    queryFn: () => axios.get("/api/tracks/public_tracks"),
    retry: false,
  });

  // const deleteTrack = async (id: string) => {
  //   const res = await axios.delete("/api/tracks/delete_track", {
  //     data: { id },
  //   });
  //   if (res.status === 200) {
  //     queryClient.invalidateQueries({ queryKey: ["userTracks"] });
  //   } else {
  //     console.log("Error deleting track");
  //   }
  // };

  return (
    <>
      <Navbar />
      <div className="w-screen h-screen flex flex-col pt-16">
        {(userLoading || userTracks) && (
          <section className="w-screen h-fit flex flex-col px-20 pt-12">
            <TracksList
              title="Your Tracks"
              data={userTracks}
              isLoading={userLoading}
              type="user"
            />
          </section>
        )}

        {(publicLoading || publicTracks) && (
          <section className="w-screen h-fit flex flex-col px-20 pt-12 pb-20">
            <TracksList
              title="Public Tracks"
              data={publicTracks}
              isLoading={publicLoading}
              type="public"
            />
          </section>
        )}
      </div>
    </>
  );
}
