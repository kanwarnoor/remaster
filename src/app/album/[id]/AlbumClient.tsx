"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "next/navigation";
import InsideNavbar from "@/components/InsideNavbar";
import AlbumPage from "@/components/AlbumPage";

export default function AlbumClient() {
  const params = useParams();
  const id = params.id as string;

  const { data: album, isLoading: albumLoading } = useQuery({
    queryKey: ["album", id],
    queryFn: async () => {
      const album = await axios.get(`/api/album/album_by_id?id=${id}`);
      return album.data;
    },
  });

  if (albumLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <InsideNavbar link="/" />
      <AlbumPage
        data={album}
        // setData={() => {}}
        user={null as any}
        // playing={false}
        // setPlaying={() => {}}
        // toggleVisibility={() => {}}
      />
    </div>
  );
}
