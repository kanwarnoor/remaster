import { Metadata } from "next";
import AlbumClient from "./AlbumClient";
import Album from "@/models/Album";

type Props = {
  params: Promise<{ id: string }>;
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> => {
  const { id } = await params;

  const album = await Album.findById(id);

  return {
    title: album?.name || "Remaster",
  };
};

export default async function Page({ params }: Props) {
  await params; // Await params to satisfy Next.js 15 requirement
  return <AlbumClient />;
}
