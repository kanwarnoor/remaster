"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Popup from "./Popup";
import { User, Logout } from "@/libs/Auth";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import Image from "next/image";
import { usePlayer } from "@/context/PlayerContext";

export default function Navbar() {
  const [popup, setPopup] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { color } = usePlayer();

  // Color logic matching Player
  function getLuminance(c: [number, number, number]) {
    return (
      0.2126 * (c[0] / 255) + 0.7152 * (c[1] / 255) + 0.0722 * (c[2] / 255)
    );
  }

  const safeColor =
    Array.isArray(color) && color.length >= 5
      ? color
      : [
          [249, 84, 108],
          [249, 84, 108],
          [247, 109, 124],
          [251, 36, 60],
          [250, 229, 230],
        ];

  const dark = safeColor
    .slice()
    .sort(
      (a, b) =>
        getLuminance(a as [number, number, number]) -
        getLuminance(b as [number, number, number]),
    );

  const avgLuminance =
    safeColor.reduce(
      (sum, c) => sum + getLuminance(c as [number, number, number]),
      0,
    ) / safeColor.length;
  const effectiveLuminance = 0.5 * 1.0 + 0.5 * avgLuminance;
  const isDarkBg = effectiveLuminance < 0.55;
  const textColor = isDarkBg ? "white" : "black";

  const hasPlayerColor = Array.isArray(color) && color.length >= 5;

  const { data: currentUser } = useQuery({
    queryKey: ["user"],
    queryFn: async () => await User(),
    staleTime: 1000 * 60 * 5,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => await Logout(),
    onSuccess: () => {
      queryClient.resetQueries({ queryKey: ["user"] });
      queryClient.resetQueries({ queryKey: ["userTracks"] });
      setPopup(false);
    },
  });

  // Search query
  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ["search", search],
    queryFn: async () => {
      const response = await axios.get(`/api/search?q=${search}`);
      return response.data;
    },
    enabled: !!search,
  });

  useEffect(() => {
    if (search) {
      queryClient.invalidateQueries({ queryKey: ["search", search] });
    }
  }, [search, queryClient]);

  // Close search on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
        setSearch("");
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchData) return;
    const map =
      searchData.tracks.length > 0
        ? "single"
        : searchData.albums.length > 0
          ? "album"
          : "user";
    const id =
      searchData.tracks.length > 0
        ? searchData.tracks[0].id
        : searchData.albums.length > 0
          ? searchData.albums[0].id
          : searchData.users[0].id;
    router.push(`/${map}/${id}`);
    setSearchOpen(false);
    setSearch("");
  };

  const [scroll, setScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScroll(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="fixed z-20">
        {/* Left logo */}
        <div className="navbar h-16 pl-[13px] text-center fixed left-0 justify-center items-center m-auto flex font-black text-5xl select-none text-remaster z-50">
          <button
            onClick={() => {
              router.push("/");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="mt-1 relative overflow- block cursor-pointer"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={scroll ? "R" : "Remaster"}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="block"
              >
                {scroll ? "R" : "Remaster"}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>

        {/* Center top bar */}
        <div className="fixed left-0 right-0 flex justify-center items-center h-16 z-40 pointer-events-none">
          <div
            ref={searchContainerRef}
            className="pointer-events-auto relative"
          >
            <motion.div
              layout
              className="h-12 backdrop-blur-md rounded-full flex items-center px-2 gap-1 shadow-lg transition-[background,border,color] duration-300 pt-[2px]"
              style={{
                background: hasPlayerColor
                  ? `rgba(${dark[4]?.[0] ?? 32},${dark[4]?.[1] ?? 32},${dark[4]?.[2] ?? 32},0.50)`
                  : "rgba(255,255,255,0.5)",
                borderBottom: hasPlayerColor
                  ? `2px solid rgba(${dark[4]?.[0] ?? 32},${dark[4]?.[1] ?? 32},${dark[4]?.[2] ?? 32},1)`
                  : "2px solid rgba(32,32,32,0.15)",
                color: hasPlayerColor ? textColor : "black",
              }}
            >
              {/* Search icon / expanded search */}
              <AnimatePresence mode="wait">
                {searchOpen ? (
                  <motion.form
                    key="search-input"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 400, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleSearch}
                    className="flex items-center overflow-hidden"
                  >
                    <input
                      ref={searchInputRef}
                      name="remaster-search"
                      type="text"
                      placeholder="Search..."
                      className="w-full h-8 bg-transparent text-current text-sm px-3 outline-none placeholder:opacity-100"
                      value={search}
                      autoComplete="off"
                      onChange={(e) => setSearch(e.target.value)}
                    />
              
                    <button
                      type="button"
                      onClick={() => {
                        setSearchOpen(false);
                        setSearch("");
                      }}
                      className="p-1.5 hover:bg-current/10 rounded-full transition-colors shrink-0"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="size-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </motion.form>
                ) : (
                  <motion.button
                    key="search-icon"
                    layout="position"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => setSearchOpen(true)}
                    className="p-2 hover:bg-current/10 rounded-full transition-colors opacity-70 hover:opacity-100 cursor-pointer shrink-0"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="size-5 shrink-0"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                      />
                    </svg>
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Home */}
              {!searchOpen && (
                <button
                  onClick={() => {
                    router.push("/");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`px-3 py-1.5 text-sm rounded-full  whitespace-nowrap cursor-pointer ${pathname === "/" ? "bg-current/10 opacity-100" : "opacity-70"}`}
                >
                  Home
                </button>
              )}

              {/* Library */}
              {!searchOpen && currentUser && (
                <button
                  onClick={() => router.push("/tracks")}
                  className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap cursor-pointer ${pathname === "/tracks" ? "bg-current/10 opacity-100" : "opacity-70"}`}
                >
                  Library
                </button>
              )}

              {/* Upload / Add */}
              {!searchOpen && currentUser && (
                <button
                  onClick={() => router.push("/upload")}
                  className="p-2 hover:bg-current/10 rounded-full transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </motion.div>

            {/* Search results dropdown */}
            {searchOpen && search && (
              <div
                className="absolute top-14 left-1/2 -translate-x-1/2 rounded-xl p-5 w-[25rem] h-fit flex flex-col bg-black/50 backdrop-blur-sm gap-3 text-base font-normal text-black justify-start items-start shadow-2xl border border-white/10"
                style={{
                  background: hasPlayerColor
                    ? `rgba(${dark[4]?.[0] ?? 32},${dark[4]?.[1] ?? 32},${dark[4]?.[2] ?? 32},0.50)`
                    : "rgba(255,255,255,0.5)",
                  borderBottom: hasPlayerColor
                    ? `2px solid rgba(${dark[4]?.[0] ?? 32},${dark[4]?.[1] ?? 32},${dark[4]?.[2] ?? 32},1)`
                    : "2px solid rgba(32,32,32,0.15)",
                  color: hasPlayerColor ? textColor : "black",
                }}
              >
                {searchLoading && <div className="w-5 h-5 white-spinner"></div>}
                {searchData &&
                  searchData.tracks.length === 0 &&
                  searchData.albums.length === 0 &&
                  searchData.users.length === 0 && <div>No results found!</div>}

                {searchData &&
                  searchData.tracks &&
                  searchData.tracks.length > 0 && (
                    <>
                      <p className="text-sm text-black">Tracks</p>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {searchData.tracks.map((track: any) => (
                        <SearchResult
                          data={track}
                          key={track.id}
                          type="track"
                        />
                      ))}
                    </>
                  )}

                {searchData &&
                  searchData.albums &&
                  searchData.albums.length > 0 && (
                    <>
                      <p className="text-sm text-white/50 mt-3">Albums</p>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {searchData.albums.map((album: any) => (
                        <SearchResult
                          data={album}
                          key={album.id}
                          type="album"
                        />
                      ))}
                    </>
                  )}

                {searchData &&
                  searchData.users &&
                  searchData.users.length > 0 && (
                    <>
                      <p className="text-sm text-white/50 mt-3">Users</p>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {searchData.users.map((user: any) => (
                        <SearchResult data={user} key={user.id} type="user" />
                      ))}
                    </>
                  )}
              </div>
            )}
          </div>
        </div>

        {/* Right side - user info */}
        <div className="navbar h-16 pr-5 text-center fixed right-0 justify-center items-center m-auto flex font-black text-2xl select-none text-remaster z-50">
          {currentUser ? (
            <>
              {currentUser.username}
              <button
                className="ml-2 text-white cursor-pointer"
                onClick={() => setPopup(true)}
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">Login</Link>
              <Link href="/signup" className="text-white">
                Signup
              </Link>
            </div>
          )}
        </div>

        <AnimatePresence>
          {popup && (
            <Popup
              message={"Leaving remaster?"}
              onCancel={() => setPopup(false)}
              onConfirm={() => logoutMutation.mutate()}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SearchResult = ({ data, type }: { data: any; type: string }) => {
  const router = useRouter();
  const map = type === "track" ? "single" : type === "album" ? "album" : "user";

  return (
    <div
      className="flex gap-3 group text-base font-normal text-black justify-start items-start cursor-pointer"
      onClick={() => router.push(`/${map}/${data.id}`)}
    >
      <motion.div
        initial={{ opacity: 0, filter: "blur(20px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="w-[50px] h-[50px] rounded justify-center items-center flex"
      >
        <Image
          src={
            data.image
              ? `https://remaster-storage.s3.ap-south-1.amazonaws.com/images/track/${data.image}`
              : "/music.jpg"
          }
          alt="art"
          height={0}
          width={0}
          sizes="100% 100%"
          className={`w-[50px] h-[50px] ${type === "user" ? "rounded-full" : "rounded"}`}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="w-[18rem] max-w-full group-hover:underline transition-all duration-300"
      >
        <p className="font-bold text-base leading-none mt-2 text-ellipsis overflow-hidden line-clamp-1">
          {data.name || data.username}
        </p>
        {(type === "track" || type === "album") && (
          <p className="font-bold text-sm leading-tight text-black/50 text-ellipsis overflow-hidden line-clamp-1">
            {data.artist || data.album}
          </p>
        )}
      </motion.div>
    </div>
  );
};
