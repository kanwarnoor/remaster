import React from "react";
import Navbar from "@/components/Navbar";
import InsideNavbar from "@/components/InsideNavbar";

export default function page() {
  return (
    <div>
      <InsideNavbar link="/" />
      <div className="w-screen h-screen flex flex-col pt-16">
        <div className="w-screen h-fit flex flex-col px-20 pt-12">
          tracks
          {/* <TracksList title='Tracks' data={tracks} isLoading={false} type='tracks' /> */}
        </div>
      </div>
    </div>
  );
}
