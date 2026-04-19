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

  const playlists = await prisma.playlist.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      tracks: {
        orderBy: { sort: "asc" },
        take: 1,
        include: { track: { select: { image: true } } },
      },
    },
  });

  return (
    <div>
      <Navbar />
      <div className="w-full min-h-screen flex flex-col pt-16">
        <h1 className="text-3xl md:text-5xl font-bold px-5 md:px-20 pt-8 md:pt-12">Your Playlists</h1>
        <div className="w-full flex px-5 md:px-20 flex-wrap h-auto pt-6 md:pt-12 pb-40 gap-3 md:gap-4 justify-start">
          {playlists.map((playlist, index) => {
            const coverImage = playlist.image || playlist.tracks[0]?.track?.image || null;
            return (
              <Tile
                key={playlist.id}
                title={playlist.name || ""}
                artist={playlist.description || ""}
                index={index}
                art={
                  coverImage
                    ? `https://remaster-storage.s3.ap-south-1.amazonaws.com/images/playlist/${coverImage}`
                    : "/music.jpg"
                }
                link={"/playlist/" + playlist.id}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
