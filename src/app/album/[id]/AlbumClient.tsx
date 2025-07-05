"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "next/navigation";
import InsideNavbar from "@/components/InsideNavbar";
import AlbumPage from "@/components/AlbumPage";
import SongPageLoading from "@/components/SongPageLoading";
import { User as Auth } from "@/libs/Auth";
import { useEffect, useState } from "react";

export default function AlbumClient() {
  const params = useParams();
  const id = params.id as string;
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const user = await Auth();
      setUser(user);
    };
    getUser();
  }, []);

  const { data: album, isLoading: albumLoading } = useQuery({
    queryKey: ["album", id],
    queryFn: async () => {
      const album = await axios.get(`/api/album/album_by_id?id=${id}`);
      return album.data;
    },
  });

  if (albumLoading) {
    return <SongPageLoading />;
  }

  return (
    <div>
      <InsideNavbar link="/" />
      <AlbumPage
        data={album}
        // setData={() => {}}
        user={user}
        // playing={false}
        // setPlaying={() => {}}
        // toggleVisibility={() => {}}
      />
    </div>
  );
}
