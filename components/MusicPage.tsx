"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
// import ColorThief from "colorthief";
import { getPaletteSync } from "colorthief";

import Options from "@/components/Options";
import axios from "axios";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import ResizeImage from "@/libs/ResizeImage";
import Switch from "@/components/Switch";
import { usePlayer } from "@/context/PlayerContext";
import { useRouter } from "next/navigation";
import { Track, Album, Playlist } from "@/app/generated/prisma/client";
import { AlbumTracks } from "@/app/generated/prisma/client";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { generateKeyBetween } from "fractional-indexing";

type AlbumMode = {
  mode: "album";
  data: {
    album: Album;
    tracks: Track[];
  };
  user?: { id: string };
  toggleVisibility?: () => void;
  likedTrackIds?: string[];
};

type SingleMode = {
  mode: "single";
  data: {
    track: {
      id: string;
      name: string;
      artist: string;
      duration: number;
      art: string;
      timestamps: string[];
      visibility: string;
      userId: string;
      createdAt: string;
      image: string;
      album: string;
    };
  };
  user: { id: string; username: string };
  playing: boolean;
  setPlaying: (id: string, playing: boolean) => void;
  setData: (data: Track) => void;
  toggleVisibility: () => void;
};

type PlaylistMode = {
  mode: "playlist";
  data: {
    playlist: Playlist;
    tracks: Track[];
  };
  user?: { id: string };
  likedTrackIds?: string[];
};

type Props = AlbumMode | SingleMode | PlaylistMode;

