import { NextRequest, NextResponse } from "next/server";
import { recommendDish } from "@/lib/recommend";

export const dynamic = "force-dynamic";

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
