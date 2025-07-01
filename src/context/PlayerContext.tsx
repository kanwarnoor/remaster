"use client";

import { createContext, useContext, useState } from "react";

export const PlayerContext = createContext<{
  playing: boolean;
  setPlaying: (id: string, playing: boolean) => void;

  data: any;
  setData: (data: any) => void;

  color: [number, number, number];
  setColor: (color: [number, number, number]) => void;
} | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [playing, setPlaying] = useState<{
    id: string | null;
    playing: boolean;
  }>({
    id: null,
    playing: false,
  });
  const [data, setData] = useState<any>(null);
  const [color, setColor] = useState<string>("#000000");

  return (
    <PlayerContext.Provider
      value={{
        playing: playing?.playing ?? false,
        setPlaying: (id: string, playing: boolean) => {
          setPlaying({ id, playing });
        },

        color: color.split(",").map(Number) as [number, number, number],
        setColor: (color: [number, number, number]) => {
          setColor(color.join(","));
        },

        data,
        setData,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
