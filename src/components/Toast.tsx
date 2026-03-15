"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl text-white font-medium shadow-lg pb-[env(safe-area-inset-bottom)] ${bgColor} ${
        visible
          ? "animate-slide-up"
          : "animate-slide-down"
      }`}
    >
      {message}
    </div>
  );
}
