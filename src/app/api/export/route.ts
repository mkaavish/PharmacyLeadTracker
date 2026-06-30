import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const format = searchParams.get("format") || "csv";
  const status = searchParams.get("status") || "";
  const priority = searchParams.get("priority") || "";

  const where: any = {};
  if (status) where.status = status;
  if (priority) where.priority = priority;

  const pharmacies = await (prisma as any).pharmacy.findMany({
    where,
    include: { tags: { include: { tag: true } } },
    orderBy: { name: "asc" },
  });

  const rows = pharmacies.map((p: any) => ({
    Name: p.name,
    Address: p.address || "",
    City: p.city || "",
    State: p.state || "",
    ZIP: p.zip || "",
    Phone: p.phone || "",
    Website: p.website || "",
    Specialty: p.specialty || "",
    "Num Locations": p.numLocations || "",
    "Owner Name": p.ownerName || "",
    "Pharmacist in Charge": p.pharmacistInCharge || "",
    "Owner Email": p.ownerEmail || "",
    LinkedIn: p.linkedin || "",
    "Benefit Score": p.benefitScore || "",
    Priority: p.priority || "",
    "Estimated Size": p.estimatedSize || "",
    Status: p.status,
    Contacted: p.contacted ? "Yes" : "No",
    "First Contact Date": p.firstContactDate ? new Date(p.firstContactDate).toLocaleDateString() : "",
    "Last Contact Date": p.lastContactDate ? new Date(p.lastContactDate).toLocaleDateString() : "",
    "Next Follow-up": p.nextFollowUpDate ? new Date(p.nextFollowUpDate).toLocaleDateString() : "",
    "Preferred Contact": p.preferredContactMethod || "",
    "Decision Maker": p.decisionMaker || "",
    "Close Probability %": p.probabilityOfClosing || "",
    "Expected Monthly Value": p.expectedMonthlyValue || "",
    "Lifetime Value": p.lifetimeValue || "",
    Source: p.source || "",
    Tags: p.tags.map((t: any) => t.tag.name).join(", "),
    Favorite: p.isFavorite ? "Yes" : "No",
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Pharmacies");

  if (format === "xlsx") {
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="pharmacies.xlsx"',
      },
    });
  }

  const csv = XLSX.utils.sheet_to_csv(ws);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="pharmacies.csv"',
    },
  });
}
