import React from "react";
import { cookies } from "next/headers";
import Admin from "@/app/components/Admin";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return <div>Unauthorized. Please log in.</div>;
  }

  return <Admin token={token} />;
}
