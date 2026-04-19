"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import { Album } from "@/app/generated/prisma/client";
import Tile from "@/components/Tile";

export default function Client({ albums }: { albums: Album[] }) {
  return (
    <div>
      <Navbar />
      <div className="w-full min-h-screen flex flex-col pt-16 ">
        <h1 className="text-3xl md:text-5xl font-bold px-5 md:px-20 pt-8 md:pt-12">Your Albums</h1>
        <div className="w-full flex px-5 md:px-20 flex-wrap h-auto pt-6 md:pt-12 pb-40 gap-3 md:gap-4 justify-start">
          {albums.map((album: Album, index: number) => (
            <Tile
              key={album.id}
              title={album.name || ""}
              artist={album.artist || ""}
              index={index}
              art={
                album.image
                  ? `https://remaster-storage.s3.ap-south-1.amazonaws.com/images/album/${album.image}`
                  : "/music.jpg"
              }
              link={"/album/" + album.id || ""}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
