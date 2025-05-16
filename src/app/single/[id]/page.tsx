import { Metadata } from "next";
import SingleTrackClient from "@/app/single/[id]/SingleTrackClient";
import { cookies } from "next/headers";
import { headers } from "next/headers";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const { id } = params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const headersList = await headers();
    const host = headersList.get("host") || "remaster.com";

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/tracks/track_by_id?id=${id}`,
      {
        headers: {
          Cookie: `token=${token}`,
        },
        next: {
          revalidate: 3600,
          tags: [`track-${id}`],
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch track data: ${response.statusText}`);
    }

    const data = await response.json();
    const { name, artist, s3Key } = data.track || {};

    const imageUrl = s3Key
      ? `https://remaster-storage.s3.ap-south-1.amazonaws.com/images/track/${s3Key}`
      : undefined;

    const metadata: Metadata = {
      title: name || "Remaster",
      description: `Listen to ${name || "this track"} by ${artist || "artist"}`,
      openGraph: {
        title: name || "Remaster",
        description: `Listen to ${name || "this track"} by ${
          artist || "artist"
        }`,
        images: imageUrl ? [imageUrl] : [],
        url: `https://${host}/single/${id}`,
        type: "music.song",
      },
      twitter: {
        card: "summary_large_image",
        title: name || "Remaster",
        description: `Listen to ${name || "this track"} by ${
          artist || "artist"
        }`,
        images: imageUrl ? [imageUrl] : [],
      },
      alternates: {
        canonical: `https://${host}/single/${id}`,
      },
    };

    return metadata;
  } catch (error) {
    console.error("Error generating metadata:", error);
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

export default async function Page({ params }: { params: { id: string } }) {
  return <SingleTrackClient id={params.id} />;
}
