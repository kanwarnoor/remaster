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

  const album = Album.findById(id);

  console.log(album);

  return {
    title: "hello",
  };
};

export default function Page({ id }: { id: string }) {
  return <AlbumClient id={id} />;
}
