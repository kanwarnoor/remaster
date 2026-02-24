"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

interface Track {
  id: string;
  name: string;
  artist: string;
  duration: number;
  image: string;
  timestamps: string[];
  audio: string;
  visibility: string;
}

interface PlayerContextType {
  playing: boolean;
  setPlaying: (id: string, playing: boolean) => void;

  data: Track | null;
  setData: (data: Track) => void;

  color: [number, number, number][];
  setColor: (color: [number, number, number][]) => void;

  // Queue
  queue: Track[];
  queueIndex: number;
  setQueue: (tracks: Track[], startIndex?: number) => void;
  playNext: () => void;
  playPrev: () => void;
  jumpToQueueIndex: (index: number) => void;

  // Shuffle & Repeat
  shuffle: boolean;
  setShuffle: (on: boolean) => void;
  repeat: number; // 0=off, 1=repeat all, 2=repeat one
  setRepeat: (mode: number) => void;

  // Queue UI
  showQueue: boolean;
  setShowQueue: (show: boolean) => void;
}

export const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [playing, setPlayingState] = useState<{
    id: string | null;
    playing: boolean;
  }>({
    id: null,
    playing: false,
  });
  const [data, setDataState] = useState<Track | null>(null);
  const [color, setColor] = useState<[number, number, number][]>([]);

  // Queue state
  const [queue, setQueueState] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const originalQueueRef = useRef<Track[]>([]);

  // Shuffle & Repeat
  const [shuffle, setShuffleState] = useState(false);
  const [repeat, setRepeat] = useState(0);

  // Queue UI
  const [showQueue, setShowQueue] = useState(false);

  const playTrackAtIndex = useCallback(
    (tracks: Track[], index: number) => {
      const track = tracks[index];
      if (!track) return;
      setQueueIndex(index);
      setDataState(track);
      setPlayingState({ id: track.id, playing: true });
    },
    [],
  );

  const setQueue = useCallback(
    (tracks: Track[], startIndex = 0) => {
      originalQueueRef.current = [...tracks];
      setQueueState(tracks);
      playTrackAtIndex(tracks, startIndex);
    },
    [playTrackAtIndex],
  );

  // setData for single-track play (backwards compat with SongPage)
  const setData = useCallback(
    (track: Track) => {
      originalQueueRef.current = [track];
      setQueueState([track]);
      setQueueIndex(0);
      setDataState(track);
    },
    [],
  );

  const playNext = useCallback(() => {
    if (queue.length === 0) return;
    if (repeat === 2) {
      // Repeat one: restart current track (handled by Player onEnded)
      setPlayingState({ id: queue[queueIndex]?.id, playing: true });
      return;
    }
    const nextIndex = queueIndex + 1;
    if (nextIndex < queue.length) {
      playTrackAtIndex(queue, nextIndex);
    } else if (repeat === 1) {
      // Repeat all: wrap to start
      playTrackAtIndex(queue, 0);
    } else {
      // No repeat: stop at end
      setPlayingState({ id: queue[queueIndex]?.id, playing: false });
    }
  }, [queue, queueIndex, repeat, playTrackAtIndex]);

  const playPrev = useCallback(() => {
    if (queue.length === 0) return;
    const prevIndex = queueIndex - 1;
    if (prevIndex >= 0) {
      playTrackAtIndex(queue, prevIndex);
    } else if (repeat === 1) {
      playTrackAtIndex(queue, queue.length - 1);
    }
  }, [queue, queueIndex, repeat, playTrackAtIndex]);

  const jumpToQueueIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < queue.length) {
        playTrackAtIndex(queue, index);
      }
    },
    [queue, playTrackAtIndex],
  );

  const setShuffle = useCallback(
    (on: boolean) => {
      setShuffleState(on);
      if (on) {
        // Shuffle: keep current track at front, shuffle the rest
        const currentTrack = queue[queueIndex];
        const rest = queue.filter((_, i) => i !== queueIndex);
        for (let i = rest.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [rest[i], rest[j]] = [rest[j], rest[i]];
        }
        const shuffled = [currentTrack, ...rest];
        setQueueState(shuffled);
        setQueueIndex(0);
      } else {
        // Unshuffle: restore original order, find current track
        const currentTrack = queue[queueIndex];
        const original = originalQueueRef.current;
        setQueueState(original);
        const originalIndex = original.findIndex((t) => t.id === currentTrack?.id);
        setQueueIndex(originalIndex >= 0 ? originalIndex : 0);
      }
    },
    [queue, queueIndex],
  );

  return (
    <PlayerContext.Provider
      value={{
        playing: playing?.playing ?? false,
        setPlaying: (id: string, playing: boolean) => {
          setPlayingState({ id, playing });
        },

        color,
        setColor,

        data,
        setData,

        queue,
        queueIndex,
        setQueue,
        playNext,
        playPrev,
        jumpToQueueIndex,

        shuffle,
        setShuffle,
        repeat,
        setRepeat,

        showQueue,
        setShowQueue,
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
