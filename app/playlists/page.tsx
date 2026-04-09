import React from "react";
import { User } from "@/libs/Auth";
import prisma from "@/libs/prisma";
import { redirect } from "next/navigation";
import InsideNavbar from "@/components/InsideNavbar";
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
      <InsideNavbar link="/" />
      <div className="w-fit h-screen flex flex-col pt-16">
        <h1 className="text-5xl font-bold px-20 pt-12">Your Playlists</h1>
        <div className="w-fit flex px-20 flex-wrap h-auto pt-12 pb-32 gap-4">
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
