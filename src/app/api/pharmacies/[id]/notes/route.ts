import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const notes = await (prisma as any).note.findMany({
    where: { pharmacyId: parseInt(id) },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(notes);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { content } = await req.json();
  const note = await (prisma as any).note.create({
    data: { pharmacyId: parseInt(id), content },
  });
  await (prisma as any).activityLog.create({
    data: { pharmacyId: parseInt(id), action: "Note Added", detail: content.substring(0, 100) },
  });
  return NextResponse.json(note, { status: 201 });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { noteId, content } = await req.json();
  const note = await (prisma as any).note.update({
    where: { id: noteId, pharmacyId: parseInt(id) },
    data: { content },
  });
  return NextResponse.json(note);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { noteId } = await req.json();
  await (prisma as any).note.delete({ where: { id: noteId, pharmacyId: parseInt(id) } });
  return NextResponse.json({ success: true });
}
