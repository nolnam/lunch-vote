"use client";

import { useState, useEffect } from "react";

interface VoterNameModalProps {
  onSubmit: (name: string) => void;
}

export default function VoterNameModal({ onSubmit }: VoterNameModalProps) {
  const [name, setName] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim());
  };

  return (
    <div
      className={`fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl ${
          isVisible ? "animate-slide-up" : "opacity-0"
        }`}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-2">투표하기</h2>
        <p className="text-sm text-gray-500 mb-4">투표에 사용할 이름을 입력하세요</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="홍길동"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
            required
            maxLength={20}
            autoFocus
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            확인
          </button>
        </form>
      </div>
    </div>
  );
}
