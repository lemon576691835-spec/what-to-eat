import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const flavors = await prisma.flavor.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(flavors);
}
