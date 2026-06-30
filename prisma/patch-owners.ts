import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter } as any);

// Only pharmacies with CONFIRMED public info — exact name match, verified source
const UPDATES = [
  {
    name: "Flower Mound Pharmacy",
    // Source: flowermoundpharmacy.com/about.php — lists Dennis W. Song, RPh as owner/pharmacist
    data: { ownerName: "Dennis W. Song, RPh", pharmacistInCharge: "Dennis W. Song, RPh", phone: "(972) 355-4614", website: "https://flowermoundpharmacy.com" },
  },
  {
    name: "Spring Creek Pharmacy",
    // Source: LinkedIn — Cindy Zhang listed as Business Owner of Spring Creek Pharmacy, Plano TX
    data: { ownerName: "Cindy Zhang", pharmacistInCharge: "Cindy Zhang", website: "https://www.springcreekpharmacy.com" },
  },
  {
    name: "Addison Pharmacy",
    // Source: addisonrx.com — confirmed website, no owner publicly named
    data: { website: "https://www.addisonrx.com" },
  },
  {
    name: "Uptown Pharmacy Dallas",
    // Source: uptownrxpharmacy.com — confirmed website, no owner publicly named
    data: { website: "https://uptownrxpharmacy.com" },
  },
];

async function main() {
  for (const u of UPDATES) {
    const p = await (prisma as any).pharmacy.findFirst({ where: { name: u.name } });
    if (p) {
      await (prisma as any).pharmacy.update({ where: { id: p.id }, data: u.data });
      console.log(`✓ Updated: ${u.name} →`, Object.keys(u.data).join(", "));
    } else {
      console.log(`✗ Not found: ${u.name}`);
    }
  }
}

main().catch(console.error).finally(() => (prisma as any).$disconnect());
