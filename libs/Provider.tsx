"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { PlayerProvider } from "@/context/PlayerContext";
import { UploadProvider } from "@/context/UploadContext";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <PlayerProvider>
        <UploadProvider>{children}</UploadProvider>
      </PlayerProvider>
    </QueryClientProvider>
  );
}
