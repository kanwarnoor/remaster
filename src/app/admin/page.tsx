"use client";

import React from "react";
import { useState } from "react";
import axios from "axios";

export default function page() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.post("/api/login", {
        username: username,
        password: password,
      });
      alert("token " + response.data.token);
      setError("");
    } catch (error: any) {
      console.error(error);
      setError(error.message);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center w-full h-full">
        <h1>Admin login</h1>
        <form onSubmit={(e) => handleSubmit(e)} className="flex flex-col ">
          <label htmlFor="username">email/username</label>
          <input
            type="text"
            value={username}
            className="text-black"
            required
            onChange={(e) => setUsername(e.target.value)}
          />
          <label htmlFor="username">password</label>
          <input
            type="password"
            value={password}
            className="text-black"
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Submit</button>
        </form>
      </div>
    </>
  );
}
