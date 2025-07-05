"use client";

import React, { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import Tile from "@/components/Tile";
import Upload from "@/components/Upload";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "@/libs/Auth";
import Navbar from "@/components/Navbar";
import TracksList from "@/components/TracksList";
import Player from "@/components/Player";
import Lander from "@/components/Lander";
import Notification from "@/components/Notification";

export default function Page() {
  const queryClient = useQueryClient();

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
    queryFn: async () => {
      const response = await axios.get("/api/tracks/user_tracks");
      return response.data;
    },
    retry: false,
  });

  const { data: publicTracks, isLoading: publicLoading } = useQuery({
    queryKey: ["publicTracks"],
    queryFn: async () => (await axios.get("/api/tracks/public_tracks")).data,
    retry: false,
  });

  const { data: albums = [], isLoading: albumsLoading } = useQuery({
    queryKey: ["albums"],
    queryFn: async () => {
      const album = await axios.get("/api/album");
      return album.data.album || [];
    },
    enabled: !!currentUser,
  });

  const deleteTrack = async (id: string) => {
    const res = await axios.delete("/api/tracks/delete_track", {
      data: { id },
    });
    if (res.status === 200) {
      queryClient.invalidateQueries({ queryKey: ["userTracks"] });
    } else {
      console.log("Error deleting track");
    }
  };

  return (
    <>
      <Navbar />
      <Lander />

      <div className="w-screen h-screen flex flex-col pt-16">
        {(currentUser && (albumsLoading || albums)) && albums.length > 0 && (
          <section className=" w-screen h-fit flex flex-col px-20 pt-12">
            <TracksList
              title="Your Albums"
              data={albums}
              isLoading={albumsLoading}
              type="album"
              upload={false}
            />
          </section>
        )}
        {currentUser && (userLoading || userTracks) && (
          <section className=" w-screen h-fit flex flex-col px-20 pt-12">
            <TracksList
              title="Your Tracks"
              data={userTracks}
              isLoading={userLoading}
              type="user"
              upload={true}
              deleteTrack={deleteTrack}
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
