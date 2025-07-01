"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Popup from "./Popup";
import { User, Logout } from "@/libs/Auth";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";

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

  return (
    <>
      <div className="navbar h-auto p-2 text-center fixed left-0 right-0 justify-center items-center m-auto flex font-black text-5xl select-none text-remaster z-10">
        <Link href="/">REMASTER</Link>
      </div>
      <div className="navbar h-16 pr-5 text-center fixed right-0 justify-center items-center m-auto flex font-black text-2xl select-none text-remaster z-10">
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
          <Link href="/login">Login</Link>
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
    </>
  );
}
