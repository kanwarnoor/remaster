"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

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
  const [error, setError] = useState("");
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      router.push("/");
    },
    onError: (error: any) => {
      setError(error.response.data.error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    mutate({ username, password });
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
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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

        {isPending ? (
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg flex items-center justify-center"
          >
            <div className="w-6 h-6 white-spinner"></div>
          </button>
        ) : (
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg"
          >
            Login
          </button>
        )}
      </form>
    </div>
  );
}
