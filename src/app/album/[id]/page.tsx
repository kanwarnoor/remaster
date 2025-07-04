import { Metadata } from "next";
import AlbumClient from "./AlbumClient";
import Album from "@/models/Album";

type Props = {
  params: Promise<{ id: string }>;
};

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { id } = await params;

  const album = await Album.findById(id);

  return {
    title: album?.name,
  };
};

export default function Page() {
  return <AlbumClient />;
}
