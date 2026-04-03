"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "next/navigation";
import InsideNavbar from "@/components/InsideNavbar";
import MusicPage from "@/components/MusicPage";
import SongPageLoading from "@/components/SongPageLoading";
import { User as Auth } from "@/libs/Auth";
import { useEffect, useState } from "react";
import Image from "next/image";

interface User {
  id: string;
  username: string;
}

export default function AlbumClient() {
  const params = useParams();
  const id = params.id as string;
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const user = await Auth();
      setUser(user);
    };
    getUser();
  }, []);

  const {
    data: album,
    isLoading: albumLoading,
    isError,
  } = useQuery({
    queryKey: ["album", id],
    queryFn: async () => {
      const album = await axios.get(`/api/album/album_by_id?id=${id}`);
      return album.data;
    },
  });

  if (isError) {
    return (
      <>
        <InsideNavbar link="/" />
        <div className="w-screen h-screen flex flex-col justify-center items-center ">
          <Image
            src={"/dead.webp"}
            height={500}
            width={500}
            alt={"dead mouse"}
            priority
          />
          <p className="text-3xl font-bold mt-5">Album does not exist!</p>
        </div>
      </>
    );
  }

  if (albumLoading) {
    return <SongPageLoading />;
  }

  return (
    <div>
      <InsideNavbar link="/" />
      <MusicPage mode="album" data={album} user={user ?? undefined} />
    </div>
  );
}
