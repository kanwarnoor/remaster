import React from "react";
import Link from "next/link";


export default function page() {
  return (
    <div className="flex flex-col">
      <Link href="/login" className="underline">Login</Link>
      <Link href="/signup" className="underline">Sign Up</Link>
    </div>
  );
}
