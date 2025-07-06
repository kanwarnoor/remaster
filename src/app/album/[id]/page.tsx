import { Metadata } from "next";
import AlbumClient from "./AlbumClient";
import Album from "@/models/Album";

type Props = {
  params: { id: string };
};

export const generateMetadata = async ({ params }: Props) => {
  console.log(params);
  const { id } = await params;

  const album = await Album.findById(id);

  return {
    title: album?.name || "Remaster",
  };
};

export default function Page() {
  return <AlbumClient />;
}
