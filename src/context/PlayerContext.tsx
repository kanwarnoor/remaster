"use client";

import { createContext, useContext, useState } from "react";

export const PlayerContext = createContext<{
  playing: boolean;
  setPlaying: (playing: boolean) => void;
} | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [playing, setPlaying] = useState(false);

  return (
    <PlayerContext.Provider value={{ playing, setPlaying }}>
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