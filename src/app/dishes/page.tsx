"use client";

import { useState, useEffect } from "react";
import { BackgroundGlow } from "@/components/BackgroundGlow";
import { GlassCard } from "@/components/GlassCard";
import Link from "next/link";

interface Dish {
  id: number;
  name: string;
  category: string;
  isPreset: boolean;
  createdBy: string | null;
  flavors: { flavor: { id: number; name: string } }[];
  avoidRestrictions: { restriction: { id: number; name: string } }[];
}

const categories = ["全部", "主食", "荤菜", "素菜", "汤羹", "小吃"];

export default function DishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("全部");

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category !== "全部") params.set("category", category);
    fetch(`/api/dishes?${params.toString()}`).then((r) => r.json()).then(setDishes);
  }, [search, category]);

  return (
    <>
      <BackgroundGlow />
      <main className="max-w-lg mx-auto px-4 py-8 pb-24">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="text-gray-400 hover:text-gray-600">← 返回</Link>
          <h1 className="text-2xl font-bold text-gray-800">菜品库</h1>
        </div>

        <GlassCard className="p-4 mb-4">
          <input
            type="text"
            placeholder="搜索菜品..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-gray-700 placeholder-gray-300 text-sm"
          />
        </GlassCard>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                category === cat
                  ? "bg-orange-400 text-white shadow-lg shadow-orange-400/20"
                  : "glass text-gray-500 hover:scale-105"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {dishes.map((dish) => (
            <GlassCard key={dish.id} className="p-4">
              <div>
                <h3 className="font-semibold text-gray-800">
                  {dish.name}
                  {!dish.isPreset && (
                    <span className="text-xs text-gray-400 ml-2">by {dish.createdBy || "匿名"}</span>
                  )}
                </h3>
                <span className="text-xs text-gray-400">{dish.category}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {dish.flavors.map(({ flavor }) => (
                  <span key={flavor.id} className="px-2 py-0.5 rounded-full text-xs bg-white/50 text-gray-500">
                    {flavor.name}
                  </span>
                ))}
              </div>
              {dish.avoidRestrictions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {dish.avoidRestrictions.map(({ restriction }) => (
                    <span key={restriction.id} className="px-2 py-0.5 rounded-full text-xs bg-red-50 text-red-400 border border-red-100">
                      {restriction.name}
                    </span>
                  ))}
                </div>
              )}
            </GlassCard>
          ))}
          {dishes.length === 0 && (
            <p className="text-center text-gray-400 py-12">暂无菜品</p>
          )}
        </div>

        <nav className="fixed bottom-0 left-0 right-0 p-4">
          <GlassCard className="max-w-lg mx-auto p-4 flex justify-center gap-8">
            <Link href="/" className="text-sm font-medium text-gray-400 hover:text-gray-600 flex flex-col items-center gap-1">
              <span className="text-lg">🎲</span>推荐
            </Link>
            <Link href="/dishes" className="text-sm font-medium text-orange-500 flex flex-col items-center gap-1">
              <span className="text-lg">📖</span>菜品库
            </Link>
            <Link href="/add" className="text-sm font-medium text-gray-400 hover:text-gray-600 flex flex-col items-center gap-1">
              <span className="text-lg">➕</span>添加
            </Link>
          </GlassCard>
        </nav>
      </main>
    </>
  );
}
