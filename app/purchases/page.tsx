import React from "react";
import Navbar from "@/components/Navbar";
import Tile from "@/components/Tile";
import { User } from "@/libs/Auth";
import prisma from "@/libs/prisma";
import { redirect } from "next/navigation";

export const metadata = { title: "Purchases" };

export default async function PurchasesPage() {
  const user = await User();
  if (!user) {
    return redirect("/login");
  }

  const purchases = await prisma.purchase.findMany({
    where: { userId: user.id, status: "PAID" },
    include: { album: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <Navbar />
      <div className="w-full min-h-screen flex flex-col pt-16">
        <h1 className="text-3xl md:text-5xl font-bold px-5 md:px-20 pt-8 md:pt-12">Purchases</h1>
        <p className="px-5 md:px-20 pt-2 text-sm opacity-60">
          Albums you have purchased.
        </p>
        <div className="w-full flex px-5 md:px-20 flex-wrap h-auto pt-6 md:pt-12 pb-40 gap-3 md:gap-4 justify-start">
          {purchases.length === 0 && (
            <p className="opacity-60">You haven&apos;t purchased any albums yet.</p>
          )}
          {purchases.map((p, index) => (
            <Tile
              key={p.id}
              title={p.album.name || ""}
              artist={p.album.artist || ""}
              index={index}
              art={
                p.album.image
                  ? `https://remaster-storage.s3.ap-south-1.amazonaws.com/images/album/${p.album.image}`
                  : "/music.jpg"
              }
              link={"/album/" + p.album.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
