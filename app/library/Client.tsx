"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import {
  Track,
  Album,
  Playlist,
  Purchase,
} from "@/app/generated/prisma/client";
import Tile from "@/components/Tile";

interface Props {
  purchases: (Purchase & { album: Album })[];
  tracks: Track[];
  albums: Album[];
  playlists: Playlist[];
}

export default function Client({
  purchases,
  tracks,
  albums,
  playlists,
}: Props) {
  return (
    <div>
      <Navbar />
      <div className="w-full min-h-screen flex flex-col pt-16 ">
        <h1 className="text-3xl md:text-5xl font-bold px-5 md:px-25 pt-8 md:pt-12">
          Your Library
        </h1>

        {purchases.length > 0 && (
          <section className="px-5 md:px-25 pt-6 md:pt-12">
            <h2 className="text-xl md:text-2xl font-bold mb-4">Purchases</h2>
            <div className="w-full flex flex-wrap gap-3 md:gap-4">
              {purchases.map((purchase, index) => (
                <Tile
                  key={purchase.id}
                  title={purchase.album.name}
                  artist={purchase.album.artist}
                  index={index}
                  currency={purchase.album.currency}
                  art={
                    purchase.album.image
                      ? `https://remaster-storage.s3.ap-south-1.amazonaws.com/images/album/${purchase.album.image}`
                      : "/music.jpg"
                  }
                  link={"/album/" + purchase.album.id}
                />
              ))}
            </div>
          </section>
        )}

        {albums.length > 0 && (
          <section className="px-5 md:px-25 pt-6 md:pt-12">
            <h2 className="text-xl md:text-2xl font-bold mb-4">Albums</h2>
            <div className="w-full flex flex-wrap gap-3 md:gap-4">
              {albums.map((album, index) => (
                <Tile
                  key={album.id}
                  title={album.name}
                  artist={album.artist}
                  index={index}
                  currency={album.currency}
                  art={
                    album.image
                      ? `https://remaster-storage.s3.ap-south-1.amazonaws.com/images/album/${album.image}`
                      : "/music.jpg"
                  }
                  link={"/album/" + album.id}
                />
              ))}
            </div>
          </section>
        )}

        {playlists.length > 0 && (
          <section className="px-5 md:px-25 pt-6 md:pt-12">
            <h2 className="text-xl md:text-2xl font-bold mb-4">Playlists</h2>
            <div className="w-full flex flex-wrap gap-3 md:gap-4">
              {playlists.map((playlist, index) => (
                <Tile
                  key={playlist.id}
                  title={playlist.name}
                  artist={""}
                  index={index}
                  art={
                    playlist.image
                      ? `https://remaster-storage.s3.ap-south-1.amazonaws.com/images/playlist/${playlist.image}`
                      : "/music.jpg"
                  }
                  link={"/playlist/" + playlist.id}
                />
              ))}
            </div>
          </section>
        )}

        {tracks && (
          <section className="px-5 md:px-25 pt-6 md:pt-12 pb-40">
            <h2 className="text-xl md:text-2xl font-bold mb-4">Tracks</h2>
            <div className="w-full flex flex-wrap gap-3 md:gap-4">
              {tracks.length <= 0 && (
                <>
                  <Tile
                    key={"upload"}
                    title={"Upload a track"}
                    artist={""}
                    index={0}
                    art={"/music.jpg"}
                    link={"/upload"}
                    upload={true}
                  />
                </>
              )}
              {tracks.map((track, index) => (
                <Tile
                  key={track.id}
                  title={track.name || ""}
                  artist={track.artist || ""}
                  index={index}
                  art={
                    track.image
                      ? `https://remaster-storage.s3.ap-south-1.amazonaws.com/images/track/${track.image}`
                      : "/music.jpg"
                  }
                  link={"/single/" + track.id}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
