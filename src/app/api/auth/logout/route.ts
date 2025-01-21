import { NextResponse } from "next/server";

export async function POST() {
  // Clear the cookie by setting it with an empty value and past expiration
  const response = NextResponse.json({ message: "Logged out successfully" });
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: new Date(0), // Set cookie to expire in the past
  });

  return response;
}
