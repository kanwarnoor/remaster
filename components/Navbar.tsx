"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Popup from "./Popup";
import { User, Logout } from "@/libs/Auth";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Search from "./Search";

export default function Navbar() {
  const [popup, setPopup] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  // Fetch user data
  const { data: currentUser } = useQuery({
    queryKey: ["user"],
    queryFn: async () => await User(),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => await Logout(),
    onSuccess: () => {
      queryClient.resetQueries({ queryKey: ["user"] });
      queryClient.resetQueries({ queryKey: ["userTracks"] });
      setPopup(false);
    },
  });

  const [scroll, setScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScroll(window.scrollY > 100 ? true : false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="fixed bg-blue-200 z-20">
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

        <div className="fixed left-0 right-0 flex justify-center items-center p-2 h-16">
          <div className="">
            <Search />
          </div>
        </div>

        <div className="navbar h-16 pr-5 text-center fixed right-0 justify-center items-center m-auto flex font-black text-2xl select-none text-remaster z-50">
          {currentUser ? (
            <>
              <button
                className="ml-2 text-white cursor-pointer flex items-center gap-1 bg-neutral-800/50 rounded-full px-2 py-1 mr-2 hover:bg-white/80 hover:text-black transition-all duration-100"
                onClick={() => router.push("/upload")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="mr-1">Add</p>
              </button>
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
