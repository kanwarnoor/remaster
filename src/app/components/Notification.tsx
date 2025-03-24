import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface NotificationProps {
  message: string;
  type: 'error' | 'success' | 'info' | 'warning';
}

const notificationStyles = {
  "error": "bg-remaster text-white",
  "success": "bg-green-500 text-white",
  "info": "bg-blue-500 text-white",
  "warning": "bg-yellow-500 text-black",
};

export default function Notification({ message, type }: NotificationProps) {
  const typeStyle = notificationStyles[type] || notificationStyles.info;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 50,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
      }}
      transition={{
        duration: 0.3,
      }}
      className={`absolute w-fit h-fit left-0 right-0 bottom-0 m-auto flex mb-10 rounded-full text-black px-5 py-3 overflow-hidden font-bold ${typeStyle}}`}
    >
      {message}
    </motion.div>
  );
}
