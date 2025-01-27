import React from "react";
import TextLoader from "../components/TextLoader";

export default function loading() {
  return (
    <div className="w-screen h-screen bg-red-200">
      <TextLoader />
    </div>
  );
}
