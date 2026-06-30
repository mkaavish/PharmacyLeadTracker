import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const existing = await (prisma as any).pharmacy.findUnique({ where: { id: parseInt(id) } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const pharmacy = await (prisma as any).pharmacy.update({
    where: { id: parseInt(id) },
    data: { isFavorite: !existing.isFavorite },
  });
  return NextResponse.json({ isFavorite: pharmacy.isFavorite });
}
