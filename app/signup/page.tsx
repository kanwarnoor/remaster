"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import Navbar from "../../components/Navbar";
import Image from "next/image";
import Link from "next/link";
import Signup from "../../components/Signup";
import prisma from "@/libs/prisma";

export default function Page() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [invite, setInvite] = useState("");

  const {
    mutate: verifyInvite,
    isPending: isVerifyPending,
    error: verifyError,
    isError: isVerifyError,
    isSuccess: isVerifySuccess,
  } = useMutation({
    mutationFn: (code: string) => axios.get(`/api/invite?code=${code}`),
    onSuccess: (data) => {
      setInvite(data.data);
    },
  });

  return (
    <>
      <Navbar />
      <div className="grid grid-cols-2 items-center justify-center h-screen">
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

        <div className="flex flex-col items-center justify-center gap-5 ">
          <form
            className="p-6 w-96 gap-5 flex flex-col justify-center m-auto"
            onSubmit={(e) => {
              e.preventDefault();
              verifyInvite(invite);
            }}
          >
            <div className="flex flex-col items-center justify-center gap-2 mb-5">
              <h1 className="text-5xl text-center font-bold text-white ">
                Remaster your music!
              </h1>
              <p className="text-center text-gray-500">
                Create an account to get started
              </p>
            </div>
            {!isVerifySuccess && (
              <>
                <div className="">
                  <label className="block text-white/90 ">invite code</label>
                  <input
                    type="text"
                    className="w-full p-2 border-2 border-remaster text-white bg-remaster/50 rounded-lg"
                    id="invite code"
                    value={invite}
                    onChange={(e) => setInvite(e.target.value)}
                    required
                  />
                </div>

                {isVerifyPending ? (
                  <button
                    type="submit"
                    className="w-full bg-remaster text-white py-2 rounded-lg flex items-center justify-center"
                  >
                    <div className="w-6 h-6 white-spinner"></div>
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-remaster text-white py-2 rounded-lg cursor-pointer"
                  >
                    Verify
                  </button>
                )}
                <p className="text-center text-gray-500 ">
                  you cannot sign up without an invite code! <br />
                  contact{" "}
                  <Link
                    href="https://instagram.com/wellitsnoor"
                    className="text-remaster"
                    target="_blank"
                  >
                    @wellitsnoor
                  </Link>
                </p>
                {isVerifyError && (
                  <p className="text-red-500 text-center">
                    {" "}
                    {(verifyError as AxiosError<{ error: string }>)?.response
                      ?.data?.error ?? "Something went wrong"}
                  </p>
                )}
              </>
            )}

            {isVerifySuccess && (
              <>
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
                  <label className="block text-white/90">email</label>
                  <input
                    type="text"
                    className="w-full p-2 border-2 border-remaster bg-remaster/50 text-white rounded-lg"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="">
                  <label className="block text-white/90 ">password</label>
                  <input
                    type="password"
                    className="w-full p-2 border-2 border-remaster text-white bg-remaster/50 rounded-lg"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {false ? (
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

                {/* {error && <p className="text-red-500">{error}</p>} */}
                <p className="text-center text-gray-500 ">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="text-remaster">
                    Sign up
                  </Link>
                </p>
              </>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
