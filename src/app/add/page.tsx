"use client";

import { useState, useEffect } from "react";
import { BackgroundGlow } from "@/components/BackgroundGlow";
import { GlassCard } from "@/components/GlassCard";
import { TagGroup } from "@/components/TagGroup";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface TagItem {
  id: number;
  name: string;
}

const categories = ["主食", "荤菜", "素菜", "汤羹", "小吃"];

export default function AddDishPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("荤菜");
  const [flavors, setFlavors] = useState<TagItem[]>([]);
  const [restrictions, setRestrictions] = useState<TagItem[]>([]);
  const [selectedFlavors, setSelectedFlavors] = useState<number[]>([]);
  const [selectedRestrictions, setSelectedRestrictions] = useState<number[]>([]);
  const [createdBy, setCreatedBy] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/flavors").then((r) => r.json()).then(setFlavors);
    fetch("/api/restrictions").then((r) => r.json()).then(setRestrictions);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) { setError("请输入菜品名称"); return; }
    if (!selectedFlavors.length) { setError("请至少选择一种口味"); return; }

    setSubmitting(true);
    const res = await fetch("/api/dishes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        category,
        flavorIds: selectedFlavors,
        restrictionIds: selectedRestrictions,
        createdBy: createdBy.trim() || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "添加失败");
      setSubmitting(false);
      return;
    }

    router.push("/dishes");
  };

  return (
    <>
      <BackgroundGlow />
      <main className="max-w-lg mx-auto px-4 py-8 pb-24">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="text-gray-400 hover:text-gray-600">← 返回</Link>
          <h1 className="text-2xl font-bold text-gray-800">添加菜品</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <GlassCard className="p-6 space-y-6 mb-6">
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-2">菜品名称</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：红烧肉"
                className="w-full bg-white/50 border border-white/30 rounded-xl px-4 py-2.5 text-gray-700 placeholder-gray-300 outline-none focus:border-orange-300 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 block mb-2">分类</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      category === cat
                        ? "bg-orange-400 text-white"
                        : "bg-white/40 text-gray-500 hover:scale-105"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <TagGroup
              items={flavors}
              selected={selectedFlavors}
              onChange={setSelectedFlavors}
              variant="flavor"
              label="口味标签（可多选）"
            />

            <div className="border-t border-white/20 pt-4">
              <TagGroup
                items={restrictions}
                selected={selectedRestrictions}
                onChange={setSelectedRestrictions}
                variant="restriction"
                label="不适合的忌口（可多选）"
              />
            </div>

            <div className="border-t border-white/20 pt-4">
              <label className="text-sm font-medium text-gray-500 block mb-2">你的昵称（选填）</label>
              <input
                type="text"
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
                placeholder="留下你的名字"
                className="w-full bg-white/50 border border-white/30 rounded-xl px-4 py-2.5 text-gray-700 placeholder-gray-300 outline-none focus:border-orange-300 transition-colors text-sm"
              />
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          </GlassCard>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-full text-lg font-semibold bg-orange-400 text-white hover:bg-orange-500 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-orange-400/25 disabled:opacity-50"
          >
            {submitting ? "添加中..." : "添加菜品"}
          </button>
        </form>

        <nav className="fixed bottom-0 left-0 right-0 p-4">
          <GlassCard className="max-w-lg mx-auto p-4 flex justify-center gap-8">
            <Link href="/" className="text-sm font-medium text-gray-400 hover:text-gray-600 flex flex-col items-center gap-1">
              <span className="text-lg">🎲</span>推荐
            </Link>
            <Link href="/dishes" className="text-sm font-medium text-gray-400 hover:text-gray-600 flex flex-col items-center gap-1">
              <span className="text-lg">📖</span>菜品库
            </Link>
            <Link href="/add" className="text-sm font-medium text-orange-500 flex flex-col items-center gap-1">
              <span className="text-lg">➕</span>添加
            </Link>
          </GlassCard>
        </nav>
      </main>
    </>
  );
}
