# 今天吃什么 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack "What to Eat" web app with iOS liquid glass UI, flavor/restriction selection, dish recommendation, and dish library management.

**Architecture:** Next.js App Router monolith — pages render on server where possible, API routes handle data mutations, Prisma connects to PostgreSQL. Components use Tailwind CSS with custom `backdrop-blur` utilities for the liquid glass aesthetic.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS 3, Prisma ORM, PostgreSQL, framer-motion

---

## File Structure

```
/what-to-eat/                   ← project root (this repo)
├── prisma/
│   ├── schema.prisma           ← data model
│   └── seed.ts                 ← preset dishes, flavors, restrictions
├── src/
│   ├── app/
│   │   ├── layout.tsx          ← root layout with HTML shell + fonts
│   │   ├── page.tsx            ← home page (flavor/restriction selection + recommend)
│   │   ├── globals.css         ← Tailwind directives + glass effect utilities + keyframes
│   │   ├── dishes/
│   │   │   └── page.tsx        ← dish library with search + category filter
│   │   ├── add/
│   │   │   └── page.tsx        ← add custom dish form
│   │   └── api/
│   │       ├── flavors/
│   │       │   └── route.ts    ← GET flavors list
│   │       ├── restrictions/
│   │       │   └── route.ts    ← GET restrictions list
│   │       ├── dishes/
│   │       │   └── route.ts    ← GET (list), POST (create)
│   │       └── recommend/
│   │           └── route.ts    ← POST (get recommendation)
│   ├── components/
│   │   ├── GlassCard.tsx       ← reusable frosted glass card wrapper
│   │   ├── TagGroup.tsx        ← selectable tag grid (flavors / restrictions)
│   │   ├── RecommendResult.tsx ← result modal/card with dish info + "换一个" / "就它了"
│   │   └── BackgroundGlow.tsx  ← decorative gradient blobs behind content
│   └── lib/
│       ├── prisma.ts           ← Prisma client singleton
│       └── recommend.ts        ← recommendation query logic
├── .env                        ← DATABASE_URL (gitignored)
├── .env.example                ← DATABASE_URL placeholder for setup
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
└── package.json
```

Each file has one clear responsibility. `src/lib/recommend.ts` isolates the recommendation algorithm from the API handler. Components are thin presentational wrappers — state lives in page files, passed down as props.

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `next.config.js`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `.env`, `.env.example`, `src/app/globals.css`, `src/app/layout.tsx`

- [ ] **Step 1: Initialize Next.js project**

Run:
```bash
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
```
Expected: project files created in current directory.

- [ ] **Step 2: Install additional dependencies**

Run:
```bash
npm install prisma @prisma/client framer-motion
npm install -D ts-node
```

- [ ] **Step 3: Initialize Prisma**

Run:
```bash
npx prisma init
```
Expected: `prisma/schema.prisma` and `.env` with `DATABASE_URL` created.

- [ ] **Step 4: Configure next.config.js**

Read `next.config.js` then write final version.

