"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import Navbar from "../../components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const {
    mutate: verifyInvite,
    isPending: isVerifyPending,
    error: verifyError,
    isError: isVerifyError,
    isSuccess: isVerifySuccess,
  } = useMutation({
    mutationFn: (code: string) => axios.get(`/api/invite?code=${code}`),
  });

  const {
    mutate: signup,
    isPending: isSignupPending,
    error: signupError,
    isError: isSignupError,
  } = useMutation({
    mutationFn: (data: {
      username: string;
      email: string;
      password: string;
      inviteCode: string;
    }) => axios.post("/api/auth/signup", data),
    onSuccess: () => {
      router.push("/");
    },
  });

  const passwordsMatch = password === verifyPassword;

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerifySuccess) {
      verifyInvite(inviteCode);
      return;
    }
    if (!passwordsMatch) return;
    signup({ username, email, password, inviteCode });
  };

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
            onSubmit={handleSignup}
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
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
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
                    type="email"
                    className="w-full p-2 border-2 border-remaster bg-remaster/50 text-white rounded-lg"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="">
                  <label className="block text-white/90 ">password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full p-2 border-2 border-remaster text-white bg-remaster/50 rounded-lg pr-10"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="">
                  <label className="block text-white/90 ">verify password</label>
                  <div className="relative">
                    <input
                      type={showVerifyPassword ? "text" : "password"}
                      className={`w-full p-2 border-2 text-white bg-remaster/50 rounded-lg pr-10 ${
                        verifyPassword && !passwordsMatch
                          ? "border-red-500"
                          : "border-remaster"
                      }`}
                      id="verify-password"
                      value={verifyPassword}
                      onChange={(e) => setVerifyPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white cursor-pointer"
                      onClick={() => setShowVerifyPassword(!showVerifyPassword)}
                    >
                      {showVerifyPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {verifyPassword && !passwordsMatch && (
                    <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
                  )}
                </div>

                {isSignupPending ? (
                  <button
                    type="submit"
                    className="w-full bg-remaster text-white py-2 rounded-lg flex items-center justify-center"
                  >
                    <div className="w-6 h-6 white-spinner"></div>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!passwordsMatch || !verifyPassword}
                    className="w-full bg-remaster text-white py-2 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Let&apos;s go!
                  </button>
                )}

                {isSignupError && (
                  <p className="text-red-500 text-center">
                    {(signupError as AxiosError<{ error: string }>)?.response
                      ?.data?.error ?? "Something went wrong"}
                  </p>
                )}
                <p className="text-center text-gray-500 ">
                  Have an account? {" "}
                  <Link href="/login" className="text-remaster">
                    Login
                  </Link>
                </p>

                {inviteCode && (
                  <p className="text-center text-white/70">
                    Invite code: {inviteCode}
                  </p>
                )}
              </>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
