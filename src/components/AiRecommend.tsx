"use client";

import { useState } from "react";

interface Recommendation {
  menu: string;
  reason: string;
}

interface AiRecommendProps {
  existingMenus: string[];
  onSelectMenu: (menuName: string, reason: string) => void;
}

export default function AiRecommend({ existingMenus, onSelectMenu }: AiRecommendProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [weatherSummary, setWeatherSummary] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ existingMenus }),
      });

      if (!res.ok) {
        throw new Error("추천 요청 실패");
      }

      const data = await res.json();
      setWeatherSummary(data.weather_summary);
      setRecommendations(data.recommendations);
      setIsOpen(true);
    } catch (err) {
      console.error("AI 추천 실패:", err);
      setError("AI 추천에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <button
        onClick={fetchRecommendations}
        disabled={isLoading}
        className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-2xl hover:from-purple-600 hover:to-indigo-600 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-md"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" style={{ animation: "spin-smooth 0.8s linear infinite" }} />
            AI가 생각하는 중...
          </span>
        ) : (
          "🤖 AI 메뉴 추천받기"
        )}
      </button>

      {error && (
        <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
      )}

      {isOpen && recommendations.length > 0 && (
        <div className="mt-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-4 border border-purple-100">
          {weatherSummary && (
            <p className="text-sm text-purple-700 font-medium mb-3 flex items-center gap-1.5">
              <span>🌤️</span> {weatherSummary}
            </p>
          )}

          <div className="space-y-2">
            {recommendations.map((rec, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelectMenu(rec.menu, rec.reason);
                  setIsOpen(false);
                }}
                className="w-full text-left p-3 bg-white rounded-xl hover:bg-purple-50 hover:scale-[1.01] active:scale-[0.99] border border-purple-100 hover:border-purple-300 transition-all duration-150 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                    {rec.menu}
                  </span>
                  <span className="text-xs text-purple-400 group-hover:text-purple-600 transition-colors">
                    선택 →
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{rec.reason}</p>
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="mt-3 w-full text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            닫기
          </button>
        </div>
      )}
    </div>
  );
}
