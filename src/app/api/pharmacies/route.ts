import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const priority = searchParams.get("priority") || "";
  const city = searchParams.get("city") || "";
  const specialty = searchParams.get("specialty") || "";
  const contacted = searchParams.get("contacted") || "";
  const isFavorite = searchParams.get("isFavorite") || "";
  const tag = searchParams.get("tag") || "";
  const sortBy = searchParams.get("sortBy") || "name";
  const sortDir = searchParams.get("sortDir") || "asc";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "50");

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { city: { contains: search } },
      { ownerName: { contains: search } },
      { phone: { contains: search } },
      { website: { contains: search } },
    ];
  }
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (city) where.city = city;
  if (specialty) where.specialty = specialty;
  if (contacted === "true") where.contacted = true;
  if (contacted === "false") where.contacted = false;
  if (isFavorite === "true") where.isFavorite = true;

  if (tag) {
    where.tags = { some: { tag: { name: tag } } };
  }

  const total = await (prisma as any).pharmacy.count({ where });

  const orderBy: any = {};
  if (["name", "city", "status", "priority", "benefitScore", "lastContactDate", "nextFollowUpDate", "createdAt"].includes(sortBy)) {
    orderBy[sortBy] = sortDir;
  }

  const pharmacies = await (prisma as any).pharmacy.findMany({
    where,
    orderBy,
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      tags: { include: { tag: true } },
      _count: { select: { notes: true, tasks: true } },
    },
  });

  return NextResponse.json({ pharmacies, total, page, pageSize });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const pharmacy = await (prisma as any).pharmacy.create({
    data: body,
    include: { tags: { include: { tag: true } } },
  });
  return NextResponse.json(pharmacy, { status: 201 });
}
