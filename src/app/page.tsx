"use client";

import React, { useEffect, useState } from "react";
import Loader from "@/app/components/Loader";
import { motion } from "framer-motion";
import Tile from "./components/Tile";
import Upload from "./components/Upload";
import { useRouter } from "next/navigation";

export default function page() {
  const tracks = 0;
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  });

  const router = useRouter();

  const handleUpload = () => {
    router.push("/upload");
  };
  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="w-screen h-screen flex justify-center items-center ">
            <Upload click={handleUpload} />
          </div>{" "}
        </>
      )}
    </>
  );
}
