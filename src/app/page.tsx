"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { getSupabase } from "@/lib/supabase";
import type { MenuWithVotes } from "@/types/database";
import MenuForm from "@/components/MenuForm";
import MenuCard from "@/components/MenuCard";
import MenuCardSkeleton from "@/components/MenuCardSkeleton";
import VoterNameModal from "@/components/VoterNameModal";
import AiRecommend from "@/components/AiRecommend";
import Toast from "@/components/Toast";

type SortMode = "votes" | "latest";

export default function Home() {
  const supabase = useMemo(() => getSupabase(), []);
  const [menus, setMenus] = useState<MenuWithVotes[]>([]);
  const [voterName, setVoterName] = useState<string | null>(null);
  const [votedMenuId, setVotedMenuId] = useState<string | null>(null);
  const [showVoterModal, setShowVoterModal] = useState(false);
  const [pendingVoteMenuId, setPendingVoteMenuId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [prefill, setPrefill] = useState<{ menuName: string; comment: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("votes");

  useEffect(() => {
    const saved = localStorage.getItem("lunch-vote-name");
    if (saved) setVoterName(saved);
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  const fetchMenus = useCallback(async () => {
    const { data: menuRows } = await supabase
      .from("menus")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: voteRows } = await supabase.from("votes").select("*");

    if (!menuRows) return;

    const menusWithVotes: MenuWithVotes[] = menuRows.map((menu) => {
      const menuVotes = (voteRows ?? []).filter(
        (v: { menu_id: string }) => v.menu_id === menu.id
      );
      return {
        ...menu,
        vote_count: menuVotes.length,
        voters: menuVotes.map((v: { voter_name: string }) => v.voter_name),
      };
    });

    setMenus(menusWithVotes);

    if (voterName) {
      const existingVote = (voteRows ?? []).find(
        (v: { voter_name: string }) => v.voter_name === voterName
      );
      setVotedMenuId(existingVote?.menu_id ?? null);
    }

    setIsLoading(false);
  }, [supabase, voterName]);

  useEffect(() => {
    fetchMenus();

    const channel = supabase
      .channel("realtime-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menus" },
        () => fetchMenus()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "votes" },
        () => fetchMenus()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchMenus]);

  const handleAddMenu = async (data: {
    proposer_name: string;
    menu_name: string;
    comment: string;
  }) => {
    const { error } = await supabase.from("menus").insert(data);
    if (error) {
      showToast("메뉴 제안에 실패했습니다.", "error");
      throw error;
    }
    showToast(`"${data.menu_name}" 메뉴가 제안되었습니다!`);
    await fetchMenus();
  };

  const handleVote = (menuId: string) => {
    if (!voterName) {
      setPendingVoteMenuId(menuId);
      setShowVoterModal(true);
      return;
    }
    executeVote(menuId, voterName);
  };

  const executeVote = async (menuId: string, name: string) => {
    const { error } = await supabase
      .from("votes")
      .insert({ menu_id: menuId, voter_name: name });

    if (error) {
      if (error.code === "23505") {
        showToast("이미 투표하셨습니다. 1인 1표만 가능합니다.", "error");
      } else {
        console.error("투표 실패:", error);
        showToast("투표에 실패했습니다.", "error");
      }
      return;
    }

    setVotedMenuId(menuId);
    showToast("투표 완료!");
    await fetchMenus();
  };

  const handleUnvote = async (menuId: string) => {
    if (!voterName) return;

    const { error } = await supabase
      .from("votes")
      .delete()
      .eq("menu_id", menuId)
      .eq("voter_name", voterName);

    if (error) {
      console.error("투표 취소 실패:", error);
      showToast("투표 취소에 실패했습니다.", "error");
      return;
    }

    setVotedMenuId(null);
    showToast("투표가 취소되었습니다.");
    await fetchMenus();
  };

  const handleVoterNameSubmit = (name: string) => {
    setVoterName(name);
    localStorage.setItem("lunch-vote-name", name);
    setShowVoterModal(false);
    if (pendingVoteMenuId) {
      executeVote(pendingVoteMenuId, name);
      setPendingVoteMenuId(null);
    }
  };

  const sortedMenus = useMemo(() => {
    if (sortMode === "votes") {
      return [...menus].sort((a, b) => b.vote_count - a.vote_count);
    }
    return menus;
  }, [menus, sortMode]);

  const maxVotes = Math.max(...menus.map((m) => m.vote_count), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-lg mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            🍽️ 점심 뭐 먹지?
          </h1>
          <p className="text-gray-500 mt-1">메뉴를 제안하고 투표하세요!</p>
          {voterName && (
            <p className="text-sm text-orange-600 mt-2 font-medium">
              {voterName}님으로 참여 중
            </p>
          )}
        </header>

        <AiRecommend
          existingMenus={menus.map((m) => m.menu_name)}
          onSelectMenu={(menuName, reason) =>
            setPrefill({ menuName, comment: reason })
          }
        />

        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">메뉴 제안</h2>
          <MenuForm onSubmit={handleAddMenu} prefill={prefill} />
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              투표 현황
              <span className="text-sm font-normal text-gray-400 ml-2">
                {menus.length}개 메뉴
              </span>
            </h2>
            {menus.length > 1 && (
              <div className="flex bg-gray-100 rounded-lg p-0.5 text-sm">
                <button
                  onClick={() => setSortMode("votes")}
                  className={`px-3 py-1 rounded-md transition-all ${
                    sortMode === "votes"
                      ? "bg-white text-gray-900 shadow-sm font-medium"
                      : "text-gray-500"
                  }`}
                >
                  득표순
                </button>
                <button
                  onClick={() => setSortMode("latest")}
                  className={`px-3 py-1 rounded-md transition-all ${
                    sortMode === "latest"
                      ? "bg-white text-gray-900 shadow-sm font-medium"
                      : "text-gray-500"
                  }`}
                >
                  최신순
                </button>
              </div>
            )}
          </div>

          {isLoading ? (
            <MenuCardSkeleton />
          ) : menus.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🍜</div>
              <p className="text-gray-400 font-medium">아직 제안된 메뉴가 없습니다</p>
              <p className="text-gray-300 text-sm mt-1">위에서 첫 메뉴를 제안해보세요!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedMenus.map((menu) => (
                <MenuCard
                  key={menu.id}
                  menu={menu}
                  isTopVoted={menu.vote_count === maxVotes && maxVotes > 0}
                  hasVoted={votedMenuId !== null}
                  votedMenuId={votedMenuId}
                  onVote={handleVote}
                  onUnvote={handleUnvote}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {showVoterModal && (
        <VoterNameModal onSubmit={handleVoterNameSubmit} />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
