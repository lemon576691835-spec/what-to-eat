"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "./GlassCard";

interface DishResult {
  id: number;
  name: string;
  category: string;
  flavors: { flavor: { id: number; name: string } }[];
}

interface RecommendResultProps {
  dish: DishResult | null;
  loading: boolean;
  onReroll: () => void;
  onConfirm: () => void;
}

export function RecommendResult({
  dish,
  loading,
  onReroll,
  onConfirm,
}: RecommendResultProps) {
  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          key="loading"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex flex-col items-center gap-4 py-12"
        >
          <div className="w-16 h-16 rounded-full glass animate-spin border-2 border-transparent border-t-orange-400" />
          <p className="text-gray-500 text-sm">正在为你挑选...</p>
        </motion.div>
      )}

      {dish && !loading && (
        <motion.div
          key="result"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <GlassCard strong className="p-8 text-center">
            <p className="text-sm text-gray-400 mb-2">{dish.category}</p>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {dish.name}
            </h2>
            <div className="flex flex-wrap gap-1.5 justify-center mb-6">
              {dish.flavors.map(({ flavor }) => (
                <span
                  key={flavor.id}
                  className="px-3 py-0.5 rounded-full text-xs font-medium bg-white/60 text-gray-500"
                >
                  {flavor.name}
                </span>
              ))}
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={onReroll}
                className="px-6 py-2.5 rounded-full text-sm font-medium glass hover:scale-105 active:scale-95 transition-transform"
              >
                换一个
              </button>
              <button
                onClick={onConfirm}
                className="px-8 py-2.5 rounded-full text-sm font-medium bg-orange-400 text-white hover:scale-105 hover:bg-orange-500 active:scale-95 transition-all shadow-lg shadow-orange-400/20"
              >
                就它了！
              </button>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
