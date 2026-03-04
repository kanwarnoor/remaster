import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NotificationProps {
  message: string;
  type: "error" | "success" | "info" | "warning" | "";
}

const notificationStyles = {
  error: "bg-remaster text-white",
  success: "bg-green-500 text-white",
  info: "bg-white text-black",
  warning: "bg-yellow-500 text-black",
  "": "bg-white text-black",
};

export type UploadStatus = "uploading" | "success" | "error";

export interface UploadEntry {
  id: string;
  fileName: string;
  progress: number;
  status: UploadStatus;
  visible: boolean;
  error?: string;
}

export default function Notification({ message, type }: NotificationProps) {
  const typeStyle = notificationStyles[type] || notificationStyles.info;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed shadow-2xl w-fit h-fit right-0 bottom-0 flex m-12 rounded-full text-black px-5 py-3 z-20 overflow-hidden font-bold ${typeStyle}`}
    >
      {message}
    </motion.div>
  );
}

function StatusIcon({ status }: { status: UploadStatus }) {
  if (status === "uploading") {
    return (
      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          className="opacity-25"
        />
        <path
          d="M4 12a8 8 0 018-8"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="opacity-75"
        />
      </svg>
    );
  }
  if (status === "success") {
    return (
      <svg
        className="w-4 h-4 text-green-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }
  return (
    <svg
      className="w-4 h-4 text-red-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function UploadToast({
  entry,
  onDismiss,
}: {
  entry: UploadEntry;
  onDismiss: (id: string) => void;
}) {
  const done = entry.status === "success" || entry.status === "error";

  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => onDismiss(entry.id), 5000);
    return () => clearTimeout(timer);
  }, [done, entry.id, onDismiss]);

  const truncatedName =
    entry.fileName.length > 28
      ? entry.fileName.slice(0, 25) + "..."
      : entry.fileName;

  const barColor =
    entry.status === "error"
      ? "bg-red-500"
      : entry.status === "success"
        ? "bg-green-500"
        : "bg-remaster";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 80 }}
      transition={{ duration: 0.25 }}
      className="bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 shadow-2xl w-72 flex flex-col gap-1.5 overflow-hidden"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-white truncate flex-1">
          {truncatedName}
        </p>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-white/60 font-medium tabular-nums">
            {entry.status === "error" ? "Failed" : `${entry.progress}%`}
          </span>
          <StatusIcon status={entry.status} />
          <button
            onClick={() => onDismiss(entry.id)}
            className="ml-0.5 text-white/40 hover:text-white transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${entry.progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}

export function UploadToastStack({
  uploads,
  onDismiss,
}: {
  uploads: UploadEntry[];
  onDismiss: (id: string) => void;
}) {
  if (uploads.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse gap-2 max-h-[70vh] overflow-y-auto overflow-x-hidden">
      <AnimatePresence mode="popLayout">
        {uploads.map((entry) => (
          <UploadToast key={entry.id} entry={entry} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
