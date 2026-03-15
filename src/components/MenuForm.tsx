"use client";

import { useState, useEffect } from "react";

interface MenuFormProps {
  onSubmit: (data: {
    proposer_name: string;
    menu_name: string;
    comment: string;
  }) => Promise<void>;
  prefill?: { menuName: string; comment: string } | null;
}

export default function MenuForm({ onSubmit, prefill }: MenuFormProps) {
  const [proposerName, setProposerName] = useState("");
  const [menuName, setMenuName] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (prefill) {
      setMenuName(prefill.menuName);
      setComment(prefill.comment);
    }
  }, [prefill]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposerName.trim() || !menuName.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        proposer_name: proposerName.trim(),
        menu_name: menuName.trim(),
        comment: comment.trim(),
      });
      setMenuName("");
      setComment("");
    } catch (error) {
      console.error("메뉴 제안 실패:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="proposerName" className="block text-sm font-medium text-gray-700 mb-1">
          이름
        </label>
        <input
          id="proposerName"
          type="text"
          value={proposerName}
          onChange={(e) => setProposerName(e.target.value)}
          placeholder="홍길동"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
          required
          maxLength={20}
        />
      </div>
      <div>
        <label htmlFor="menuName" className="block text-sm font-medium text-gray-700 mb-1">
          메뉴명
        </label>
        <input
          id="menuName"
          type="text"
          value={menuName}
          onChange={(e) => setMenuName(e.target.value)}
          placeholder="김치찌개"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
          required
          maxLength={30}
        />
      </div>
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
          한마디
        </label>
        <input
          id="comment"
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="오늘 날씨엔 뜨끈한 찌개가 최고!"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
          maxLength={50}
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting || !proposerName.trim() || !menuName.trim()}
        className="w-full py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 active:bg-orange-700 active:scale-[0.97] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-150"
      >
        {isSubmitting ? "제안 중..." : "메뉴 제안하기"}
      </button>
    </form>
  );
}
