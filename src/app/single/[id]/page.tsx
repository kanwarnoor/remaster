import { Metadata } from "next";
import SingleTrackClient from "@/app/single/[id]/SingleTrackClient";
import { cookies } from "next/headers";
import { headers } from "next/headers";

type GenerateMetadataProps = {
  params: Promise<{ id: string }>;
  searchParams: { [key: string]: string | string[] | undefined };
};

type PageProps = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({
  params,
}: GenerateMetadataProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
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

    const data = await response.json();
    const { name, artist, s3Key } = data.track || {};

    const metadata: Metadata = {
      title: name || "Remaster",
      description: `Listen to ${name || "this track"} by ${artist || "artist"}`,
      openGraph: {
        title: name || "Remaster",
        description: `Listen to ${name || "this track"} by ${
          artist || "artist"
        }`,
        images: s3Key
          ? [
              `https://remaster-storage.s3.ap-south-1.amazonaws.com/images/track/${s3Key}`,
            ]
          : [],
        url: `https://${host}/single/${id}`,
        type: "music.song",
      },
      twitter: {
        card: "summary_large_image",
        title: name || "Remaster",
        description: `Listen to ${name || "this track"} by ${
          artist || "artist"
        }`,
        images: s3Key
          ? [
              `https://remaster-storage.s3.ap-south-1.amazonaws.com/images/track/${s3Key}`,
            ]
          : [],
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

export default function Page({ params }: PageProps) {
  return <SingleTrackClient id={params.id} />;
}
