import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  const tags = await (prisma as any).tag.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(tags);
}

export async function POST(req: NextRequest) {
  const { name, color } = await req.json();
  const tag = await (prisma as any).tag.upsert({
    where: { name },
    update: {},
    create: { name, color: color || "#6366f1" },
  });
  return NextResponse.json(tag);
}

export async function PUT(req: NextRequest) {
  const { pharmacyId, tagId, action } = await req.json();
  if (action === "add") {
    await (prisma as any).pharmacyTag.upsert({
      where: { pharmacyId_tagId: { pharmacyId, tagId } },
      update: {},
      create: { pharmacyId, tagId },
    });
  } else {
    await (prisma as any).pharmacyTag.delete({
      where: { pharmacyId_tagId: { pharmacyId, tagId } },
    });
  }
  return NextResponse.json({ success: true });
}
