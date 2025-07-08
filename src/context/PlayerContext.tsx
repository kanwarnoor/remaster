"use client";

import { createContext, useContext, useState } from "react";

export const PlayerContext = createContext<{
  playing: boolean;
  setPlaying: (id: string, playing: boolean) => void;

  data: any;
  setData: (data: any) => void;

  color: [number, number, number][];
  setColor: (color: [number, number, number][]) => void;
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
  const [color, setColor] = useState<[number, number, number][]>([]);

  return (
    <PlayerContext.Provider
      value={{
        playing: playing?.playing ?? false,
        setPlaying: (id: string, playing: boolean) => {
          setPlaying({ id, playing });
        },

        color: color,
        setColor: (color: [number, number, number][]) => {
          setColor(color);
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
