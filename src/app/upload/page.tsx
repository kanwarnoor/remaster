import React from "react";
import Tile from "@/app/components/Tile";

async function fakeFetch() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("Data loaded!");
    }, 3000);
  });
}

export default async function Page() {
  const data : any = await fakeFetch();

  return (
    <div className="h-screen w-screen flex flex-row justify-center items-center m-auto">
      <div className="flex flex-row justify-center items-center gap-10">
        <Tile title={"untitled"} artist={"unknown"} />
        <Tile title={"untitled"} artist={"unknown"} />
        <Tile title={"untitled"} artist={"unknown"} />
      </div>
    </div>
  );
}
