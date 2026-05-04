"use client";

interface TagItem {
  id: number;
  name: string;
}

interface TagGroupProps {
  items: TagItem[];
  selected: number[];
  onChange: (ids: number[]) => void;
  variant: "flavor" | "restriction";
  label: string;
}

const flavorColors: Record<number, string> = {
  1: "bg-red-100 text-red-600 border-red-200",
  2: "bg-green-100 text-green-600 border-green-200",
  3: "bg-orange-100 text-orange-600 border-orange-200",
  4: "bg-amber-100 text-amber-700 border-amber-200",
  5: "bg-purple-100 text-purple-600 border-purple-200",
  6: "bg-stone-200 text-stone-700 border-stone-300",
  7: "bg-blue-100 text-blue-600 border-blue-200",
  8: "bg-pink-100 text-pink-600 border-pink-200",
  9: "bg-yellow-100 text-yellow-700 border-yellow-200",
  10: "bg-teal-100 text-teal-600 border-teal-200",
};

function getFlavorColor(id: number): string {
  return flavorColors[id] || "bg-gray-100 text-gray-600 border-gray-200";
}

export function TagGroup({ items, selected, onChange, variant, label }: TagGroupProps) {
  const toggle = (id: number) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div>
      <p className="text-sm font-medium text-gray-500 mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const isSelected = selected.includes(item.id);
          const base = "border transition-all duration-200";
          const selectedFlavor = isSelected
            ? getFlavorColor(item.id)
            : "bg-white/40 text-gray-500 border-white/30";
          const selectedRestriction = isSelected
            ? "bg-gray-300 text-gray-800 border-gray-400"
            : "bg-white/40 text-gray-400 border-white/30";

          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${base} ${
                variant === "flavor" ? selectedFlavor : selectedRestriction
              }`}
            >
              {item.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
