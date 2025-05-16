import SingleTrackClient from "./SingleTrackClient";

export default function Page({ params }: { params: { id: string } }) {
  return <SingleTrackClient id={params.id} />;
}

import { Metadata } from "next";
import { cookies, headers } from "next/headers";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const cookieStore = await cookies(); // ✅ No await
    const token = cookieStore.get("token")?.value;

    const headerList = await headers(); // ✅ No await
    const host = headerList.get("host") || "remaster.com";

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/tracks/track_by_id?id=${params.id}`,
      {
        headers: {
          Cookie: `token=${token}`,
        },
        next: {
          revalidate: 3600,
          tags: [`track-${params.id}`],
        },
      }
    );

    const data = await response.json();
    const { name, artist, s3Key } = data.track || {};

    return {
      title: name || "Remaster",
      description: `Listen to ${name || "this track"} by ${artist || "artist"}`,
      openGraph: {
        title: name || "Remaster",
        description: `Listen to ${name || "this track"} by ${artist || "artist"}`,
        images: s3Key
          ? [
              `https://remaster-storage.s3.ap-south-1.amazonaws.com/images/track/${s3Key}`,
            ]
          : [],
        url: `https://${host}/single/${params.id}`,
        type: "music.song",
      },
      twitter: {
        card: "summary_large_image",
        title: name || "Remaster",
        description: `Listen to ${name || "this track"} by ${artist || "artist"}`,
        images: s3Key
          ? [
              `https://remaster-storage.s3.ap-south-1.amazonaws.com/images/track/${s3Key}`,
            ]
          : [],
      },
      alternates: {
        canonical: `https://${host}/single/${params.id}`,
      },
    };
  } catch (err) {
    console.error("Metadata error:", err);
    return {
      title: "Remaster",
      description: "Listen to this track",
      openGraph: {
        title: "Remaster",
        description: "Listen to this track",
      },
    };
  }
}
