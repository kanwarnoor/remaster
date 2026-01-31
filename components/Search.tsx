"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Search() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["search", search],
    queryFn: async () => {
      const response = await axios.get(`/api/search?q=${search}`);
      return response.data;
    },
    enabled: !!search,
  });

  // if the user is typing show the results instantly before them the hits enter or clicks the search button
  useEffect(() => {
    if (search) {
      queryClient.invalidateQueries({ queryKey: ["search", search] });
    }
  }, [search]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setSearch("");
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearch("");
      }
    };

    if (search) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [search]);

  const router = useRouter();

  const handleSearch = (e : React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const map = data.tracks.length > 0 ? "single" : data.albums.length > 0 ? "album" : "user";
    const id = data.tracks.length > 0 ? data.tracks[0]._id : data.albums.length > 0 ? data.albums[0]._id : data.users[0]._id;
    router.push(`/${map}/${id}`)    
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="w-[25rem] h-10 rounded-full bg-white/50 backdrop-blur-sm flex justify-center items-center relative z-20 text-left">
        <form
          onSubmit={(e) => handleSearch(e)}
          className="w-full h-full flex justify-center items-center border-2 rounded-full border-black"
        >
          <input
            name="remaster-search"
            type="text"
            className="w-full h-full rounded-full p-3 select-none outline-none focus:outline-none text-black text-base font-normal "
            value={search}
            autoComplete="off"
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="w-10 h-10 rounded-full " type="submit">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="black"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </button>
        </form>
      </div>
      {search && (
        <div className="absolute mt-1 rounded-xl p-5 w-[25rem] h-fit flex flex-col bg-neutral-800 gap-3 text-base font-normal text-white justify-start items-start">
          {isLoading && <div className="w-5 h-5 white-spinner "></div>}
          {data &&
            data.tracks.length == 0 &&
            data.albums.length == 0 &&
            data.users.length == 0 && <div>No results found!</div>}

          {data && data.tracks && data.tracks.length > 0 && (
            <>
              <p className="text-sm text-white/50">Tracks</p>
              {data.tracks.map((track: any) => (
                <SearchResult data={track} key={track._id} type="track" />
              ))}
            </>
          )}

          {data && data.albums && data.albums.length > 0 && (
            <>
              <p className="text-sm text-white/50 mt-3">Albums</p>
              {data.albums.map((album: any) => (
                <SearchResult data={album} key={album._id} type="album" />
              ))}
            </>
          )}

          {data && data.users && data.users.length > 0 && (
            <>
              <p className="text-sm text-white/50 mt-3">Users</p>
              {data.users.map((user: any) => (
                <SearchResult data={user} key={user._id} type="user" />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

const SearchResult = ({ data, type }: { data: any; type: string }) => {
  const router = useRouter();

  const map = type == "track" ? "single" : type == "album" ? "album" : "user";
  return (
    <div
      className="flex gap-3 group text-base font-normal text-white justify-start items-start"
      onClick={() => router.push(`/${map}/${data._id}`)}
    >
      <motion.div
        initial={{ opacity: 0, filter: "blur(20px)" }}
        animate={{
          opacity: 1,
          filter: "blur(0px)",
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="w-[50px] h-[50px] rounded justify-center items-center flex cursor-pointer"
      >
        <Image
          src={
            data.image
              ? `https://remaster-storage.s3.ap-south-1.amazonaws.com/images/track/${data.image}`
              : "/music.jpg"
          }
          alt={"art"}
          height={0}
          width={0}
          sizes="100% 100%"
          className={`w-[50px] h-[50px] ${
            type == "user" ? "rounded-full" : "rounded"
          }`}
        />
      </motion.div>
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 1,
          delay: 0.3,
        }}
        className="w-[18rem] max-w-full cursor-pointer group-hover:underline transition-all duration-300"
      >
        <p className="font-bold text-base leading-none mt-2 text-ellipsis overflow-hidden line-clamp-1">
          {data.name || data.username}
        </p>
        {(type == "track" || type == "album") && (
          <p className="font-bold text-sm leading-tight text-white/50 text-ellipsis overflow-hidden line-clamp-1">
            {data.artist || data.album}
          </p>
        )}
      </motion.div>
    </div>
  );
};
