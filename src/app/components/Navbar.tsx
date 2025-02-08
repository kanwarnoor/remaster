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
      queryClient.invalidateQueries({ queryKey: ["user"] }); // Refetch user after logout
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
