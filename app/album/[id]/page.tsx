import { Metadata } from "next";

import prisma from "@/libs/prisma";
import { User } from "@/libs/Auth";
import MusicPage from "@/components/MusicPage";
import Navbar from "@/components/Navbar";
import Image from "next/image";

type Props = {
  params: Promise<{ id: string }>;
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> => {
  const { id } = await params;
  const album = await prisma.album.findUnique({ where: { id } });
  return {
    title: album?.name || "Remaster",
  };
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  const album = await prisma.album.findUnique({
    where: { id },
    include: {
      tracks: {
        orderBy: { sort: "asc" },
        include: { track: true },
      },
    },
  });

  if (!album) {
    return (
      <>
        <Navbar />
        <div className="w-screen h-screen flex flex-col justify-center items-center">
          <Image
            src={"/dead.webp"}
            height={500}
            width={500}
            alt={"dead mouse"}
            priority
          />
          <p className="text-3xl font-bold mt-5">Album does not exist!</p>
        </div>
      </>
    );
  }

  const user = await User();

  // If private, only owner can view
  if (album.visibility === "PRIVATE") {
    if (!user || user.id !== album.userId) {
      return (
        <>
          <Navbar />
          <div className="w-screen h-screen flex flex-col justify-center items-center">
            <Image
              src={"/dead.webp"}
              height={500}
              width={500}
              alt={"dead mouse"}
              priority
            />
            <p className="text-3xl font-bold mt-5">Album does not exist!</p>
          </div>
        </>
      );
    }
  }

  const rawTracks = album.tracks.map((t) => ({
    ...t.track,
    sort: String(t.sort),
  }));

  // Fetch liked track IDs for the current user
  let likedTrackIds: string[] = [];
  if (user) {
    const fav = await prisma.playlist.findFirst({
      where: { userId: user.id, name: "Favourites", default: true },
      include: { tracks: { select: { trackId: true } } },
    });
    if (fav) {
      likedTrackIds = fav.tracks.map((t) => t.trackId);
    }
  }

  const isCreator = !!user && user.id === album.userId;
  let purchased = false;
  if (!isCreator && user) {
    const p = await prisma.purchase.findFirst({
      where: { userId: user.id, albumId: album.id, status: "PAID" },
      select: { id: true },
    });
    purchased = !!p;
  }
  const owned = isCreator || purchased;

  const gated = album.forSale && !owned;
  const tracks = gated
    ? rawTracks.map((t) => ({ ...t, audio: "" }))
    : rawTracks;

  // Strip the nested tracks relation from album before passing to client
  const { tracks: _albumTracks, ...albumData } = album;

  return (
    <div>
      <Navbar />
      <MusicPage
        mode="album"
        data={{ album: albumData, tracks }}
        user={user ?? undefined}
        likedTrackIds={likedTrackIds}
        owned={owned}
      />
    </div>
  );
}
