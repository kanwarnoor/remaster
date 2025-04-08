"use client";

import React, { useEffect, useState } from "react";
import Loader from "@/app/components/Loader";
import { motion } from "framer-motion";
import Tile from "./components/Tile";
import Upload from "./components/Upload";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { loggedIn } from "@/libs/Auth";

export default function page() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [login, setLogin] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      const loggedInStatus = await loggedIn();
      setLogin(loggedInStatus);
    };
    checkLogin();
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["userTracks"],
    queryFn: () => {
      return axios.get("/api/tracks/user_tracks");
    },
    refetchOnWindowFocus: false,
    enabled: login == true,
  });

  const deleteTrack = async (id: string) => {
    const res = await axios.delete("/api/tracks/delete_track", {
      data: {
        id,
      },
    });

    if (res.status == 200) {
      queryClient.invalidateQueries({ queryKey: ["userTracks"] });
    } else {
      console.log("Error deleting track");
    }
  };

  // const handleUpload = () => {
  //   router.push("/upload");
  // };

  return (
    <>
      {login && isLoading && (
        <div className="w-screen h-screen flex justify-center items-center ">
          <Loader />
        </div>
      )}
      <section className="w-screen h-screen flex flex-col justify-center items-center ">
        {/* <h1 className="m-10">User Tracks</h1> */}
        <div className="flex-row flex gap-5">
          {data?.data.map((track: any) => {
            return (
              <div key={track._id}>
                <Tile title={track.name} artist={track.artist} />
                <p
                  className="text-remaster cursor-pointer"
                  onClick={() => deleteTrack(track._id)}
                >
                  delete
                </p>
              </div>
            );
          })}
        </div>
        {/* <Upload click={handleUpload} /> */}
      </section>{" "}
    </>
  );
}
