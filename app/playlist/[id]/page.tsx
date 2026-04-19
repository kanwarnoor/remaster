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
  const playlist = await prisma.playlist.findUnique({ where: { id } });
  return {
    title: playlist?.name || "Remaster",
  };
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  const playlist = await prisma.playlist.findUnique({
    where: { id },
    include: {
      tracks: {
        orderBy: { sort: "desc" },
        include: { track: true },
      },
    },
  });

  if (!playlist) {
    return (
      <>
        <Navbar />
        <div className="w-screen min-h-screen flex flex-col justify-center items-center px-4">
          <Image
            src={"/dead.webp"}
            height={500}
            width={500}
            alt={"dead mouse"}
            priority
            className="w-[60vw] max-w-[500px] h-auto"
          />
          <p className="text-2xl md:text-3xl font-bold mt-5 text-center">Playlist does not exist!</p>
        </div>
      </>
    );
  }

  const user = await User();

  if (playlist.visibility === "PRIVATE") {
    if (!user || user.id !== playlist.userId) {
      return (
        <>
          <Navbar />
          <div className="w-screen min-h-screen flex flex-col justify-center items-center px-4">
            <Image
              src={"/dead.webp"}
              height={500}
              width={500}
              alt={"dead mouse"}
              priority
              className="w-[60vw] max-w-[500px] h-auto"
            />
            <p className="text-2xl md:text-3xl font-bold mt-5 text-center">Playlist does not exist!</p>
          </div>
        </>
      );
    }
  }

  const tracks = playlist.tracks.map((t) => ({
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

  const { tracks: _playlistTracks, ...playlistData } = playlist;

  return (
    <div>
      <Navbar />
      <MusicPage
        mode="playlist"
        data={{ playlist: playlistData, tracks }}
        user={user ?? undefined}
        likedTrackIds={likedTrackIds}
      />
    </div>
  );
}
