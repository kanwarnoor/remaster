import { Metadata } from "next";
import SingleTrackClient from "@/app/single/[id]/SingleTrackClient";
import { cookies } from "next/headers";
import { headers } from "next/headers";

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await props.params;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/tracks/metadata?id=${id}`,
      {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );

    if (!response.ok) {
      return {
        title: "Track",
        description: "Loading track details",
      };
    }

    const data = await response.json();
    const { name, artist, image } = data.track || {};
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
