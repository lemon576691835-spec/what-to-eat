import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search") || "";
  const category = req.nextUrl.searchParams.get("category") || "";

  const where: Record<string, unknown> = {};
  if (search) where.name = { contains: search };
  if (category) where.category = category;

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
