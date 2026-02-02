"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import Navbar from "../../components/Navbar";
import Image from "next/image";
import Link from "next/link";

const loginUser = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => {
  const res = await axios.post("/api/auth/login", {
    username,
    password,
  });

  return res.data;
};

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();

  const [popup, setPopup] = useState<{
    show: boolean;
    message: string;
    type: "error" | "success" | "info" | "warning" | "";
  }>({ show: false, message: "", type: "" });

  const {
    mutate,
    isPending,
    error: loginError,
    isError: isLoginError,
  } = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      router.push("/");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ username, password });
  };

  return (
    <>
      <Navbar />
      <div className="grid grid-cols-2 items-center justify-center h-screen bg-black text-black">
        <div className="flex flex-col h-full items-center bg-gradient-to-r from-remaster to-remaster/50 justify-center p-16 z-10">
          <Image
            src="/remaster.png"
            alt="logo"
            width={0}
            height={0}
            sizes="100% 100%"
            className="w-full h-full object-cover"
          />
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 w-96 gap-5 flex flex-col justify-center m-auto"
        >
          <h1 className="text-5xl text-center font-bold text-white mb-5">
            Login
          </h1>
          <div className="">
            <label className="block text-white/90">username</label>
            <input
              type="text"
              className="w-full p-2 border-2 border-remaster bg-remaster/50 text-white rounded-lg"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="">
            <label className="block text-white/90">secret</label>
            <input
              type="password"
              className="w-full p-2 border-2 border-remaster bg-remaster/50 text-white rounded-lg"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isPending ? (
            <button
              type="submit"
              className="w-full bg-remaster text-white py-2 rounded-lg flex items-center justify-center"
            >
              <div className="w-6 h-6 white-spinner"></div>
            </button>
          ) : (
            <button
              type="submit"
              className="w-full bg-remaster text-white py-2 rounded-lg"
            >
              Let&apos;s go!
            </button>
          )}

          
          <p className="text-center text-gray-500 ">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-remaster">
              Sign up
            </Link>
          </p>

          {isLoginError && <p className="text-red-500 text-center">{(loginError as AxiosError<{ error: string }>)?.response?.data?.error ?? "An unknown error occurred"}</p>}
        </form>
      </div>
    </>
  );
}
