"use server";

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

interface User {
  username: string;
}

export const User = async () => {
  const cookie = await cookies();
  const token = cookie.get("token");

  if (!token) {
    console.log("No token found");
    return null;
  }

  try {
    const decoded = jwt.verify(
      token.value,
      process.env.JWT_SECRET || "nimda"
    ) as User;
    return decoded;
  } catch (error) {
    console.log("Invalid token: ", error);
    return null;
  }
};

export const Logout = async () => {
  (await cookies()).set({
    name: "token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
  });
};
