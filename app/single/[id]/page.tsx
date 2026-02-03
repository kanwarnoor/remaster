import { Metadata } from "next";
import SingleTrackClient from "@/app/single/[id]/SingleTrackClient";
import prisma from "@/libs/prisma";

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await props.params;
    const track = await prisma.track.findUnique({ where: { id } });

    if (!track) {
      return {
        title: "Track",
        description: "Loading track details",
      };
    }

    const { name, artist, image } = track || {};
    const imageUrl = image
      ? `https://remaster-storage.s3.ap-south-1.amazonaws.com/images/track/${image}`
      : `${process.env.NEXT_PUBLIC_URL}/music.jpg`;

    return {
      title: name || "Track",
      description: `Listen to ${name || "this track"} by ${artist || "artist"}`,
      openGraph: {
        title: name || "Track",
        description: `Listen to ${name || "this track"} by ${
          artist || "artist"
        }`,
        images: [
          {
            url: imageUrl,
            width: 800,
            height: 800,
            alt: `${name || "Track"} by ${artist || "artist"}`,
          },
        ],
        type: "music.song",
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Loading...",
      description: "Loading track details",
    };
  }
}

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return <SingleTrackClient />;
}
