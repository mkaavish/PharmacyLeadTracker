import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter } as any);

// All publicly confirmed info from web research (NPI registry, pharmacy websites, Google Maps)
const UPDATES: Array<{ name: string; city: string; website?: string; ownerName?: string; pharmacistInCharge?: string }> = [
  // Dallas
  { name: "Abrams Royal Pharmacy", city: "Dallas", website: "https://www.arp-rx.com", ownerName: "Bob Scarbrough", pharmacistInCharge: "Bob Scarbrough, RPh" },
  { name: "Abrams Royal Pharmacy II", city: "Plano", website: "https://www.arp-rx.com", ownerName: "Bob Scarbrough", pharmacistInCharge: "Bob Scarbrough, RPh" },
  { name: "Acorn Pharmacy Inc", city: "Dallas", ownerName: "Bindu Hima Katuri" },
  { name: "Aldridge's Family Pharmacy", city: "Dallas", website: "https://www.aldridgesrx.com", ownerName: "Howard Aldridge" },
  { name: "Aldridges Family II Pharmacy", city: "Dallas", website: "https://www.aldridgesrx.com", ownerName: "Howard Aldridge" },
  { name: "Alta Pharmaceutical Care Inc", city: "Dallas", ownerName: "Sammy Altaan", pharmacistInCharge: "Sammy Altaan, PharmD" },
  { name: "Anjana Pharmacy LLC", city: "Dallas", website: "https://www.cashsaverpharmacy.com", ownerName: "Nandana Kavuri" },
  { name: "Armstrong RX II LP", city: "Dallas", ownerName: "Grant Armstrong", pharmacistInCharge: "Grant Armstrong, PharmD" },
  { name: "HealthPro Pharmacy", city: "Dallas", ownerName: "Folarin Oluwole Ajijo" },
  // Plano
  { name: "Artisan Drug Inc", city: "Plano", website: "https://www.artisandrug.com", ownerName: "Chun Zhang" },
  { name: "Bluestone Pharmacy LLC", city: "Plano", website: "https://www.bluestonerx.com", ownerName: "Rima Patel" },
  { name: "CaringRx Pharmacy", city: "Plano", website: "http://caringrxpharmacy.com" },
  { name: "Caretecture LLC", city: "Plano", ownerName: "Kazim Oyenuga", pharmacistInCharge: "Kazim Oyenuga, PhD, RPh" },
  { name: "Crystal Life Pharmacy Inc", city: "Plano", website: "https://www.crystalliferx.com" },
  // Frisco
  { name: "Frisco Apothecary LP", city: "Frisco", ownerName: "Raj Milan Chhadua", pharmacistInCharge: "Raj Milan Chhadua, PharmD" },
  { name: "FriscoRx and Compounding LLC", city: "Frisco", ownerName: "Akindele Akinseye" },
  { name: "Drug Crafters LP", city: "Frisco", website: "https://www.drugcrafters.com", ownerName: "Lawrence Rossetti", pharmacistInCharge: "Erin Thompson" },
  { name: "Glendale Pharmacy Frisco LLC", city: "Frisco", website: "https://glendalepharmacy.com", pharmacistInCharge: "Clement Aboge" },
  // McKinney
  { name: "McKinney Care Pharmacy and Compounding LLC", city: "McKinney", website: "https://www.mckinneycarepharmacy.com" },
  { name: "North Side Pharmacy Inc", city: "McKinney", pharmacistInCharge: "James Edward Petkovsek" },
  { name: "North Central Pharmacy LLC", city: "McKinney", website: "http://northcentralrx.com", pharmacistInCharge: "Chinedu Okocha" },
  { name: "Pars Pharmacy LLC", city: "McKinney", ownerName: "Tabraiz Khan", pharmacistInCharge: "Tabraiz Khan" },
  // Allen
  { name: "Allen Family Drug", city: "Allen", website: "https://allenfamilydrug.com", ownerName: "Andrew Komuves", pharmacistInCharge: "Andrew Komuves" },
  { name: "Green Leaf Pharmacy LLC", city: "Allen", pharmacistInCharge: "Samuel Kiigi" },
  { name: "Lifetime Pharmacy LLC", city: "Allen", website: "https://www.lifetime-pharmacy.com", ownerName: "Anil Kumar Rapeti", pharmacistInCharge: "Anil Kumar Rapeti, RPh" },
  { name: "Moataz Pharmaceuticals", city: "Allen", website: "https://www.pillmartrx.com", ownerName: "Moataz Metwally", pharmacistInCharge: "Moataz Metwally, RPh" },
  // Richardson
  { name: "Arapaho Pharmacy", city: "Richardson", website: "https://arapahopharmacy.com", pharmacistInCharge: "Orville W. Weiss, RPh" },
  { name: "El Dorado Pharmacy LLC", city: "Richardson", ownerName: "Joshua McCooey" },
  { name: "HeartCare Pharmacy Inc", city: "Richardson", website: "https://heartcarepharmacyrx.com" },
  { name: "Pineland Pharmacy LLC", city: "Richardson", pharmacistInCharge: "Chris McElfresh" },
  { name: "Razi RX Inc", city: "Richardson", ownerName: "Hossein Maleki", pharmacistInCharge: "Saadi Neamati, PharmD" },
  { name: "Village Pharmacy Solutions LLC", city: "Richardson", website: "https://villagepharmacytx.com", ownerName: "Nisreen Batarseh", pharmacistInCharge: "Nisreen Batarseh" },
  // Garland
  { name: "Broadway Pharmacy LLC", city: "Garland", website: "http://www.broadwayrxgarland.com" },
  { name: "Chebycare Pharmacy", city: "Garland", website: "https://www.chebycarepharmacy.com", ownerName: "Constance Echebiri", pharmacistInCharge: "Constance Echebiri" },
  { name: "Independent Pharmacy Associates LLC", city: "Garland", ownerName: "Andrew Cummings", pharmacistInCharge: "Andrew Cummings, RPh" },
  { name: "MedWorld Pharmacy Inc", city: "Garland", ownerName: "Andrew Coney, PharmD" },
  { name: "Ridgewood Pharmacy LLC", city: "Garland", website: "http://ridgewoodpharmacy.com", ownerName: "Naresh Vagdiya", pharmacistInCharge: "Naresh Vagdiya" },
  { name: "Vitora Ventures Inc", city: "Garland", ownerName: "Abdelaziz Ketani" },
  // Irving
  { name: "Burtis Drug Inc", city: "Irving", ownerName: "John Austin Burtis Sr." },
  { name: "Dashwood Pharmacy", city: "Irving", pharmacistInCharge: "Ravi Morisetty" },
  { name: "Family Pharmacy at Las Colinas LLC", city: "Irving", website: "https://lascolinaspharmacy.com" },
  { name: "GenRx Discount Pharmacy Inc", city: "Irving", website: "https://generxdiscountpharmacy.com" },
  { name: "Irving Pharmacy LLC", city: "Irving", website: "https://irvingrx.com" },
  // Carrollton
  { name: "Carrollton Regional Pharmacy", city: "Carrollton", website: "https://crmcpharmacy.com", ownerName: "Vipulbhai Sakhiya" },
  { name: "Hebron Pharmacy LLC", city: "Carrollton", website: "http://www.hebronpharmacy.com" },
  { name: "Hillcrest Pharmacy LLC", city: "Carrollton", website: "https://www.hillcrestrx.com" },
  // Addison
  { name: "A-Script Pharmacy Inc", city: "Addison", ownerName: "Muoi Tran" },
  { name: "Pharmacy Care USA of Addison LLC", city: "Addison", website: "https://pharmcareusa.com" },
  // Flower Mound
  { name: "Long Prairie Pharmacy LLC", city: "Flower Mound", website: "https://www.longprairiepharmacy.com", ownerName: "Praful Patel" },
  { name: "Ready RX Inc", city: "Flower Mound", website: "https://readyrx.us", pharmacistInCharge: "Rama Almahayni" },
  // Lewisville
  { name: "Ajijo Inc", city: "Lewisville", ownerName: "Folarin Ajijo", pharmacistInCharge: "Folarin Ajijo" },
  { name: "RxMed Pharmacy PLLC", city: "Lewisville", ownerName: "Majid Reza Jafari", pharmacistInCharge: "Majid Reza Jafari" },
  { name: "Health America LLC", city: "Lewisville", website: "https://www.healthamericapharmacy.com", ownerName: "Javaid Ajmal" },
  // Denton
  { name: "Addis Pharmacy Inc", city: "Denton", website: "https://addispharm.com", ownerName: "Noon Hamid" },
  { name: "Denton Apothecary LP", city: "Denton", website: "https://renuerx.com" },
  { name: "Premium Family Pharmacy", city: "Denton", website: "https://www.premiumfamilyrx.com" },
  { name: "Texas Community Pharmacy Services", city: "Denton", website: "https://communitypharmacy.com", ownerName: "Nancy Penn Selby", pharmacistInCharge: "Kelly S. Selby" },
  { name: "Yarbrough Pharmacy", city: "Denton", ownerName: "Lonnie Yarbrough" },
  // Southlake
  { name: "Pharmacy Plus Inc", city: "Southlake", website: "https://gopharmacyplus.com", ownerName: "Thomas Neale Sr." },
  // Colleyville
  { name: "MedRock Texas Pharmacy LLC", city: "Colleyville", website: "https://medrockpharmacy.com" },
  { name: "Village Lane Apothecary", city: "Colleyville", website: "https://www.villagelaneapothecary.com", pharmacistInCharge: "Lesli Holt" },
  { name: "Westpark Discount Pharmacy Inc", city: "Colleyville", website: "https://www.westparkdiscountpharmacy.com" },
  // Grapevine
  { name: "Grapevine Drug Mart Inc", city: "Grapevine", website: "https://grapevinedrug.com", ownerName: "Shelly Moss" },
  { name: "Grapevine Pharmacy Inc", city: "Grapevine", ownerName: "Natalie Benitez" },
  // Keller
  { name: "Bear Creek Pharmacy LLC", city: "Keller", website: "https://www.bearcreekpharmacyllc.com", ownerName: "Henry Simo", pharmacistInCharge: "Henry Simo" },
  { name: "Seven Seas Pharma Inc", city: "Keller", ownerName: "Hiren Raval", pharmacistInCharge: "Hiren Raval" },
  // Arlington
  { name: "Alsabrook Inc", city: "Arlington", website: "https://www.rayspharmacy.com", ownerName: "Jeff Alsabrook" },
  { name: "Creative Compounding RX LLC", city: "Arlington", website: "https://creativecompoundingrx.com" },
  { name: "Express Care Pharmacy LLC", city: "Arlington", website: "https://www.expresscarepharmacy.net" },
  { name: "Haltom Pharmacy LLC", city: "Arlington", pharmacistInCharge: "Thanh Quang Ngo" },
  { name: "Highpoint Pharmacy LP", city: "Arlington", website: "https://www.hpptx.com", ownerName: "Loren Beechner" },
  // Fort Worth
  { name: "Be Well Pharmacy LLC", city: "Fort Worth", pharmacistInCharge: "Gregorius M Brown Jr" },
  { name: "Best Value Custom Meds", city: "Fort Worth", website: "https://www.bestvaluepharmacies.com" },
  { name: "Better Health Pharmacy LLC", city: "Fort Worth", website: "https://betterhealthfw.com" },
  { name: "Daniel Drug Inc", city: "Fort Worth", website: "https://www.danieldrug.com", ownerName: "Dan Fuchshuber" },
  { name: "Care RX Pharmacy LLC", city: "Fort Worth", website: "https://carerxpharmacytx.com", pharmacistInCharge: "Trang Ho" },
  { name: "Clearfork Pharmacy LLC", city: "Fort Worth", website: "https://www.clearforkrx.com", ownerName: "Steve Baldridge" },
  { name: "Eklingji Healthcare LLC", city: "Fort Worth", pharmacistInCharge: "Raman Joshi" },
  // Rowlett
  { name: "Express Care Pharmacy", city: "Rowlett", website: "https://www.expresscarepharmacy.net" },
  { name: "Salud Pharmacy #1 LLC", city: "Rowlett", ownerName: "Raymond Amaechi" },
  // Rockwall
  { name: "BZ Pharmacy Inc", city: "Rockwall", website: "https://www.bzpharmacy.com", ownerName: "Ashley Michelle Downing" },
  { name: "Super Rockwall Drugstore LP", city: "Rockwall", website: "https://www.rockwallsuperdrugstore.com", ownerName: "Marites Serna" },
  // Murphy
  { name: "Leeds Pharmacy LLC", city: "Murphy", ownerName: "Yan Frankel" },
  { name: "Murphy RX LLC", city: "Murphy", website: "https://murphy-rx.com", ownerName: "Austin Howard" },
  { name: "Pharmacy Enterprises of Texas", city: "Murphy", website: "https://scripx.com", ownerName: "Jon Eaton" },
  // Wylie
  { name: "Helios Pharmacy LLC", city: "Wylie", pharmacistInCharge: "Kim Nga Vo" },
  // The Colony
  { name: "Health One Pharmacy LLC", city: "The Colony", website: "https://www.health1rx.com", ownerName: "Thomas Vadopparambil Thomas" },
  { name: "Favos Incorporated", city: "The Colony", pharmacistInCharge: "Niki Akinseye" },
];

async function main() {
  let updated = 0;
  let notFound = 0;

  for (const u of UPDATES) {
    const pharmacy = await (prisma as any).pharmacy.findFirst({
      where: { name: u.name, city: u.city },
    });

    if (!pharmacy) {
      console.log(`✗ Not found: ${u.name} (${u.city})`);
      notFound++;
      continue;
    }

    const data: Record<string, string> = {};
    if (u.website) data.website = u.website;
    if (u.ownerName) data.ownerName = u.ownerName;
    if (u.pharmacistInCharge) data.pharmacistInCharge = u.pharmacistInCharge;

    if (Object.keys(data).length === 0) continue;

    await (prisma as any).pharmacy.update({
      where: { id: pharmacy.id },
      data,
    });

    const fields = Object.keys(data).join(", ");
    console.log(`✓ ${u.name} (${u.city}) → ${fields}`);
    updated++;
  }

  console.log(`\n✅ Updated ${updated} pharmacies, ${notFound} not found`);
}

main().catch(console.error).finally(() => (prisma as any).$disconnect());
