import { Metadata } from "next";

import prisma from "@/libs/prisma";
import { User } from "@/libs/Auth";
import ArtistPage from "@/components/ArtistPage";
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
  const artist = await prisma.user.findUnique({ where: { id } });
  return {
    title: artist?.username || "Remaster",
  };
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  const artist = await prisma.user.findUnique({
    where: { id },
    select: { id: true, username: true, image: true },
  });

  if (!artist) {
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
          <p className="text-2xl md:text-3xl font-bold mt-5 text-center">
            User does not exist!
          </p>
        </div>
      </>
    );
  }

  const viewer = await User();

  const tracks = await prisma.track.findMany({
    where: { userId: id, visibility: "PUBLIC" },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  const albums = await prisma.album.findMany({
    where: { userId: id, visibility: "PUBLIC" },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  const purchases = await prisma.purchase.findMany({
    where: { album: { userId: id } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <Navbar />
      <ArtistPage
        artist={artist}
        tracks={tracks}
        albums={albums}
        purchases={purchases}
        viewer={viewer ?? null}
      />
    </div>
  );
}
