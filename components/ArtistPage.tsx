"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { getPaletteSync } from "colorthief";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import ResizeImage from "@/libs/ResizeImage";
import Options from "@/components/Options";
import Tile from "@/components/Tile";
import Notification from "@/components/Notification";
import { Track, Album } from "@/app/generated/prisma/client";

type Artist = {
  id: string;
  username: string;
  image: string | null;
};

interface Props {
  artist: Artist;
  tracks: Track[];
  albums: Album[];
  viewer: { id: string; username: string } | null;
}

export default function ArtistPage({ artist, tracks, albums, viewer }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const imgRef = useRef<HTMLImageElement>(null);
  const [colors, setColors] = useState<[number, number, number][]>([]);
  const [options, setOptions] = useState(false);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "success" | "info" | "warning" | "";
  } | null>(null);

  const isOwner = !!viewer && viewer.id === artist.id;

  const imageUrl = artist.image
    ? `https://remaster-storage.s3.ap-south-1.amazonaws.com/images/user/${artist.image}`
    : "/music.jpg";

  const [formData, setFormData] = useState({
    username: artist.username,
    previewArt: imageUrl,
    art: null as File | null,
  });

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const img = imgRef.current;

    function getColor() {
      try {
        if (!img) return;
        const palette = getPaletteSync(img, { colorCount: 5 });
        if (palette && palette.length > 0) {
          const rgbPalette = palette.map((c) => c.array());
          setColors(rgbPalette);
        }
      } catch (err) {
        console.error("Color Thief error:", err);
        setColors([]);
      }
    }

    if (img) {
      if (img.complete) {
        getColor();
      } else {
        img.onload = getColor;
      }
    }

    return () => {
      if (img) {
        img.onload = null;
      }
    };
  }, [imageUrl]);

  const handleSave = async () => {
    try {
      const response = await axios.patch("/api/user/edit", {
        username: formData.username,
        fileType: formData.art?.type,
        fileSize: formData.art?.size,
        uploaded: false,
      });

      if (response.status !== 200) {
        setToast({ message: "Failed to update profile", type: "error" });
        return;
      }

      const { url, imageKey } = response.data;

      if (url && formData.art) {
        const imageResponse = await axios.put(url, formData.art, {
          headers: { "Content-Type": formData.art.type },
        });

        if (imageResponse.status !== 200 && imageResponse.status !== 201) {
          setToast({ message: "Image failed to upload", type: "error" });
          return;
        }

        const saveResponse = await axios.patch("/api/user/edit", {
          username: formData.username,
          uploaded: true,
          newKey: imageKey,
          oldKey: artist.image || null,
        });

        if (saveResponse.status !== 200) {
          setToast({ message: "Failed to save image", type: "error" });
          return;
        }
      }

      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      router.refresh();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setToast({
          message: err.response.data.error || "Username taken",
          type: "error",
        });
      } else {
        setToast({ message: "Failed to update profile", type: "error" });
      }
    }
  };

  const list = [
    {
      name: "Edit",
      handleOption: () => {
        setEditing(true);
        setOptions(false);
      },
    },
  ];

  return (
    <div className="w-screen min-h-screen pt-10 text-center select-none pb-40">
      <div
        className="absolute top-0 w-screen -z-10 h-[500px]"
        style={
          colors.length >= 1
            ? {
                backgroundImage: `linear-gradient(to bottom,
              rgba(${colors[0].join(",")}, 0.7) 5%,
              rgba(0, 0, 0, 1) 100%, rgb(0, 0, 0) 100%`,
              }
            : {}
        }
      ></div>

      {toast && <Notification message={toast.message} type={toast.type} />}

      {editing && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-10"
            onClick={() => setEditing(false)}
          ></div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed w-[90vw] max-w-[560px] md:w-fit md:h-80 bg-white/50 backdrop-blur-lg rounded-xl z-10 top-0 bottom-0 left-0 right-0 m-auto flex flex-col md:flex-row justify-start items-center p-5 md:px-10 overflow-y-auto max-h-[90vh]"
          >
            <div className="w-40 h-40 md:w-56 md:h-56 shrink-0 flex justify-center items-center rounded-full overflow-hidden group relative">
              <div className="absolute rounded-full bg-black/0 w-full h-full group-hover:bg-black/70 transition-all cursor-pointer justify-center items-center flex">
                <p className="text-xl font-bold text-white hidden group-hover:flex transition-all">
                  Edit
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const resizedFile = await ResizeImage(file, 800);
                      const url = URL.createObjectURL(resizedFile);
                      setFormData({
                        ...formData,
                        previewArt: url,
                        art: resizedFile,
                      });
                    }
                  }}
                  className="absolute w-full h-full left-0 bottom-0 cursor-pointer opacity-0"
                />
              </div>
              <Image
                src={formData.previewArt || "/music.jpg"}
                height={0}
                width={0}
                sizes="100% 100%"
                alt=""
                priority
                className="w-full h-full flex transition rounded-full object-cover"
              />
            </div>

            <form
              className="mt-4 md:mx-5 md:mt-0 w-full flex h-full flex-col text-left md:pt-16 md:pb-12"
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <label htmlFor="username" className="text-sm">
                Username
              </label>
              <input
                type="text"
                id="username"
                className="bg-white/0 border-2 select-none rounded-lg h-10 text-white px-3 focus:ring-0 focus:outline-none"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />

              <div className="flex text-left mt-auto">
                <button
                  type="submit"
                  className="text-left flex mt-auto px-7 py-2 bg-black backdrop-blur-xl rounded-full text-base"
                >
                  Save
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}

      <div className="rounded mx-5 md:mx-20 mt-10 md:mt-10 flex flex-col md:flex-row justify-left text-left md:h-80 gap-5 md:gap-0">
        <motion.div
          initial={{ opacity: 0, filter: "blur(20px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="w-48 h-48 sm:w-64 sm:h-64 md:min-w-80 md:h-80 md:w-80 -z-10 flex mx-auto md:mx-0"
        >
          <Image
            src={imageUrl}
            height={0}
            width={0}
            sizes="100% 100%"
            alt="Artist"
            priority
            onError={(e) => {
              e.currentTarget.src = "/music.jpg";
            }}
            className="w-full h-full transition rounded-full object-cover"
          />
          <img
            ref={imgRef}
            src={imageUrl}
            crossOrigin="anonymous"
            style={{ display: "none" }}
            alt="color-thief-img"
            onError={(e) => {
              e.currentTarget.src = "/music.jpg";
            }}
          />
        </motion.div>
        <div className="w-full sm:px-5 md:px-0">
          <div className="w-full md:h-[65%] text-ellipsis md:ml-10 justify-center flex flex-col">
            <p className="text-[10px] md:text-sm font-bold opacity-60">
              Artist
            </p>
            <p className="text-2xl md:text-5xl font-bold text-ellipsis overflow-hidden line-clamp-2 md:pb-1">
              {artist.username}
            </p>
          </div>
          <div className="w-full md:pl-10 md:h-[35%] flex items-end mt-4 md:mt-0">
            {isOwner && (
              <div
                className="justify-end ml-auto flex cursor-pointer"
                onClick={() => setOptions(!options)}
              >
                Edit
              </div>
            )}
          </div>
          {options && (
            <>
              <div
                className="fixed inset-0 z-0"
                onClick={() => setOptions(false)}
              ></div>
              <Options list={list} />
            </>
          )}
        </div>
      </div>

      <div className="w-full flex flex-col text-left px-5 md:px-20 pt-10 md:pt-14">
        <h2 className="text-2xl md:text-3xl font-bold">Latest Tracks</h2>
        <div className="w-full flex flex-wrap h-auto pt-5 md:pt-8 gap-3 md:gap-4 justify-start">
          {tracks.length === 0 && (
            <p className="text-white/50 text-sm md:text-base">
              No public tracks yet.
            </p>
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
      </div>

      <div className="w-full flex flex-col text-left px-5 md:px-20 pt-10 md:pt-14">
        <h2 className="text-2xl md:text-3xl font-bold">Latest Albums</h2>
        <div className="w-full flex flex-wrap h-auto pt-5 md:pt-8 gap-3 md:gap-4 justify-start">
          {albums.length === 0 && (
            <p className="text-white/50 text-sm md:text-base">
              No public albums yet.
            </p>
          )}
          {albums.map((album, index) => (
            <Tile
              key={album.id}
              title={album.name || ""}
              artist={album.artist || ""}
              index={index}
              art={
                album.image
                  ? `https://remaster-storage.s3.ap-south-1.amazonaws.com/images/album/${album.image}`
                  : "/music.jpg"
              }
              link={"/album/" + album.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