Write `next.config.js`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = nextConfig;
```

- [ ] **Step 5: Configure tailwind.config.ts**

Read `tailwind.config.ts` then write final version.

Write `tailwind.config.ts`:
```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Text"',
          '"Helvetica Neue"',
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      backdropBlur: {
        glass: "20px",
      },
      borderRadius: {
        glass: "20px",
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 6: Write .env.example**

Write `.env.example`:
```
DATABASE_URL="postgresql://user:password@host:5432/what-to-eat?schema=public"
```

- [ ] **Step 7: Write globals.css foundation**

Write `src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  .glass {
    background: rgba(255, 255, 255, 0.45);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  .glass-strong {
    background: rgba(255, 255, 255, 0.65);
    backdrop-filter: blur(30px);
    -webkit-backdrop-filter: blur(30px);
    border: 1px solid rgba(255, 255, 255, 0.4);
  }
}
```

- [ ] **Step 8: Write root layout**

Write `src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "今天吃什么",
  description: "帮你决定今天吃什么",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-[#f0eee8] text-gray-800 antialiased">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 9: Verify project builds**

Run:
```bash
npm run build
```
Expected: build succeeds with no errors.

---

### Task 2: Database Schema

**Files:**
- Create: `prisma/schema.prisma`

- [ ] **Step 1: Write Prisma schema**

Write `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Flavor {
  id     Int          @id @default(autoincrement())
  name   String       @unique
  dishes DishFlavor[]
}

model Restriction {
  id     Int                    @id @default(autoincrement())
  name   String                 @unique
  dishes DishAvoidRestriction[]
}

model Dish {
  id               Int                    @id @default(autoincrement())
  name             String
  category         String
  isPreset         Boolean                @default(true)
  createdBy        String?
  createdAt        DateTime               @default(now())
  flavors          DishFlavor[]
  avoidRestrictions DishAvoidRestriction[]
}

model DishFlavor {
  dishId   Int
  flavorId Int
  dish     Dish    @relation(fields: [dishId], references: [id], onDelete: Cascade)
  flavor   Flavor  @relation(fields: [flavorId], references: [id], onDelete: Cascade)
  @@id([dishId, flavorId])
}

model DishAvoidRestriction {
  dishId        Int
  restrictionId Int
  dish          Dish        @relation(fields: [dishId], references: [id], onDelete: Cascade)
  restriction   Restriction @relation(fields: [restrictionId], references: [id], onDelete: Cascade)
  @@id([dishId, restrictionId])
}
```

- [ ] **Step 2: Push schema to database**

Run:
```bash
npx prisma db push
```
Expected: "Your database is now in sync with your schema."

- [ ] **Step 3: Generate Prisma client**

Run:
```bash
npx prisma generate
```
Expected: Prisma client generated without errors.

---

### Task 3: Seed Data

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json` (add prisma.seed config)

- [ ] **Step 1: Write seed script**

Write `prisma/seed.ts`:
```ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const flavors = [
  "麻辣", "清淡", "酸甜", "咸香", "蒜香", "酱香",
  "鲜香", "香辣", "酸辣", "甜辣",
];

const restrictions = [
  "不吃牛肉", "不吃猪肉", "不吃羊肉", "素食",
  "海鲜过敏", "不吃辣", "不吃蒜", "不吃香菜", "不吃葱",
];

const dishes = [
  { name: "番茄炒蛋", category: "素菜", flavors: ["酸甜", "清淡", "鲜香"], avoid: ["不吃辣", "素食"] },
  { name: "麻婆豆腐", category: "素菜", flavors: ["麻辣", "咸香"], avoid: ["不吃辣", "素食"] },
  { name: "宫保鸡丁", category: "荤菜", flavors: ["酸甜", "香辣"], avoid: ["不吃猪肉", "不吃牛肉", "不吃羊肉", "海鲜过敏"] },
  { name: "红烧肉", category: "荤菜", flavors: ["咸香", "酱香"], avoid: ["不吃猪肉", "素食", "不吃辣"] },
  { name: "清蒸鲈鱼", category: "荤菜", flavors: ["清淡", "鲜香"], avoid: ["海鲜过敏", "素食"] },
  { name: "水煮鱼", category: "荤菜", flavors: ["麻辣", "鲜香", "香辣"], avoid: ["海鲜过敏", "素食", "不吃辣"] },
  { name: "回锅肉", category: "荤菜", flavors: ["咸香", "香辣"], avoid: ["不吃猪肉", "素食"] },
  { name: "鱼香肉丝", category: "荤菜", flavors: ["酸甜", "咸香", "酸辣"], avoid: ["不吃猪肉", "素食"] },
  { name: "蒜蓉西兰花", category: "素菜", flavors: ["蒜香", "清淡"], avoid: ["不吃蒜"] },
  { name: "酸辣土豆丝", category: "素菜", flavors: ["酸辣", "咸香"], avoid: ["不吃辣"] },
  { name: "糖醋里脊", category: "荤菜", flavors: ["酸甜", "咸香"], avoid: ["不吃猪肉", "素食"] },
  { name: "地三鲜", category: "素菜", flavors: ["咸香", "鲜香"], avoid: ["不吃蒜"] },
  { name: "兰州拉面", category: "主食", flavors: ["清淡", "咸香", "鲜香"], avoid: ["不吃牛肉", "海鲜过敏"] },
  { name: "蛋炒饭", category: "主食", flavors: ["清淡", "咸香"], avoid: ["海鲜过敏"] },
  { name: "麻辣香锅", category: "荤菜", flavors: ["麻辣", "香辣", "鲜香"], avoid: ["不吃辣"] },
  { name: "皮蛋豆腐", category: "素菜", flavors: ["清淡", "咸香"], avoid: ["素食"] },
  { name: "干煸四季豆", category: "素菜", flavors: ["咸香", "香辣"], avoid: ["不吃辣"] },
  { name: "酸菜鱼", category: "荤菜", flavors: ["酸辣", "鲜香"], avoid: ["海鲜过敏", "素食"] },
  { name: "小炒肉", category: "荤菜", flavors: ["咸香", "香辣", "鲜香"], avoid: ["不吃猪肉", "素食"] },
  { name: "蒸水蛋", category: "素菜", flavors: ["清淡", "鲜香"], avoid: ["素食"] },
  { name: "酸汤肥牛", category: "荤菜", flavors: ["酸辣", "鲜香"], avoid: ["不吃牛肉", "素食"] },
  { name: "葱油拌面", category: "主食", flavors: ["咸香", "清淡"], avoid: ["不吃葱"] },
  { name: "牛肉面", category: "主食", flavors: ["咸香", "鲜香", "香辣"], avoid: ["不吃牛肉", "海鲜过敏"] },
  { name: "螺蛳粉", category: "主食", flavors: ["酸辣", "鲜香", "麻辣"], avoid: ["不吃辣"] },
  { name: "三杯鸡", category: "荤菜", flavors: ["酱香", "咸香"], avoid: ["不吃猪肉", "不吃牛肉", "不吃羊肉", "海鲜过敏"] },
  { name: "拍黄瓜", category: "素菜", flavors: ["清淡", "蒜香", "酸辣"], avoid: ["不吃蒜"] },
  { name: "酸辣粉", category: "小吃", flavors: ["酸辣", "麻辣", "鲜香"], avoid: ["不吃辣"] },
  { name: "汉堡", category: "小吃", flavors: ["咸香", "鲜香"], avoid: ["不吃牛肉", "素食"] },
  { name: "寿司", category: "主食", flavors: ["清淡", "鲜香"], avoid: ["海鲜过敏"] },
  { name: "麻辣烫", category: "小吃", flavors: ["麻辣", "香辣", "鲜香"], avoid: ["不吃辣"] },
];

async function main() {
  console.log("Seeding flavors...");
  for (const name of flavors) {
    await prisma.flavor.upsert({ where: { name }, update: {}, create: { name } });
  }

  console.log("Seeding restrictions...");
  for (const name of restrictions) {
    await prisma.restriction.upsert({ where: { name }, update: {}, create: { name } });
  }

  console.log("Seeding dishes...");
  const flavorRecords = await prisma.flavor.findMany();
  const restrictionRecords = await prisma.restriction.findMany();
  const flavorMap = new Map(flavorRecords.map((f) => [f.name, f.id]));
  const restrictionMap = new Map(restrictionRecords.map((r) => [r.name, r.id]));

  for (const dish of dishes) {
    const dishFlavors = dish.flavors
      .map((name) => flavorMap.get(name))
      .filter((id): id is number => id !== undefined);
    const dishAvoid = dish.avoid
      .map((name) => restrictionMap.get(name))
      .filter((id): id is number => id !== undefined);

    await prisma.dish.create({
      data: {
        name: dish.name,
        category: dish.category,
        isPreset: true,
        flavors: {
          create: dishFlavors.map((flavorId) => ({ flavorId })),
        },
        avoidRestrictions: {
          create: dishAvoid.map((restrictionId) => ({ restrictionId })),
        },
      },
    });
  }

  console.log(`Seeded ${flavors.length} flavors, ${restrictions.length} restrictions, ${dishes.length} dishes.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 2: Add seed config to package.json**

Read `package.json` then edit.

In `package.json`, add to the top-level JSON object:
```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

- [ ] **Step 3: Run seed**

Run:
```bash
npx prisma db seed
```
Expected: "Seeded 10 flavors, 9 restrictions, 30 dishes."

---

### Task 4: Prisma Client Singleton

**Files:**
- Create: `src/lib/prisma.ts`

- [ ] **Step 1: Write Prisma client singleton**

Write `src/lib/prisma.ts`:
```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

---

### Task 5: API — Flavors and Restrictions

**Files:**
- Create: `src/app/api/flavors/route.ts`
- Create: `src/app/api/restrictions/route.ts`

- [ ] **Step 1: Write flavors GET endpoint**

Write `src/app/api/flavors/route.ts`:
```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const flavors = await prisma.flavor.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(flavors);
}
```

- [ ] **Step 2: Write restrictions GET endpoint**

Write `src/app/api/restrictions/route.ts`:
```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const restrictions = await prisma.restriction.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(restrictions);
}
```

---

### Task 6: API — Dishes (List + Create)

**Files:**
- Create: `src/app/api/dishes/route.ts`

- [ ] **Step 1: Write dishes GET/POST endpoint**

Write `src/app/api/dishes/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search") || "";
  const category = req.nextUrl.searchParams.get("category") || "";

  const where: Record<string, unknown> = {};
  if (search) {
    where.name = { contains: search };
  }
  if (category) {
    where.category = category;
  }

  const dishes = await prisma.dish.findMany({
    where,
    include: {
      flavors: { include: { flavor: true } },
      avoidRestrictions: { include: { restriction: true } },
    },
    orderBy: [{ isPreset: "desc" }, { createdAt: "desc" }],
    take: 50,
  });

  return NextResponse.json(dishes);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, category, flavorIds, restrictionIds, createdBy } = body;

  if (!name || !category || !flavorIds?.length) {
    return NextResponse.json(
      { error: "菜品名称、分类和至少一种口味为必填项" },
      { status: 400 }
    );
  }

  const dish = await prisma.dish.create({
    data: {
      name,
      category,
      isPreset: false,
      createdBy: createdBy || null,
      flavors: { create: flavorIds.map((id: number) => ({ flavorId: id })) },
      avoidRestrictions: {
        create: (restrictionIds || []).map((id: number) => ({ restrictionId: id })),
      },
    },
    include: {
      flavors: { include: { flavor: true } },
      avoidRestrictions: { include: { restriction: true } },
    },
  });

  return NextResponse.json(dish, { status: 201 });
}
```

---

### Task 7: API — Recommend

**Files:**
- Create: `src/lib/recommend.ts`
- Create: `src/app/api/recommend/route.ts`

- [ ] **Step 1: Write recommendation query logic**

Write `src/lib/recommend.ts`:
```ts
import { prisma } from "@/lib/prisma";

export async function recommendDish(
  flavorIds: number[],
  restrictionIds: number[],
  excludeId?: number
) {
  const dishes = await prisma.dish.findMany({
    where: {
      flavors: { some: { flavorId: { in: flavorIds } } },
      NOT: {
        avoidRestrictions: { some: { restrictionId: { in: restrictionIds } } },
      },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    include: {
      flavors: { include: { flavor: true } },
      avoidRestrictions: { include: { restriction: true } },
    },
  });

  if (dishes.length === 0) return null;

  const idx = Math.floor(Math.random() * dishes.length);
  return dishes[idx];
}
```

- [ ] **Step 2: Write recommend POST endpoint**

Write `src/app/api/recommend/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { recommendDish } from "@/lib/recommend";

export async function POST(req: NextRequest) {
  const { flavorIds, restrictionIds, excludeId } = await req.json();

  if (!flavorIds?.length) {
    return NextResponse.json(
      { error: "请至少选择一种口味偏好" },
      { status: 400 }
    );
  }

  const dish = await recommendDish(
    flavorIds,
    restrictionIds || [],
    excludeId || undefined
  );

  if (!dish) {
    return NextResponse.json(
      { error: "没有找到匹配的菜品，试试调整口味或忌口条件" },
      { status: 404 }
    );
  }

  return NextResponse.json(dish);
}
```

---

### Task 8: UI — BackgroundGlow Component

**Files:**
- Create: `src/components/BackgroundGlow.tsx`

- [ ] **Step 1: Write BackgroundGlow component**

Write `src/components/BackgroundGlow.tsx`:
```tsx
export function BackgroundGlow() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div
        className="absolute -top-40 -left-20 w-72 h-72 rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(255,160,122,0.5) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/3 -right-20 w-96 h-96 rounded-full opacity-25"
        style={{
          background:
            "radial-gradient(circle, rgba(135,206,235,0.4) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-20 left-1/4 w-80 h-80 rounded-full opacity-25"
        style={{
          background:
            "radial-gradient(circle, rgba(200,160,255,0.4) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
```

---

### Task 9: UI — GlassCard Component

**Files:**
- Create: `src/components/GlassCard.tsx`

- [ ] **Step 1: Write GlassCard component**

Write `src/components/GlassCard.tsx`:
```tsx
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  strong?: boolean;
}

export function GlassCard({ children, className = "", strong }: GlassCardProps) {
  return (
    <div
      className={`${strong ? "glass-strong" : "glass"} rounded-glass shadow-lg shadow-black/5 ${className}`}
    >
      {children}
    </div>
  );
}
```

---

### Task 10: UI — TagGroup Component

**Files:**
- Create: `src/components/TagGroup.tsx`

- [ ] **Step 1: Write TagGroup component**

Write `src/components/TagGroup.tsx`:
```tsx
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
          const base =
            variant === "flavor"
              ? "border transition-all duration-200"
              : "border transition-all duration-200";
          const selectedFlavor = isSelected ? getFlavorColor(item.id) : "bg-white/40 text-gray-500 border-white/30";
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
```

---

### Task 11: UI — RecommendResult Component

**Files:**
- Create: `src/components/RecommendResult.tsx`

- [ ] **Step 1: Write RecommendResult component**

Write `src/components/RecommendResult.tsx`:
```tsx
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
            <p className="text-sm text-gray-400 mb-2">
              {dish.category}
            </p>
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
```

---

### Task 12: Page — Home (`/`)

**Files:**
- Create: `src/app/page.tsx`

- [ ] **Step 1: Write home page**

Write `src/app/page.tsx`:
```tsx
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
    fetch("/api/flavors")
      .then((r) => r.json())
      .then(setFlavors);
    fetch("/api/restrictions")
      .then((r) => r.json())
      .then(setRestrictions);
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

  const handleReroll = () => {
    if (result) {
      getRecommendation(result.id);
    }
  };

  const handleConfirm = () => {
    setConfirmed(true);
  };

  return (
    <>
      <BackgroundGlow />
      <main className="max-w-lg mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            今天吃什么
          </h1>
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
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {result.name}
              </h2>
              <p className="text-gray-400 text-sm">{result.category}</p>
              <button
                onClick={() => {
                  setConfirmed(false);
                  setResult(null);
                }}
                className="mt-8 px-6 py-2.5 rounded-full text-sm font-medium glass hover:scale-105 transition-transform"
              >
                重新选择
              </button>
            </GlassCard>
          </motion.div>
        ) : (
          <>
            {/* Preferences Card */}
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

            {/* Recommend Button */}
            <div className="text-center mb-6">
              <button
                onClick={() => getRecommendation()}
                disabled={loading}
                className="px-10 py-3.5 rounded-full text-lg font-semibold bg-orange-400 text-white hover:bg-orange-500 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-orange-400/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "挑选中..." : "🎲  帮我决定"}
              </button>
              {error && (
                <p className="text-red-400 text-sm mt-3">{error}</p>
              )}
            </div>

            {/* Result */}
            <RecommendResult
              dish={result}
              loading={loading}
              onReroll={handleReroll}
              onConfirm={handleConfirm}
            />
          </>
        )}

        {/* Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 p-4">
          <GlassCard className="max-w-lg mx-auto p-4 flex justify-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-orange-500 flex flex-col items-center gap-1"
            >
              <span className="text-lg">🎲</span>
              推荐
            </Link>
            <Link
              href="/dishes"
              className="text-sm font-medium text-gray-400 hover:text-gray-600 flex flex-col items-center gap-1 transition-colors"
            >
              <span className="text-lg">📖</span>
              菜品库
            </Link>
            <Link
              href="/add"
              className="text-sm font-medium text-gray-400 hover:text-gray-600 flex flex-col items-center gap-1 transition-colors"
            >
              <span className="text-lg">➕</span>
              添加
            </Link>
          </GlassCard>
        </nav>
      </main>
    </>
  );
}

```

---

### Task 13: Page — Dish Library (`/dishes`)

**Files:**
- Create: `src/app/dishes/page.tsx`

- [ ] **Step 1: Write dishes page**

Write `src/app/dishes/page.tsx`:
```tsx
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

    fetch(`/api/dishes?${params.toString()}`)
      .then((r) => r.json())
      .then(setDishes);
  }, [search, category]);

  return (
    <>
      <BackgroundGlow />
      <main className="max-w-lg mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="text-gray-400 hover:text-gray-600">
            ← 返回
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">菜品库</h1>
        </div>

        {/* Search */}
        <GlassCard className="p-4 mb-4">
          <input
            type="text"
            placeholder="搜索菜品..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-gray-700 placeholder-gray-300 text-sm"
          />
        </GlassCard>

        {/* Category Filter */}
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

        {/* Dish List */}
        <div className="space-y-3">
          {dishes.map((dish) => (
            <GlassCard key={dish.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {dish.name}
                    {!dish.isPreset && (
                      <span className="text-xs text-gray-400 ml-2">
                        by {dish.createdBy || "匿名"}
                      </span>
                    )}
                  </h3>
                  <span className="text-xs text-gray-400">{dish.category}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {dish.flavors.map(({ flavor }) => (
                  <span
                    key={flavor.id}
                    className="px-2 py-0.5 rounded-full text-xs bg-white/50 text-gray-500"
                  >
                    {flavor.name}
                  </span>
                ))}
              </div>
              {dish.avoidRestrictions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {dish.avoidRestrictions.map(({ restriction }) => (
                    <span
                      key={restriction.id}
                      className="px-2 py-0.5 rounded-full text-xs bg-red-50 text-red-400 border border-red-100"
                    >
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

        {/* Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 p-4">
          <GlassCard className="max-w-lg mx-auto p-4 flex justify-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-gray-400 hover:text-gray-600 flex flex-col items-center gap-1"
            >
              <span className="text-lg">🎲</span>
              推荐
            </Link>
            <Link
              href="/dishes"
              className="text-sm font-medium text-orange-500 flex flex-col items-center gap-1"
            >
              <span className="text-lg">📖</span>
              菜品库
            </Link>
            <Link
              href="/add"
              className="text-sm font-medium text-gray-400 hover:text-gray-600 flex flex-col items-center gap-1"
            >
              <span className="text-lg">➕</span>
              添加
            </Link>
          </GlassCard>
        </nav>
      </main>
    </>
  );
}
```

---

### Task 14: Page — Add Dish (`/add`)

**Files:**
- Create: `src/app/add/page.tsx`

- [ ] **Step 1: Write add dish page**

Write `src/app/add/page.tsx`:
```tsx
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
    fetch("/api/flavors")
      .then((r) => r.json())
      .then(setFlavors);
    fetch("/api/restrictions")
      .then((r) => r.json())
      .then(setRestrictions);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("请输入菜品名称");
      return;
    }
    if (!selectedFlavors.length) {
      setError("请至少选择一种口味");
      return;
    }

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
          <Link href="/" className="text-gray-400 hover:text-gray-600">
            ← 返回
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">添加菜品</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <GlassCard className="p-6 space-y-6 mb-6">
            {/* Name */}
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-2">
                菜品名称
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：红烧肉"
                className="w-full bg-white/50 border border-white/30 rounded-xl px-4 py-2.5 text-gray-700 placeholder-gray-300 outline-none focus:border-orange-300 transition-colors text-sm"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-2">
                分类
              </label>
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

            {/* Flavors */}
            <TagGroup
              items={flavors}
              selected={selectedFlavors}
              onChange={setSelectedFlavors}
              variant="flavor"
              label="口味标签（可多选）"
            />

            {/* Restrictions to avoid */}
            <div className="border-t border-white/20 pt-4">
              <TagGroup
                items={restrictions}
                selected={selectedRestrictions}
                onChange={setSelectedRestrictions}
                variant="restriction"
                label="不适合的忌口（可多选）"
              />
            </div>

            {/* Created by */}
            <div className="border-t border-white/20 pt-4">
              <label className="text-sm font-medium text-gray-500 block mb-2">
                你的昵称（选填）
              </label>
              <input
                type="text"
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
                placeholder="留下你的名字"
                className="w-full bg-white/50 border border-white/30 rounded-xl px-4 py-2.5 text-gray-700 placeholder-gray-300 outline-none focus:border-orange-300 transition-colors text-sm"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
          </GlassCard>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-full text-lg font-semibold bg-orange-400 text-white hover:bg-orange-500 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-orange-400/25 disabled:opacity-50"
          >
            {submitting ? "添加中..." : "添加菜品"}
          </button>
        </form>

        {/* Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 p-4">
          <GlassCard className="max-w-lg mx-auto p-4 flex justify-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-gray-400 hover:text-gray-600 flex flex-col items-center gap-1"
            >
              <span className="text-lg">🎲</span>
              推荐
            </Link>
            <Link
              href="/dishes"
              className="text-sm font-medium text-gray-400 hover:text-gray-600 flex flex-col items-center gap-1"
            >
              <span className="text-lg">📖</span>
              菜品库
            </Link>
            <Link
              href="/add"
              className="text-sm font-medium text-orange-500 flex flex-col items-center gap-1"
            >
              <span className="text-lg">➕</span>
              添加
            </Link>
          </GlassCard>
        </nav>
      </main>
    </>
  );
}
```

---

### Task 15: Deploy Configuration

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Write Vercel config**

Write `vercel.json`:
```json
{
  "buildCommand": "npx prisma generate && next build"
}
```

- [ ] **Step 2: Verify build**

Run:
```bash
npm run build
```
Expected: build succeeds.

---

### Task 16: Final Verification

- [ ] **Step 1: Full build check**

Run:
```bash
npm run build
```
Expected: build completes without errors or warnings.

- [ ] **Step 2: Start dev server and verify**

Run:
```bash
npm run dev
```
Expected: dev server starts on localhost:3000. Open browser and verify:
- Home page loads with flavor/restriction tags
- Clicking tags selects/deselects them
- "帮我决定" button shows recommendation
- "/dishes" shows dish library with search and category filter
- "/add" form submits a new dish and redirects to dishes page
- Glass effect renders on all cards
- Mobile layout is correct
- Bottom nav navigates between pages