export default function MusicPage(props: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [options, setOptions] = useState(false);
  const [activeTrackOptions, setActiveTrackOptions] = useState<string | null>(
    null,
  );
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [trackFormData, setTrackFormData] = useState<{
    name: string;
    artist: string;
  }>({ name: "", artist: "" });
  const imgRef = useRef<HTMLImageElement>(null);
  const [editing, setEditing] = useState(false);
  const [addAlbum, setAddAlbum] = useState(false);
  const [colors, setColors] = useState<[number, number, number][]>([]);
  const isAlbum = props.mode === "album";
  const isPlaylist = props.mode === "playlist";
  const isList = isAlbum || isPlaylist;
  const isSingle = props.mode === "single";

  const [localTracks, setLocalTracks] = useState<(Track & { sort?: string })[]>(
    isList ? (props.data.tracks ?? []) : [],
  );
  const [likedIds, setLikedIds] = useState<Set<string>>(
    new Set(isList ? (props.likedTrackIds ?? []) : []),
  );

  const toggleLike = async (trackId: string) => {
    try {
      const res = await axios.post("/api/tracks/like", { trackId });
      if (res.status === 200) {
        setLikedIds((prev) => {
          const next = new Set(prev);
          if (res.data.liked) {
            next.add(trackId);
          } else {
            next.delete(trackId);
          }
          return next;
        });
      }
    } catch (error) {
      console.error("Failed to toggle like", error);
    }
  };

  const handleToggleVisibility = async () => {
    if (!isAlbum) return;
    const visibility =
      props.data.album.visibility === "PRIVATE" ? "PUBLIC" : "PRIVATE";
    try {
      const res = await axios.put(
        `/api/album/toggle_visibility?id=${itemId}&visibility=${visibility}`,
      );
      if (res.status !== 200) {
        throw new Error("Failed to toggle visibility");
      }
      queryClient.invalidateQueries({ queryKey: ["album", itemId] });
    } catch (error) {
      console.error("Error toggling visibility:", error);
    }
  };

  // Normalized accessors
  const source = isAlbum
    ? props.data.album
    : isPlaylist
      ? props.data.playlist
      : props.data.track;
  const itemId = source.id;
  const itemName = source.name;
  const itemArtist = isAlbum ? props.data.album.artist : isPlaylist ? null : props.data.track.artist;
  const itemImage = source.image;
  const itemUserId = source.userId;
  const itemCreatedAt = source.createdAt;
  const imagePrefix = isPlaylist ? "images/playlist" : "images/track";

  const date = new Date(itemCreatedAt);
  const createdAt = `${date.toLocaleString("default", {
    month: "long",
  })} ${date.getDate()}, ${date.getFullYear()}`;

  const playerCtx = usePlayer();

  const [formData, setFormData] = useState({
    name: itemName,
    artist: itemArtist,
    previewArt: itemImage
      ? `https://remaster-storage.s3.ap-south-1.amazonaws.com/${imagePrefix}/${itemImage}`
      : null,
    art: null as File | null,
  });

  // Albums query (single mode only)
  const { data: albums = [], isLoading: albumsLoading } = useQuery({
    queryKey: ["albums"],
    queryFn: async () => {
      const album = await axios.get("/api/album");
      return album.data.album || [];
    },
    enabled: isSingle && !!props.user && addAlbum,
  });

  const handleOption = async (option: string) => {
    setOptions(false);

    if (option === "delete") {
      const typeWord = isAlbum ? "album" : isPlaylist ? "playlist" : "track";
      const confirmDelete = confirm(
        `Are you sure you want to delete this ${typeWord}?`,
      );
      if (!confirmDelete) return;

      if (isAlbum) {
        const response = await axios.delete("/api/album/delete", {
          data: { id: itemId },
        });
        if (response.status !== 200) {
          console.error("Failed to delete album");
        } else {
          window.location.href = "/";
        }
      } else if (isPlaylist) {
        const response = await axios.delete("/api/playlist/delete", {
          data: { id: itemId },
        });
        if (response.status !== 200) {
          console.error("Failed to delete playlist");
        } else {
          window.location.href = "/";
        }
      } else {
        const response = await axios.delete(`/api/tracks/delete_track`, {
          data: { id: itemId },
        });
        if (response.status !== 200) {
          console.error("Failed to delete track");
        } else {
          window.location.href = "/";
        }
      }
    }

    if (option === "toggleEdit") {
      setEditing(true);
      setOptions(false);
      return;
    }

    if (option === "edit") {
      setEditing(false);

      if (isAlbum) {
        const response = await axios.patch("/api/album/edit", {
          id: itemId,
          name: formData.name,
          artist: formData.artist,
          fileType: formData.art?.type,
          fileSize: formData.art?.size,
          uploaded: false,
        });

        if (response.status !== 200) {
          console.error("Failed to edit album");
          return;
        }

        queryClient.invalidateQueries({ queryKey: ["album", itemId] });

        const { url, imageKey } = response.data;
        if (!url) return;

        const file = formData.art;
        if (!file) return;

        const imageResponse = await axios.put(url, file, {
          headers: { "Content-Type": file.type },
        });

        if (imageResponse.status !== 200 && imageResponse.status !== 201) {
          console.error("Image failed to upload to S3");
          return;
        }

        const saveImageResponse = await axios.patch("/api/album/edit", {
          id: itemId,
          name: formData.name,
          artist: formData.artist,
          uploaded: true,
          newKey: imageKey,
          oldKey: itemImage || null,
        });

        if (saveImageResponse.status !== 200) {
          console.error("Failed to save image key");
          return;
        }

        queryClient.invalidateQueries({ queryKey: ["album", itemId] });
      } else {
        const response = await axios.patch(`/api/tracks/edit_track`, {
          id: itemId,
          name: formData.name,
          artist: formData.artist,
          fileType: formData.art && formData.art.type,
          fileSize: formData.art && formData.art.size,
          uploaded: false,
        });

        if (response.status !== 200) {
          console.error("Failed to edit track");
        } else {
          queryClient.invalidateQueries({ queryKey: ["single", itemId] });
          const { url, imageKey } = response.data;

          if (!url) return;
          const file = formData.art;
          if (!file) return;

          const imageResponse = await axios.put(url, file, {
            headers: { "Content-Type": file.type },
          });

          if (imageResponse.status !== 200 && imageResponse.status !== 201) {
            console.log("Image failed to upload");
            return;
          }

          const imageUploadSaveResponse = await axios.patch(
            "/api/tracks/edit_track",
            {
              uploaded: true,
              id: itemId,
              newKey: imageKey,
              oldKey: itemImage || null,
            },
          );

          if (imageUploadSaveResponse.status !== 200) {
            console.log("Failed to upload");
            return;
          }

          queryClient.invalidateQueries({ queryKey: ["single", itemId] });
        }
      }
    }

    if (option === "album" && isSingle) {
      setAddAlbum(true);
    }
  };

  const addTrackToAlbum = async (albumId: string, alreadyInAlbum: boolean) => {
    if (!isSingle) return;
    try {
      if (alreadyInAlbum) {
        const response = await axios.post("/api/album/remove", {
          albumId,
          trackId: props.data.track.id,
        });
        if (response.status !== 200) {
          console.error("Failed to remove track from album");
        } else {
          queryClient.invalidateQueries({ queryKey: ["albums"] });
        }
      } else {
        const response = await axios.post("/api/album/add", {
          albumId,
          trackId: props.data.track.id,
        });
        if (response.status !== 200) {
          console.error("Failed to add track to album");
        } else {
          queryClient.invalidateQueries({ queryKey: ["albums"] });
        }
      }
    } catch (error) {
      console.error("Failed to toggle track in album", error);
    }
  };

  const handleAlbum = async () => {
    if (!isSingle) return;
    setAddAlbum(false);

    try {
      const response = await axios.post("/api/album", {
        track_ids: [props.data.track.id],
        name: props.data.track.name,
        image: props.data.track.image,
        artist: props.data.track.artist,
      });

      if (response.status !== 200) {
        console.error("Failed to add track to album");
      } else {
        queryClient.invalidateQueries({ queryKey: ["albums"] });
        setAddAlbum(false);
        router.push(`/album/${response.data.album.id}`);
      }
    } catch (error) {
      console.error("Failed to add track to album");
    }
  };

  const list = isSingle
    ? [
        { name: "Edit", handleOption: () => handleOption("toggleEdit") },
        { name: "Album", handleOption: () => handleOption("album") },
        {
          name: "Delete",
          danger: true,
          handleOption: () => handleOption("delete"),
        },
      ]
    : [
        { name: "Edit", handleOption: () => handleOption("toggleEdit") },
        {
          name: "Delete",
          danger: true,
          handleOption: () => handleOption("delete"),
        },
      ];

  const getTrackOptionsList = (trackId: string) => [
    {
      name: "Edit",
      handleOption: () => {
        const track = isList
          ? localTracks.find((t) => t.id === trackId)
          : props.data.track;
        if (track) {
          setTrackFormData({
            name: track.name || "",
            artist: track.artist || "",
          });
          setEditingTrackId(trackId);
        }
        setActiveTrackOptions(null);
      },
    },
    ...(isAlbum
      ? [
          {
            name: "Remove from Album",
            handleOption: async () => {
              setActiveTrackOptions(null);
              const confirmRemove = confirm(
                "Remove this track from the album?",
              );
              if (!confirmRemove) return;
              try {
                const response = await axios.post("/api/album/remove", {
                  albumId: props.data.album.id,
                  trackId,
                });
                if (response.status === 200) {
                  setLocalTracks((prev) =>
                    prev.filter((t) => t.id !== trackId),
                  );
                  queryClient.invalidateQueries({
                    queryKey: ["album", itemId],
                  });
                }
              } catch (error) {
                console.error("Failed to remove track from album", error);
              }
            },
          },
        ]
      : isPlaylist
        ? [
            {
              name: "Remove from Playlist",
              handleOption: async () => {
                setActiveTrackOptions(null);
                const confirmRemove = confirm(
                  "Remove this track from the playlist?",
                );
                if (!confirmRemove) return;
                try {
                  const response = await axios.post("/api/playlist/remove", {
                    playlistId: props.data.playlist.id,
                    trackId,
                  });
                  if (response.status === 200) {
                    setLocalTracks((prev) =>
                      prev.filter((t) => t.id !== trackId),
                    );
                  }
                } catch (error) {
                  console.error("Failed to remove track from playlist", error);
                }
              },
            },
          ]
        : []),
    {
      name: "Delete Track",
      danger: true,
      handleOption: async () => {
        setActiveTrackOptions(null);
        const confirmDelete = confirm(
          "Are you sure you want to permanently delete this track?",
        );
        if (!confirmDelete) return;
        try {
          const response = await axios.delete("/api/tracks/delete_track", {
            data: { id: trackId },
          });
          if (response.status === 200) {
            setLocalTracks((prev) => prev.filter((t) => t.id !== trackId));
            queryClient.invalidateQueries({ queryKey: ["album", itemId] });
          }
        } catch (error) {
          console.error("Failed to delete track", error);
        }
      },
    },
  ];

  const handleTrackEdit = async () => {
    if (!editingTrackId) return;
    try {
      const response = await axios.patch("/api/tracks/edit_track", {
        id: editingTrackId,
        name: trackFormData.name,
        artist: trackFormData.artist,
        uploaded: false,
      });
      if (response.status === 200) {
        setLocalTracks((prev) =>
          prev.map((t) =>
            t.id === editingTrackId
              ? { ...t, name: trackFormData.name, artist: trackFormData.artist }
              : t,
          ),
        );
        queryClient.invalidateQueries({ queryKey: ["album", itemId] });
        setEditingTrackId(null);
      }
    } catch (error) {
      console.error("Failed to edit track", error);
    }
  };

  useEffect(() => {
    const img = imgRef.current;

    function getColor() {
      try {
        if (!img) return;
        // const colorThief = new ColorThief();

        const palette = getPaletteSync(img, { colorCount: 5 });
        if (palette && palette.length > 0) {
          const rgbPalette = palette.map((c) => c.array());
          setColors(rgbPalette);

          // Don't set player color here — Player.tsx handles its own colors
          // based on the currently playing track.
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
  }, [itemImage, isList ? null : playerCtx.data]);

  function formatTime(seconds: number) {
    seconds = Math.floor(seconds);
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(
        2,
        "0",
      )}`;
    } else {
      return `${mins}:${String(secs).padStart(2, "0")}`;
    }
  }

  // Sync localTracks when album/playlist data refreshes (e.g. after query invalidation)
  useEffect(() => {
    if (isList) {
      setLocalTracks(props.data.tracks ?? []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isList ? props.data.tracks : null]);

  const isOwner = !!props.user && props.user.id === itemUserId;
  const isDefaultPlaylist = isPlaylist && props.data.playlist.default;

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !isAlbum) return;
    const src = result.source.index;
    const dst = result.destination.index;
    if (src === dst) return;

    const newList = [...localTracks];
    const [moved] = newList.splice(src, 1);
    newList.splice(dst, 0, moved);

    const before =
      (newList[dst - 1] as Track & { sort?: string })?.sort ?? null;
    const after = (newList[dst + 1] as Track & { sort?: string })?.sort ?? null;
    const newSort = generateKeyBetween(before, after);

    newList[dst] = { ...moved, sort: newSort };
    setLocalTracks(newList);

    axios
      .patch("/api/album/sort", {
        albumId: props.data.album.id,
        trackId: moved.id,
        sort: newSort,
      })
      .catch(console.error);
  };

  // Build tracks list for the tracklist section
  const tracksList = isList ? localTracks : [props.data.track];

  const imageUrl = itemImage
    ? `https://remaster-storage.s3.ap-south-1.amazonaws.com/${imagePrefix}/${itemImage}`
    : "/music.jpg";

  const typeLabel = isAlbum
    ? "Album"
    : isPlaylist
      ? "Playlist"
      : props.data.track.album != null
        ? "Album"
        : "Single";

  return (
    <div className="w-screen min-h-screen pt-10 text-center select-none ">
      <div
        className="absolute top-0 w-screen -z-10  h-[500px]"
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

      {/* Edit modal */}
      {editing && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-10"
            onClick={() => setEditing(false)}
          ></div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute w-fit h-[20rem] bg-white/50 backdrop-blur-lg rounded-xl z-10 top-0 bottom-0 left-0 right-0 m-auto flex justify-start items-center px-10"
          >
            <div className=" w-56 h-56 flex justify-center items-center rounded-lg overflow-hidden group">
              <div className="absolute rounded-lg bg-black/0 w-56 h-56  group-hover:bg-black/70 transition-all cursor-pointer justify-center items-center flex">
                <p className="text-xl font-bold text-whtie hidden group-hover:flex transition-all">
                  Edit
                </p>

                <input
                  type="file"
                  accept="image/*"
                  name=""
                  id=""
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
                className="w-56 h-56 flex transition rounded"
              />
            </div>

            <form
              className="mx-5 flex h-full flex-col text-left pt-16 pb-12"
              onSubmit={() => handleOption("edit")}
            >
              <label htmlFor="title" className="text-sm">
                Name
              </label>
              <input
                type="text"
                name="title"
                id="title"
                className="bg-white/0 border-2 select-none rounded-lg h-[2.5rem] text-white px-3  focus:ring-0 focus:outline-none"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <label htmlFor="title" className="text-sm mt-1">
                Artist
              </label>
              <input
                type="text"
                id="artist"
                className="bg-white/0 border-2 select-none rounded-lg h-[2.5rem] text-white px-[0.5rem] focus:ring-0 focus:outline-none"
                value={formData.artist || ""}
                onChange={(e) =>
                  setFormData({ ...formData, artist: e.target.value })
                }
              />

              <div className="flex mt-2 items-center ">
                <p className="text-sm capitalize">Public</p>
                <div>
                  <Switch
                    checked={
                      isAlbum
                        ? props.data.album.visibility === "PUBLIC"
                        : isPlaylist
                          ? props.data.playlist.visibility === "PUBLIC"
                          : props.data.track.visibility === "PUBLIC"
                    }
                    handleChange={() => {
                      if (isAlbum) {
                        handleToggleVisibility();
                      } else if (isSingle) {
                        props.toggleVisibility();
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex text-left mt-auto ">
                <button
                  type="submit"
                  className="text-left flex mt-auto px-7 py-2 bg-black backdrop-blur-xl rounded-full text-base"
                  onClick={() => handleOption("edit")}
                >
                  Save
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}

      {/* Add to album modal - single mode only */}
      {isSingle && addAlbum && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-10"
            onClick={() => setAddAlbum(false)}
          ></div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute w-[30%] h-fit max-h-[60%] bg-white/50 backdrop-blur-lg rounded-xl z-10 top-0 bottom-0 left-0 right-0 m-auto flex flex-col p-5 text-black"
          >
            <div className="flex justify-between items-center">
              <p className="text-3xl font-bold text-left top-0">Add to Album</p>
              <div
                className="flex hover:bg-white/20 rounded-full translate-x-2 p-2 cursor-pointer transition-all duration-100"
                onClick={() => handleAlbum()}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14"></path>
                  <path d="M12 5v14"></path>
                </svg>
              </div>
            </div>
            <div className="flex flex-col gap-0 mt-3 ">
              {albumsLoading && <p>Loading...</p>}
              {albums.length === 0 && <p>No albums found!</p>}
              {albums?.map((album: Album & { tracks: Track[] }) => {
                return (
                  <div
                    key={album.id}
                    className="flex hover:bg-white/20 rounded-md p-2 transition-all duration-100"
                  >
                    <Image
                      src={
                        album.image
                          ? `https://remaster-storage.s3.ap-south-1.amazonaws.com/images/track/${album.image}`
                          : "/music.jpg"
                      }
                      alt={album.name}
                      width={50}
                      height={50}
                      className="rounded-md"
                    />
                    <div className="flex flex-col items-start justify-center  ml-3 ">
                      <p className="text-xl font-bold leading-tight text-ellipsis overflow-hidden line-clamp-1">
                        {album.name}
                      </p>
                      <p className="text-xs text-ellipsis overflow-hidden line-clamp-1">
                        {album.artist || "Unknown Artist"}
                      </p>
                    </div>

                    <div
                      className="ml-auto justify-center items-center flex cursor-pointer"
                      onClick={() => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const alreadyIn =
                          Array.isArray(album.tracks) &&
                          album.tracks.findIndex(
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (entry: any) =>
                              entry.trackId === props.data.track.id,
                          ) !== -1;
                        addTrackToAlbum(album.id, alreadyIn);
                      }}
                    >
                      {Array.isArray(album.tracks) &&
                      album.tracks.findIndex(
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (entry: any) => entry.trackId === props.data.track.id,
                      ) !== -1 ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="black"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="size-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="size-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}

      {/* Track edit modal */}
      {editingTrackId && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setEditingTrackId(null)}
          ></div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed w-fit h-fit bg-white/50 backdrop-blur-lg rounded-xl z-30 top-0 bottom-0 left-0 right-0 m-auto flex flex-col p-8  text-left"
          >
            {/* <p className="text-2xl font-bold mb-4">Edit Track</p> */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleTrackEdit();
              }}
              className="flex flex-col gap-0"
            >
              <label htmlFor="trackName" className="text-sm">
                Name
              </label>
              <input
                type="text"
                id="trackName"
                className="bg-white/0 border-2 rounded-lg h-[2.5rem] text-white px-3 focus:ring-0 focus:outline-none"
                value={trackFormData.name}
                onChange={(e) =>
                  setTrackFormData({ ...trackFormData, name: e.target.value })
                }
              />
              <label htmlFor="trackArtist" className="text-sm mt-1">
                Artist
              </label>
              <input
                type="text"
                id="trackArtist"
                className="bg-white/0 border-2 rounded-lg h-[2.5rem] text-white px-3 focus:ring-0 focus:outline-none"
                value={trackFormData.artist}
                onChange={(e) =>
                  setTrackFormData({ ...trackFormData, artist: e.target.value })
                }
              />
              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  className="px-7 py-2 bg-black backdrop-blur-xl rounded-full text-base text-white"
                >
                  Save
                </button>
                <button
                  type="button"
                  className="px-7 py-2 bg-white/10 text-black backdrop-blur-xl rounded-full text-base"
                  onClick={() => setEditingTrackId(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}

      {/* Header section */}
      <div className="h-80 rounded mx-20 mt-10 flex justify-left text-left ">
        <motion.div
          initial={{ opacity: 0, filter: "blur(20px)" }}
          animate={{
            opacity: 1,
            filter: "blur(0px)",
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="min-w-80 h-80 -z-10 flex w-80"
        >
          <Image
            src={imageUrl}
            height={0}
            width={0}
            sizes="100% 100%"
            alt="Album Art"
            priority
            onError={(e) => {
              e.currentTarget.src = "/music.jpg";
            }}
            className="w-80 h-full transition rounded"
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
        <div className="w-full">
          <div className="w-full h-[65%] text-ellipsis ml-10  justify-center flex flex-col">
            <p className="text-sm font-bold opacity-60">{typeLabel}</p>

            <p className="text-5xl font-bold text-ellipsis overflow-hidden line-clamp-2 pb-1">
              {itemName}
            </p>
            <p className="text-xl font-bold text-ellipsis overflow-hidden line-clamp-1">
              {isPlaylist
                ? props.data.playlist.description || ""
                : itemArtist || "Unknown Artist"}
            </p>
          </div>
          <div className="w-full pl-10 h-[35%] flex items-end">
            <div
              className="flex w-28 h-9 pr-1 justify-center items-center cursor-pointer bg-white/20 rounded  hover:bg-white/30 "
              onClick={() => {
                if (isList) {
                  const tracks = props.data.tracks ?? [];
                  if (tracks.length > 0) {
                    const queueTracks = isAlbum
                      ? tracks.map((t) => ({ ...t, image: props.data.album.image || t.image }))
                      : tracks;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    playerCtx.setQueue(queueTracks as any[], 0);
                  }
                } else {
                  props.setPlaying(props.data.track.id, !props.playing);
                  if (!props.playing) {
                    props.setData(props.data.track as unknown as Track);
                  }
                }
              }}
            >
              {isSingle && props.playing ? (
                <svg
                  width="800px"
                  height="800px"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-6 mr-1 cursor-pointer flex"
                >
                  <path d="M7 1H2V15H7V1Z" fill="white" />
                  <path d="M14 1H9V15H14V1Z" fill="white" />
                </svg>
              ) : (
                <svg
                  fill="white"
                  viewBox="0 0 32 32"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-7 cursor-pointer flex"
                >
                  <title>play</title>
                  <path d="M5.92 24.096q0 1.088 0.928 1.728 0.512 0.288 1.088 0.288 0.448 0 0.896-0.224l16.16-8.064q0.48-0.256 0.8-0.736t0.288-1.088-0.288-1.056-0.8-0.736l-16.16-8.064q-0.448-0.224-0.896-0.224-0.544 0-1.088 0.288-0.928 0.608-0.928 1.728v16.16z"></path>
                </svg>
              )}

              <p className="flex">
                {isSingle && props.playing ? "Pause" : "Play"}
              </p>
            </div>

            {props.user && props.user.id === itemUserId && !isDefaultPlaylist && (
              <div
                className="justify-end  ml-auto  flex cursor-pointer "
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

      {/* Tracklist */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable
          droppableId="tracklist"
          isDropDisabled={!isOwner || !isAlbum}
        >
          {(droppableProvided) => (
            <div
              ref={droppableProvided.innerRef}
              {...droppableProvided.droppableProps}
              className="w-full h-fit justify-start flex flex-col px-20 pt-10"
              {...(isSingle
                ? {
                    onDoubleClick: () => {
                      props.setPlaying(props.data.track.id, true);
                      props.setData(props.data.track as unknown as Track);
                    },
                  }
                : {})}
            >
              {tracksList.length <= 0 && (
                <div className="flex mt-10 text-base text-center w-full text-white select-text">
                  <p>No tracks found!</p>
                </div>
              )}
              {tracksList.map((track, index: number) => (
                <Draggable
                  key={track.id}
                  draggableId={track.id}
                  index={index}
                  isDragDisabled={!isOwner || !isAlbum}
                >
                  {(draggableProvided, snapshot) => (
                    <div
                      ref={draggableProvided.innerRef}
                      {...draggableProvided.draggableProps}
                      {...draggableProvided.dragHandleProps}
                  
                      style={{
                        borderTop: colors[0]
                          ? `2px solid rgba(${colors[0][0]},${colors[0][1]},${colors[0][2]},0.20)`
                          : "2px solid rgba(32,32,32,0.15)",
                        background: snapshot.isDragging
                          ? colors[0]
                            ? `rgba(${colors[0][0]},${colors[0][1]},${colors[0][2]},0.6)`
                            : "rgba(32,32,32,0.4)"
                          : index % 2 === 0
                            ? `rgba(${colors[0]?.[0] ?? 32},${colors[0]?.[1] ?? 32},${colors[0]?.[2] ?? 32},0.20)`
                            : `rgba(${colors[0]?.[0] ?? 32},${colors[0]?.[1] ?? 32},${colors[0]?.[2] ?? 32},0.05)`,
                        transition: "background 0.1s",
                        ...draggableProvided.draggableProps.style,
                      }}
                      onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                        if (snapshot.isDragging) return;
                        if (colors[0]) {
                          (e.currentTarget as HTMLDivElement).style.background =
                            `rgba(${colors[0][0]},${colors[0][1]},${colors[0][2]},0.5)`;
                        } else {
                          (e.currentTarget as HTMLDivElement).style.background =
                            "rgba(32,32,32,0.13)";
                        }
                      }}
                      onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                        if (snapshot.isDragging) return;
                        if (colors[0]) {
                          (e.currentTarget as HTMLDivElement).style.background =
                            index % 2 === 0
                              ? `rgba(${colors[0][0]},${colors[0][1]},${colors[0][2]},0.20)`
                              : `rgba(${colors[0][0]},${colors[0][1]},${colors[0][2]},0.05)`;
                        } else {
                          (e.currentTarget as HTMLDivElement).style.background =
                            index % 2 === 0
                              ? "rgba(32,32,32,0.10)"
                              : "rgba(32,32,32,0.05)";
                        }
                      }}
                      onDoubleClick={() => {
                        if (isList) {
                          const queueTracks = isAlbum
                            ? localTracks.map((t) => ({ ...t, image: props.data.album.image || t.image }))
                            : localTracks;
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          playerCtx.setQueue(
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            queueTracks as any[],
                            index,
                          );
                        }
                      }}
                      className={`flex h-13 rounded-lg cursor-pointer mb-2 group`}
                    >
                      <div
                        className="w-[2%] justify-left items-center flex ml-5"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(track.id);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill={likedIds.has(track.id) ? "white" : "none"}
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          className="size-4 stroke-white cursor-pointer hover:scale-125 transition-transform"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                          />
                        </svg>
                      </div>
                      <div className="w-[2%]  justify-center text-center text-ellipsis overflow-hidden flex items-center ml-2 text-base font-medium">
                        {index + 1}
                      </div>
                      <div className="w-[70%] text-ellipsis overflow-hidden flex items-center ml-2 text-base font-medium">
                        {track.name}
                      </div>
                      <div className=" w-[70%] text-ellipsis overflow-hidden flex items-center ml-2 text-base font-medium">
                        {track.artist}
                      </div>
                      <div className="w-[05%] flex items-center justify-center ml-2 text-base font-medium pr-3 text-center relative">
                        {isOwner && !isDefaultPlaylist && (
                          <div
                            className="hidden group-hover:flex items-center justify-center w-full h-full hover:underline cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTrackOptions(
                                activeTrackOptions === track.id
                                  ? null
                                  : track.id,
                              );
                            }}
                          >
                            Edit
                          </div>
                        )}

                        {activeTrackOptions === track.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setActiveTrackOptions(null)}
                            ></div>
                            <div className="relative z-20">
                              <Options list={getTrackOptionsList(track.id)} />
                            </div>
                          </>
                        )}
                        {activeTrackOptions !== track.id && (
                          <span className="group-hover:hidden">
                            {formatTime(track.duration ?? 0)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {droppableProvided.placeholder}
              <div className="flex mt-10 text-base text-white select-text">
                <p>{createdAt}</p>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
