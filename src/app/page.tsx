"use client";

import React, { useEffect, useState } from "react";
import TextLoader from "@/app/components/TextLoader";
import { motion } from "framer-motion";
import Tile from "./components/Tile";

export default function page() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 0);
  });
  return <>{loading ? <TextLoader /> : <> <div></div> </>}</>;
}
