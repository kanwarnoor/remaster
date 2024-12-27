"use client";

import React, { useState } from "react";
import { signUp } from "../helpers/firebase/auth";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUp(email, password);
      alert("Sign up successful");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex w-full h-screen m-auto justify-center items-center ">
      <form onSubmit={handleSignUp} className="flex flex-col w-fit h-fit gap-2">
        <h1 className="text-3xl mb-10">New to Remaster?</h1>
        <input
          type="email"
          placeholder="name@remaster.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-black border-2 rounded p-1"
        />
        <input
          type="password"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border-black border-2 rounded p-1"
        />
        <button
          type="submit"
          className="border-black border-2 rounded w-fit m-auto px-10"
        >
          Sign up
        </button>
        {error && <p className="text-red-500 m-auto">{error}</p>}
      </form>
    </div>
  );
}
