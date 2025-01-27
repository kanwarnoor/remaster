import React from "react";

async function fakeFetch() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("Data fetched successfully!");
    }, 3000);
  });
}

export default async function Page() {
  const data: any = await fakeFetch();

  return (
    <div className="p-4 pt-9">
      <h1 className="text-xl font-bold">Data Loaded</h1>
      <p className="text-gray-600">{data}</p>
    </div>
  );
}
