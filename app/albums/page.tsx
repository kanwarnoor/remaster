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
  const userAlbums = await prisma.album.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return <Client albums={userAlbums} />;
}
