"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useRouter } from "next/navigation";
import Navbar from "./Navbar";

interface User {
  username: string;
  email: string;
  id: string;
}


export default function Admin({ token }: { token: string }) {
  const router = useRouter();
  const { data, isLoading, error } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const decodedToken = jwtDecode<User>(token);
      return decodedToken;
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const logout = () => {
    const answer = confirm("Are you sure?");
    if (answer == true) {
      axios.post("/api/auth/logout");
      router.push("/");
    }
  };

  return (
    <>

      <div className="flex items-center justify-center h-screen">
        <div className="p-6 rounded-lg ">
          <h1 className="text-2xl font-bold">
            Welcome, @{data?.username} <br />
            your email is {data?.email}
          </h1>
          <button
            onClick={() => logout()}
            className="px-7 py-3 mt-3 border-white border-2 rounded-full"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
