import React from "react";
import Client from "./Client";
import { User } from "@/libs/Auth";
import prisma from "@/libs/prisma";
import { redirect } from "next/navigation";

export default async function page() {
  const user = await User();
  if (!user) {
    return redirect("/login");
  }

  const [purchases, albums, playlists, tracks] = await Promise.all([
    prisma.purchase.findMany({
      where: { userId: user.id, status: "PAID" },
      include: { album: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.album.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.playlist.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.track.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <Client
      purchases={purchases}
      albums={albums}
      playlists={playlists}
      tracks={tracks}
    />
  );
}