import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const restrictions = await prisma.restriction.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(restrictions);
}
