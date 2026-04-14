"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import { Track } from "@/app/generated/prisma/client";
import TracksList from "@/components/TracksList";
import Tile from "@/components/Tile";

export default function Client(tracks: { tracks: Track[] }) {
  return (
    <div>
      <Navbar />
      <div className="w-fit h-screen flex flex-col pt-16 ">
        <h1 className="text-5xl font-bold px-25 pt-12">Your Tracks</h1>
        <div className="w-fit flex px-25 flex-wrap h-auto pt-12 pb-32 gap-4">
          {tracks.tracks.map((track: Track, index: number) => (
            <Tile
              key={track.id}
              title={track.name || ""}
              artist={track.artist || ""}
              index={index}
              art={
                track.image
                  ? `https://remaster-storage.s3.ap-south-1.amazonaws.com/images/track/${track.image}`
                  : "/music.jpg"
              }
              link={"/single/" + track.id || ""}
            />
          ))}
          {/* <TracksList title='Tracks' data={tracks} isLoading={false} type='tracks' /> */}
        </div>
      </div>
    </div>
  );
}
