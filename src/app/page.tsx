"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { BackgroundGlow } from "@/components/BackgroundGlow";
import { GlassCard } from "@/components/GlassCard";
import { TagGroup } from "@/components/TagGroup";
import { RecommendResult } from "@/components/RecommendResult";
import Link from "next/link";

interface TagItem {
  id: number;
  name: string;
}

interface DishResult {
  id: number;
  name: string;
  category: string;
  flavors: { flavor: { id: number; name: string } }[];
}

export default function Home() {
  const [flavors, setFlavors] = useState<TagItem[]>([]);
  const [restrictions, setRestrictions] = useState<TagItem[]>([]);
  const [selectedFlavors, setSelectedFlavors] = useState<number[]>([]);
  const [selectedRestrictions, setSelectedRestrictions] = useState<number[]>([]);
  const [result, setResult] = useState<DishResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    fetch("/api/flavors").then((r) => r.json()).then(setFlavors);
    fetch("/api/restrictions").then((r) => r.json()).then(setRestrictions);
  }, []);

  const getRecommendation = useCallback(
    async (excludeId?: number) => {
      if (!selectedFlavors.length) {
        setError("请至少选择一种口味偏好");
        return;
      }
      setError("");
      setLoading(true);
      setResult(null);

      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flavorIds: selectedFlavors,
          restrictionIds: selectedRestrictions,
          excludeId: excludeId || undefined,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "没有找到匹配的菜品");
        return;
      }
      setResult(data);
    },
    [selectedFlavors, selectedRestrictions]
  );

  const handleReroll = () => { if (result) getRecommendation(result.id); };
  const handleConfirm = () => setConfirmed(true);

  return (
    <>
      <BackgroundGlow />
      <main className="max-w-lg mx-auto px-4 py-8 pb-24">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">今天吃什么</h1>
          <p className="text-gray-400 text-sm">选择偏好，帮你决定</p>
        </div>

        {confirmed && result ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard strong className="p-12 text-center">
              <div className="text-6xl mb-4">🍽️</div>
              <p className="text-gray-400 text-sm mb-2">今天吃</p>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{result.name}</h2>
              <p className="text-gray-400 text-sm">{result.category}</p>
              <button
                onClick={() => { setConfirmed(false); setResult(null); }}
                className="mt-8 px-6 py-2.5 rounded-full text-sm font-medium glass hover:scale-105 transition-transform"
              >
                重新选择
              </button>
            </GlassCard>
          </motion.div>
        ) : (
          <>
            <GlassCard className="p-6 mb-6 space-y-6">
              <TagGroup
                items={flavors}
                selected={selectedFlavors}
                onChange={setSelectedFlavors}
                variant="flavor"
                label="口味偏好（可多选）"
              />
              <div className="border-t border-white/20" />
              <TagGroup
                items={restrictions}
                selected={selectedRestrictions}
                onChange={setSelectedRestrictions}
                variant="restriction"
                label="忌口（可多选）"
              />
            </GlassCard>

            <div className="text-center mb-6">
              <button
                onClick={() => getRecommendation()}
                disabled={loading}
                className="px-10 py-3.5 rounded-full text-lg font-semibold bg-orange-400 text-white hover:bg-orange-500 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-orange-400/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "挑选中..." : "🎲  帮我决定"}
              </button>
              {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
            </div>

            <RecommendResult
              dish={result}
              loading={loading}
              onReroll={handleReroll}
              onConfirm={handleConfirm}
            />
          </>
        )}

        <nav className="fixed bottom-0 left-0 right-0 p-4">
          <GlassCard className="max-w-lg mx-auto p-4 flex justify-center gap-8">
            <Link href="/" className="text-sm font-medium text-orange-500 flex flex-col items-center gap-1">
              <span className="text-lg">🎲</span>推荐
            </Link>
            <Link href="/dishes" className="text-sm font-medium text-gray-400 hover:text-gray-600 flex flex-col items-center gap-1 transition-colors">
              <span className="text-lg">📖</span>菜品库
            </Link>
            <Link href="/add" className="text-sm font-medium text-gray-400 hover:text-gray-600 flex flex-col items-center gap-1 transition-colors">
              <span className="text-lg">➕</span>添加
            </Link>
          </GlassCard>
        </nav>
      </main>
    </>
  );
}
