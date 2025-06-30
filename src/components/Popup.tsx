import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PopupProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function Popup({ message, onConfirm, onCancel }: PopupProps) {
  return (
      <div
        className="fixed inset-0 flex items-center justify-center z-20"
      >
        <motion.div
          initial={{
            scale: 0.7,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            scale: 0.7,
          }}
 
          className="px-20 py-16 max-w-[50%] flex flex-col m-auto justify-center text-center rounded-xl bg-white/10 backdrop-blur-xl shadow-2xl z-30"
        >
          <p className="text-3xl font-bold">{message}</p>
          <div className="mt-5 flex justify-center">
            <button
              onClick={onCancel}
              className="px-4 py-2 font-bold text-white"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 font-bold rounded bg-remaster text-white"
            >
              Confirm
            </button>
          </div>
        </motion.div>
      </div>

  );
}
