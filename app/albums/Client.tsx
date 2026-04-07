"use client";

import React from "react";
import InsideNavbar from "@/components/InsideNavbar";
import { Album } from "@/app/generated/prisma/client";
import Tile from "@/components/Tile";

export default function Client({ albums }: { albums: Album[] }) {
  return (
    <div>
      <InsideNavbar link="/" />
      <div className="w-fit h-screen flex flex-col pt-16 ">
        <h1 className="text-5xl font-bold px-20 pt-12">Your Albums</h1>
        <div className="w-fit flex px-20 flex-wrap h-auto pt-12 pb-32 gap-4">
          {albums.map((album: Album, index: number) => (
            <Tile
              key={album.id}
              title={album.name || ""}
              artist={album.artist || ""}
              index={index}
              art={
                album.image
                  ? `https://remaster-storage.s3.ap-south-1.amazonaws.com/images/track/${album.image}`
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
