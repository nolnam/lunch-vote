"use client";

import type { MenuWithVotes } from "@/types/database";

interface MenuCardProps {
  menu: MenuWithVotes;
  isTopVoted: boolean;
  hasVoted: boolean;
  votedMenuId: string | null;
  onVote: (menuId: string) => void;
  onUnvote: (menuId: string) => void;
}

export default function MenuCard({
  menu,
  isTopVoted,
  hasVoted,
  votedMenuId,
  onVote,
  onUnvote,
}: MenuCardProps) {
  const isVotedForThis = votedMenuId === menu.id;

  return (
    <div
      className={`relative p-4 rounded-2xl border-2 transition-all hover:shadow-md duration-200 ${
        isTopVoted && menu.vote_count > 0
          ? "border-orange-400 bg-orange-50 shadow-lg animate-bounce-subtle-loop"
          : "border-gray-200 bg-white"
      }`}
    >
      {isTopVoted && menu.vote_count > 0 && (
        <span className="absolute -top-3 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          1위
        </span>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 truncate">{menu.menu_name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{menu.proposer_name}</p>
          {menu.comment && (
            <p className="text-sm text-gray-600 mt-2 italic">&ldquo;{menu.comment}&rdquo;</p>
          )}
          {menu.voters.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {menu.voters.map((voter) => (
                <span
                  key={voter}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                >
                  {voter}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-1 shrink-0">
          <button
            onClick={() =>
              isVotedForThis ? onUnvote(menu.id) : onVote(menu.id)
            }
            disabled={hasVoted && !isVotedForThis}
            className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center transition-all duration-150 ${
              isVotedForThis
                ? "bg-orange-500 text-white shadow-md scale-105 active:scale-90"
                : hasVoted
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                  : "bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600 active:scale-90"
            }`}
            title={
              isVotedForThis
                ? "투표 취소"
                : hasVoted
                  ? "이미 투표했습니다"
                  : "투표하기"
            }
          >
            <span className="text-xl">{isVotedForThis ? "❤️" : "🤍"}</span>
            <span className="text-xs font-bold">{menu.vote_count}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
