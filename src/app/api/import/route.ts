import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { rows } = body as { rows: Record<string, string>[] };

  const created = [];
  for (const row of rows) {
    try {
      const pharmacy = await (prisma as any).pharmacy.create({
        data: {
          name: row.name || row.Name || "Unknown",
          address: row.address || row.Address || null,
          city: row.city || row.City || null,
          state: row.state || row.State || null,
          zip: row.zip || row.ZIP || row.Zip || null,
          phone: row.phone || row.Phone || null,
          website: row.website || row.Website || null,
          specialty: row.specialty || row.Specialty || null,
          ownerName: row.ownerName || row["Owner Name"] || null,
          benefitScore: parseInt(row.benefitScore || row["Benefit Score"] || "0") || null,
          priority: row.priority || row.Priority || "Medium",
          status: row.status || row.Status || "Not Contacted",
        },
      });
      created.push(pharmacy);
    } catch {
      // skip duplicate/invalid rows
    }
  }

  return NextResponse.json({ imported: created.length });
}
