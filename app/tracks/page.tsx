import React from "react";
import { User } from "@/libs/Auth";
import prisma from "@/libs/prisma";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Tile from "@/components/Tile";

export default async function Page() {
  const user = await User();
  if (!user) {
    return redirect("/login");
  }

  const tracks = await prisma.track.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <Navbar />
      <div className="w-full min-h-screen flex flex-col pt-16">
        <h1 className="text-3xl md:text-5xl font-bold px-5 md:px-20 pt-8 md:pt-12">
          Your Tracks
        </h1>
        <div className="w-full flex px-5 md:px-20 flex-wrap h-auto pt-6 md:pt-12 pb-40 gap-3 md:gap-4 justify-start">
          {tracks.length === 0 && (
            <Tile
              key="upload"
              title="Upload a track"
              artist=""
              index={0}
              art="/music.jpg"
              link="/upload"
              upload={true}
            />
          )}
          {tracks.map((track, index) => (
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
              link={"/single/" + track.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
