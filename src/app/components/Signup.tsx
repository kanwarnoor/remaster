"use client";

import React from "react";
import axios from "axios";
import { useState } from "react";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      axios.post("/api/register", { username, email, password });
    } catch (error) {
      console.error(error);
    }

    alert("form submit logic not written");
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <h1 className="text-3xl font-bold mb-10">Remaster is waiting...</h1>
      <form onSubmit={(e) => handleSubmit(e)} className="flex flex-col">
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border-2 rounded text-black px-2 py-2 w-[300px]"
          required
        />
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-2 rounded px-2 text-black py-2 w-[300px]"
          required
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border-2 rounded text-black px-2 py-2 w-[300px]"
          required
        />
        <button
          type="submit"
          className="px-5 py-3 backdrop-blur-xl border-2 border-white text-white w-fit m-auto rounded-full mt-5 hover:bg-white hover:text-black duration-300"
        >
          Take me there
        </button>
      </form>
      {username + email + password}
    </div>
  );
}
