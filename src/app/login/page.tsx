"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post("/api/auth/login", {
        identifier,
        password,
      });
      
      if(res.status == 200){
        Cookies.set("token", res.data.token);
        router.push("/admin");
      }
    } catch (error: any) {
      if (error.response) {
        setError(error.response.data.error || "Login failed.");
      } else if (error.request) {
        setError("No response from the server. Please try again.");
      } else {
        setError(error.message || "An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 text-black">
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-white rounded-lg shadow-md w-96"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Login</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-700">Username or Email</label>
          <input
            type="text"
            className="w-full p-2 border rounded-lg"
            id="username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            className="w-full p-2 border rounded-lg"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg"
        >
          Login
        </button>
      </form>
    </div>
  );
}
