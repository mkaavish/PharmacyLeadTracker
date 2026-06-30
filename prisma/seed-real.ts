import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter } as any);

// Real independent pharmacies in DFW — sourced from NPI Registry (npiregistry.cms.hhs.gov)
const PHARMACIES = [
  // Dallas
  { name: "Abrams Royal Pharmacy", address: "8220 Abrams Rd", city: "Dallas", state: "TX", zip: "75231", phone: "(214) 349-8000", website: "https://www.arp-rx.com", specialty: "General", priority: "High", benefitScore: 8 },
  { name: "Abrams Royal Pharmacy II", address: "4909 W Park Blvd Ste 177", city: "Plano", state: "TX", zip: "75093", phone: "(972) 599-7700", website: "https://www.arp-rx.com", specialty: "General", priority: "High", benefitScore: 8 },
  { name: "Acorn Pharmacy Inc", address: "5315 Ross Ave", city: "Dallas", state: "TX", zip: "75206", phone: "(214) 887-0744", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Aldridge's Family Pharmacy", address: "1408 Bonnie View Rd", city: "Dallas", state: "TX", zip: "75203", phone: "(214) 943-2322", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Aldridges Family II Pharmacy", address: "302 W 9th St", city: "Dallas", state: "TX", zip: "75208", phone: "(214) 942-2811", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Alta Pharmaceutical Care Inc", address: "3434 W Illinois Ave Ste 7", city: "Dallas", state: "TX", zip: "75211", phone: "(214) 330-5700", specialty: "General", priority: "Medium", benefitScore: 5 },
  { name: "American Custom Compounding Pharmacy", address: "2607 Walnut Hill Ln Suite 220", city: "Dallas", state: "TX", zip: "75229", phone: "(214) 366-0022", specialty: "Compounding", priority: "High", benefitScore: 9 },
  { name: "Anjana Pharmacy LLC", address: "2130 E Ledbetter Dr", city: "Dallas", state: "TX", zip: "75216", phone: "(214) 374-3559", specialty: "General", priority: "Low", benefitScore: 5 },
  { name: "Apple Drugs", address: "4811B Columbia Ave", city: "Dallas", state: "TX", zip: "75226", phone: "(214) 821-4008", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "HealthPro Pharmacy", address: "800 N Bishop Ave Ste 4", city: "Dallas", state: "TX", zip: "75208", phone: "(214) 942-4000", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "AC Pharmacy LLC", address: "9090 Skillman St Suite 180A", city: "Dallas", state: "TX", zip: "75243", phone: "(214) 221-0353", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Armstrong RX II LP", address: "11613 N Central Expressway Ste 114", city: "Dallas", state: "TX", zip: "75243", phone: "(214) 361-9228", specialty: "General", priority: "Medium", benefitScore: 7 },
  // Plano
  { name: "Artisan Drug Inc", address: "4690 McDermott Rd Ste 200", city: "Plano", state: "TX", zip: "75024", phone: "(214) 407-8950", specialty: "Compounding", priority: "High", benefitScore: 8 },
  { name: "Bluestone Pharmacy LLC", address: "555 Republic Dr Ste 108", city: "Plano", state: "TX", zip: "75074", phone: "(469) 591-1680", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "CaringRx Pharmacy", address: "5944 W Parker Rd Ste 120", city: "Plano", state: "TX", zip: "75093", phone: "(469) 680-3700", specialty: "General", priority: "Medium", benefitScore: 7 },
  { name: "Caretecture LLC", address: "6001 Windhaven Pkwy Suite 220", city: "Plano", state: "TX", zip: "75093", phone: "(972) 473-6867", specialty: "Specialty", priority: "High", benefitScore: 8 },
  { name: "Crystal Life Pharmacy Inc", address: "1441 Coit Rd Ste F", city: "Plano", state: "TX", zip: "75075", phone: "(469) 209-6074", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Spring Creek Pharmacy", address: "2009 W Spring Creek Pkwy", city: "Plano", state: "TX", zip: "75023", phone: "(972) 423-2323", website: "https://www.springcreekpharmacy.com", ownerName: "Cindy Zhang", pharmacistInCharge: "Cindy Zhang", specialty: "Compounding", priority: "High", benefitScore: 9 },
  // Frisco
  { name: "Frisco Apothecary LP", address: "3010 Legacy Dr Ste 110", city: "Frisco", state: "TX", zip: "75034", phone: "(469) 924-2001", specialty: "Compounding", priority: "High", benefitScore: 9 },
  { name: "Frisco Pharmacy LLC", address: "14550 SH-121", city: "Frisco", state: "TX", zip: "75035", phone: "(469) 305-7058", website: "https://friscopharmacy.net", specialty: "General", priority: "Medium", benefitScore: 7 },
  { name: "FriscoRx and Compounding LLC", address: "7227 Main St Ste 201", city: "Frisco", state: "TX", zip: "75034", phone: "(469) 888-4190", specialty: "Compounding", priority: "High", benefitScore: 9 },
  { name: "Drug Crafters LP", address: "5680 Frisco Square Blvd Ste 1100", city: "Frisco", state: "TX", zip: "75034", phone: "(214) 618-3511", specialty: "Compounding", priority: "High", benefitScore: 8 },
  { name: "Glendale Pharmacy Frisco LLC", address: "7447 Hillcrest Rd Ste 105A", city: "Frisco", state: "TX", zip: "75035", phone: "(972) 292-9571", specialty: "General", priority: "Medium", benefitScore: 7 },
  // McKinney
  { name: "McKinney Care Pharmacy and Compounding LLC", address: "4601 Medical Center Dr Ste B", city: "McKinney", state: "TX", zip: "75069", phone: "(972) 325-2273", specialty: "Compounding", priority: "High", benefitScore: 9 },
  { name: "North Side Pharmacy Inc", address: "1601 W University Dr", city: "McKinney", state: "TX", zip: "75069", phone: "(972) 542-4481", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Smith Drug Co", address: "114 N Tennessee", city: "McKinney", state: "TX", zip: "75069", phone: "(972) 542-4431", specialty: "General", priority: "Medium", benefitScore: 7 },
  { name: "North Central Pharmacy LLC", address: "5080 Virginia Pkwy Ste 550", city: "McKinney", state: "TX", zip: "75071", phone: "(972) 540-9900", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Pullium Creek Inc", address: "1601 W University Dr", city: "McKinney", state: "TX", zip: "75069", phone: "(972) 562-8700", specialty: "General", priority: "Low", benefitScore: 5 },
  { name: "Pars Pharmacy LLC", address: "7651 Eldorado Pkwy", city: "McKinney", state: "TX", zip: "75070", phone: "(469) 887-6821", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Pharmed LP", address: "1872 N Lake Forest Dr", city: "McKinney", state: "TX", zip: "75071", phone: "(972) 548-0900", specialty: "General", priority: "Medium", benefitScore: 7 },
  { name: "Saankhya Pharmacy LLC", address: "3851 S Stonebridge Dr Ste 1100", city: "McKinney", state: "TX", zip: "75070", phone: "(972) 787-0100", specialty: "General", priority: "Medium", benefitScore: 6 },
  // Allen
  { name: "Allen Family Drug", address: "400 N Allen Dr Ste 102", city: "Allen", state: "TX", zip: "75013", phone: "(972) 390-9888", specialty: "General", priority: "High", benefitScore: 8 },
  { name: "Allen RX LLC", address: "1105 Central Expy N Ste 2105", city: "Allen", state: "TX", zip: "75013", phone: "(469) 424-0811", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Collin Drugs", address: "600 W McDermott Dr Ste A", city: "Allen", state: "TX", zip: "75013", phone: "(214) 383-2444", specialty: "General", priority: "Medium", benefitScore: 7 },
  { name: "Green Leaf Pharmacy LLC", address: "201 W Boyd Dr Ste 105A", city: "Allen", state: "TX", zip: "75013", phone: "(682) 410-0002", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Lifetime Pharmacy LLC", address: "960 Ridgeview Dr Suite 120", city: "Allen", state: "TX", zip: "75013", phone: "(214) 491-5599", specialty: "Specialty", priority: "High", benefitScore: 8 },
  { name: "Moataz Pharmaceuticals", address: "1201 W McDermott Dr Ste 111", city: "Allen", state: "TX", zip: "75013", phone: "(469) 656-1111", specialty: "General", priority: "Medium", benefitScore: 6 },
  // Richardson
  { name: "Arapaho Pharmacy", address: "819 W Arapaho Rd Ste 57", city: "Richardson", state: "TX", zip: "75080", phone: "(972) 235-7133", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Creative Compounds LLC", address: "101 S Coit Rd", city: "Richardson", state: "TX", zip: "75080", phone: "(972) 385-8006", specialty: "Compounding", priority: "High", benefitScore: 9 },
  { name: "El Dorado Pharmacy LLC", address: "1300 E Arapaho Rd Ste 210", city: "Richardson", state: "TX", zip: "75081", phone: "(214) 329-4580", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "HeartCare Pharmacy Inc", address: "1112 N Floyd Rd Ste 9B", city: "Richardson", state: "TX", zip: "75080", phone: "(214) 501-4615", specialty: "Specialty", priority: "High", benefitScore: 8 },
  { name: "Pineland Pharmacy LLC", address: "502 Business Parkway", city: "Richardson", state: "TX", zip: "75081", phone: "(214) 579-9967", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Richardson East Pharmacy", address: "189 N Plano Rd Ste 120", city: "Richardson", state: "TX", zip: "75081", phone: "(214) 732-5572", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Razi RX Inc", address: "708 W Spring Valley Rd", city: "Richardson", state: "TX", zip: "75080", phone: "(972) 479-9292", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Village Pharmacy Solutions LLC", address: "888 S Greenville Ave Ste 301", city: "Richardson", state: "TX", zip: "75081", phone: "(469) 547-2426", specialty: "General", priority: "Medium", benefitScore: 7 },
  // Garland
  { name: "Broadway Pharmacy LLC", address: "3334 Broadway Blvd Ste 412", city: "Garland", state: "TX", zip: "75043", phone: "(972) 278-9742", specialty: "General", priority: "Low", benefitScore: 5 },
  { name: "Chebycare Pharmacy", address: "1421 W Buckingham Rd", city: "Garland", state: "TX", zip: "75042", phone: "(972) 675-1100", specialty: "Compounding", priority: "High", benefitScore: 8 },
  { name: "Independent Pharmacy Associates LLC", address: "3641 Broadway Blvd", city: "Garland", state: "TX", zip: "75043", phone: "(972) 864-1110", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "MedWorld Pharmacy Inc", address: "2351 Merritt Dr", city: "Garland", state: "TX", zip: "75041", phone: "(214) 272-0917", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Ridgewood Pharmacy LLC", address: "119 W Kingsley Rd Ste 122", city: "Garland", state: "TX", zip: "75041", phone: "(469) 814-0218", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Vitora Ventures Inc", address: "138 W Centerville Rd #100", city: "Garland", state: "TX", zip: "75041", phone: "(972) 271-0001", specialty: "General", priority: "Low", benefitScore: 5 },
  { name: "Remington Heritage Holdings Inc", address: "329 N Shiloh Rd Ste B", city: "Garland", state: "TX", zip: "75042", phone: "(972) 276-7071", specialty: "General", priority: "Medium", benefitScore: 6 },
  // Irving
  { name: "Alpha Pharmacy", address: "8787 N MacArthur Blvd", city: "Irving", state: "TX", zip: "75063", phone: "(469) 262-5742", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Burtis Drug Inc", address: "815 N O'Connor Rd", city: "Irving", state: "TX", zip: "75061", phone: "(972) 579-0511", specialty: "General", priority: "Medium", benefitScore: 7 },
  { name: "Dashwood Pharmacy", address: "1300 W Walnut Hill Lane", city: "Irving", state: "TX", zip: "75038", phone: "(972) 756-0915", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Family Pharmacy at Las Colinas LLC", address: "6555 N State Hwy 161", city: "Irving", state: "TX", zip: "75039", phone: "(972) 830-3600", specialty: "Specialty", priority: "High", benefitScore: 8 },
  { name: "GenRx Discount Pharmacy Inc", address: "1202 W Pioneer Dr", city: "Irving", state: "TX", zip: "75061", phone: "(972) 417-8895", specialty: "General", priority: "Low", benefitScore: 5 },
  { name: "Irving Pharmacy LLC", address: "2000 Esters Rd Ste 202", city: "Irving", state: "TX", zip: "75061", phone: "(972) 313-0585", specialty: "General", priority: "Medium", benefitScore: 6 },
  // Carrollton
  { name: "Carrollton Regional Pharmacy", address: "4323 N Josey Ln Ste 102", city: "Carrollton", state: "TX", zip: "75010", phone: "(469) 896-1777", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Hebron Pharmacy LLC", address: "4100 Fairway Dr Ste 500", city: "Carrollton", state: "TX", zip: "75010", phone: "(972) 394-7015", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Hillcrest Pharmacy LLC", address: "3065 N Josey Ln Ste 60", city: "Carrollton", state: "TX", zip: "75007", phone: "(972) 394-4456", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "People First Pharmacy", address: "4323 N Josey Ln", city: "Carrollton", state: "TX", zip: "75010", phone: "(972) 394-8603", website: "https://peoplefirstpharmacy.com", specialty: "General", priority: "High", benefitScore: 8 },
  { name: "People First Pharmacy 2", address: "2501 E Hebron Pkwy", city: "Carrollton", state: "TX", zip: "75010", phone: "(972) 300-4130", website: "https://peoplefirstpharmacy.com", specialty: "General", priority: "High", benefitScore: 7 },
  // Addison
  { name: "A-Script Pharmacy Inc", address: "17051 Dallas Pkwy #110", city: "Addison", state: "TX", zip: "75001", phone: "(214) 643-6287", specialty: "General", priority: "Medium", benefitScore: 7 },
  { name: "Pharmacy Care USA of Addison LLC", address: "4500 Ratliff Ln Ste 102", city: "Addison", state: "TX", zip: "75001", phone: "(972) 388-1800", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "The Medical Center Pharmacy Ltd Co", address: "16051 Addison Rd #305", city: "Addison", state: "TX", zip: "75001", phone: "(972) 290-1126", specialty: "Medical", priority: "High", benefitScore: 8 },
  // Flower Mound
  { name: "Flower Mound Herbal Pharmacy", address: "1001 Cross Timbers Rd", city: "Flower Mound", state: "TX", zip: "75028", phone: "(972) 355-4614", website: "https://flowermoundpharmacy.com", ownerName: "Dennis W. Song, RPh", pharmacistInCharge: "Dennis W. Song, RPh", specialty: "Compounding", priority: "High", benefitScore: 9 },
  { name: "Long Prairie Pharmacy LLC", address: "4921 Long Prairie Rd Ste 105", city: "Flower Mound", state: "TX", zip: "75028", phone: "(972) 410-3773", specialty: "General", priority: "Medium", benefitScore: 7 },
  { name: "Ready RX Inc", address: "4640 Long Prairie Rd #300", city: "Flower Mound", state: "TX", zip: "75028", phone: "(214) 838-0500", specialty: "General", priority: "Medium", benefitScore: 6 },
  // Lewisville
  { name: "Ajijo Inc", address: "560 W Main St", city: "Lewisville", state: "TX", zip: "75057", phone: "(972) 906-0800", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Pecan Pharmacy LLC", address: "1850 Lakepointe Dr Ste 300", city: "Lewisville", state: "TX", zip: "75057", phone: "(214) 227-9765", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "RxMed Pharmacy PLLC", address: "502 N Valley Pkwy Ste 1A", city: "Lewisville", state: "TX", zip: "75067", phone: "(469) 949-1003", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Health America LLC", address: "541 W Main St Ste 140", city: "Lewisville", state: "TX", zip: "75057", phone: "(972) 947-2288", specialty: "General", priority: "Low", benefitScore: 5 },
  // Denton
  { name: "Addis Pharmacy Inc", address: "3305 S Mayhill Rd", city: "Denton", state: "TX", zip: "76208", phone: "(940) 382-0079", specialty: "General", priority: "Low", benefitScore: 5 },
  { name: "Denton Apothecary LP", address: "306 N Loop 288 Ste 210", city: "Denton", state: "TX", zip: "76209", phone: "(940) 566-3101", specialty: "Compounding", priority: "High", benefitScore: 8 },
  { name: "Gibson Sales LP", address: "824 W University Dr", city: "Denton", state: "TX", zip: "76201", phone: "(940) 387-1290", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Premium Family Pharmacy", address: "1776 Teasley Ln Ste 111", city: "Denton", state: "TX", zip: "76205", phone: "(940) 442-6767", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Texas Community Pharmacy Services", address: "4400 Teasley Ln Ste 100", city: "Denton", state: "TX", zip: "76210", phone: "(940) 382-1618", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Yarbrough Pharmacy", address: "117 Piner", city: "Denton", state: "TX", zip: "76201", phone: "(940) 382-5033", specialty: "General", priority: "Medium", benefitScore: 7 },
  // Southlake / Colleyville / Grapevine / Keller
  { name: "Pharmacy Plus Inc", address: "731 E Southlake Blvd Ste 180", city: "Southlake", state: "TX", zip: "76092", phone: "(817) 410-1000", specialty: "Specialty", priority: "High", benefitScore: 9 },
  { name: "MedRock Texas Pharmacy LLC", address: "6424 Colleyville Blvd Ste 112", city: "Colleyville", state: "TX", zip: "76034", phone: "(817) 725-9929", specialty: "General", priority: "Medium", benefitScore: 7 },
  { name: "Palace Pharmacy LLC", address: "5200 Colleyville Blvd Ste C", city: "Colleyville", state: "TX", zip: "76034", phone: "(817) 599-7988", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Village Lane Apothecary", address: "60 Village Ln", city: "Colleyville", state: "TX", zip: "76034", phone: "(817) 717-2000", specialty: "Compounding", priority: "High", benefitScore: 9 },
  { name: "Westpark Discount Pharmacy Inc", address: "5017 Heritage Ave Ste CON1", city: "Colleyville", state: "TX", zip: "76034", phone: "(817) 571-9100", specialty: "General", priority: "Low", benefitScore: 5 },
  { name: "Grapevine Drug Mart Inc", address: "1115 W Northwest Hwy Ste H", city: "Grapevine", state: "TX", zip: "76051", phone: "(817) 481-5780", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Grapevine Pharmacy Inc", address: "2637 Ira E Woods Ave Ste 200", city: "Grapevine", state: "TX", zip: "76051", phone: "(817) 416-2222", specialty: "General", priority: "Medium", benefitScore: 7 },
  { name: "Bear Creek Pharmacy LLC", address: "101 Bear Creek Pkwy Ste B", city: "Keller", state: "TX", zip: "76248", phone: "(817) 562-4766", specialty: "General", priority: "Medium", benefitScore: 7 },
  { name: "Medi-Health Pharmacy Group LLC", address: "1200 Keller Pkwy Ste 200", city: "Keller", state: "TX", zip: "76248", phone: "(682) 593-0461", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Seven Seas Pharma Inc", address: "891 East Keller Pkwy Ste 101-B", city: "Keller", state: "TX", zip: "76248", phone: "(817) 380-8287", specialty: "General", priority: "Low", benefitScore: 5 },
  // Arlington
  { name: "AAA Pharmacy", address: "705 W Abram St", city: "Arlington", state: "TX", zip: "76010", phone: "(817) 394-2318", specialty: "General", priority: "Low", benefitScore: 5 },
  { name: "Alsabrook Inc", address: "975 N Cooper St", city: "Arlington", state: "TX", zip: "76011", phone: "(817) 274-8221", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Creative Compounding RX LLC", address: "7203 S Cooper St Ste 141", city: "Arlington", state: "TX", zip: "76001", phone: "(817) 704-2828", specialty: "Compounding", priority: "High", benefitScore: 8 },
  { name: "Express Care Pharmacy LLC", address: "905 Medical Centre Dr", city: "Arlington", state: "TX", zip: "76012", phone: "(817) 861-2273", specialty: "Medical", priority: "High", benefitScore: 8 },
  { name: "Haltom Pharmacy LLC", address: "3602 Matlock Rd Ste 204", city: "Arlington", state: "TX", zip: "76015", phone: "(817) 838-2500", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Highpoint Pharmacy LP", address: "800 W Arbrook", city: "Arlington", state: "TX", zip: "76015", phone: "(817) 466-3607", specialty: "General", priority: "Medium", benefitScore: 6 },
  // Fort Worth
  { name: "Ability Pharmacy Inc", address: "558 Hemphill St", city: "Fort Worth", state: "TX", zip: "76104", phone: "(817) 882-1111", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Be Well Pharmacy LLC", address: "8008 Camp Bowie West Blvd Ste 109", city: "Fort Worth", state: "TX", zip: "76116", phone: "(682) 841-0171", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Best Value Custom Meds", address: "6020 B Harris Parkway", city: "Fort Worth", state: "TX", zip: "76132", phone: "(817) 292-2338", specialty: "Compounding", priority: "High", benefitScore: 8 },
  { name: "Better Health Pharmacy LLC", address: "8615 S Hulen St Ste 115", city: "Fort Worth", state: "TX", zip: "76123", phone: "(682) 708-3499", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Daniel Drug Inc", address: "3409 W 7th St", city: "Fort Worth", state: "TX", zip: "76107", phone: "(817) 332-6386", specialty: "General", priority: "High", benefitScore: 8 },
  { name: "Care RX Pharmacy LLC", address: "7520 N Beach St Ste 100", city: "Fort Worth", state: "TX", zip: "76137", phone: "(817) 849-9811", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Clearfork Pharmacy LLC", address: "2901 Acme Brick Plz Ste 204", city: "Fort Worth", state: "TX", zip: "76109", phone: "(205) 789-4507", specialty: "General", priority: "High", benefitScore: 8 },
  { name: "Eklingji Healthcare LLC", address: "6249 Granbury Rd", city: "Fort Worth", state: "TX", zip: "76133", phone: "(817) 887-9990", specialty: "General", priority: "Medium", benefitScore: 6 },
  // Mesquite
  { name: "Apple Drugs #102", address: "1900 Oates Dr", city: "Mesquite", state: "TX", zip: "75150", phone: "(972) 270-0041", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Crossroads Pharmacy", address: "3220 Gus Thomasson Rd Ste 237", city: "Mesquite", state: "TX", zip: "75150", phone: "(214) 308-1963", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Dallas Pharmaceutical Corp", address: "910 N Galloway Ave", city: "Mesquite", state: "TX", zip: "75149", phone: "(972) 216-7000", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Galloway Pharmacy Inc", address: "2698 N Galloway Ave Ste 109", city: "Mesquite", state: "TX", zip: "75150", phone: "(972) 270-5600", specialty: "General", priority: "Medium", benefitScore: 6 },
  // Rowlett / Rockwall / Murphy / Wylie / The Colony
  { name: "Express Care Pharmacy", address: "1700 Dalrock Rd", city: "Rowlett", state: "TX", zip: "75088", phone: "(972) 475-6610", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Salud Pharmacy #1 LLC", address: "7310 Cedarbrook Rd", city: "Rowlett", state: "TX", zip: "75089", phone: "(214) 476-6323", specialty: "General", priority: "Medium", benefitScore: 5 },
  { name: "BZ Pharmacy Inc", address: "106 S Goliad St", city: "Rockwall", state: "TX", zip: "75087", phone: "(972) 722-3784", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Lakepointe Pharmacy Inc", address: "1005 W Ralph Hall Pkwy", city: "Rockwall", state: "TX", zip: "75032", phone: "(972) 722-4339", website: "http://www.lakepointerx.com", specialty: "General", priority: "High", benefitScore: 8 },
  { name: "Rockwall Pharmacy LLC", address: "2504 Ridge Rd", city: "Rockwall", state: "TX", zip: "75087", phone: "(469) 769-1160", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Super Rockwall Drugstore LP", address: "3021 Ridge Rd", city: "Rockwall", state: "TX", zip: "75032", phone: "(972) 772-0500", specialty: "General", priority: "Medium", benefitScore: 7 },
  { name: "Leeds Pharmacy LLC", address: "318 W FM 544 Ste B3", city: "Murphy", state: "TX", zip: "75094", phone: "(469) 209-0766", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Lenexa Pharmacy LLC", address: "412 Village Dr Ste 100A", city: "Murphy", state: "TX", zip: "75094", phone: "(972) 423-0135", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Murphy RX LLC", address: "345 W FM 544 Ste 200", city: "Murphy", state: "TX", zip: "75094", phone: "(972) 215-7164", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Pharmacy Enterprises of Texas", address: "601 W FM 544 Ste 102", city: "Murphy", state: "TX", zip: "75094", phone: "(469) 596-0341", specialty: "General", priority: "Medium", benefitScore: 5 },
  { name: "Helios Pharmacy LLC", address: "430 S Highway 78 Ste 160", city: "Wylie", state: "TX", zip: "75098", phone: "(972) 346-6350", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Wylie Pharmacy LLC", address: "430 S Highway 78 Ste 160", city: "Wylie", state: "TX", zip: "75098", phone: "(972) 429-9594", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Health One Pharmacy LLC", address: "3800 Main St Ste 102", city: "The Colony", state: "TX", zip: "75056", phone: "(214) 469-2244", specialty: "General", priority: "Medium", benefitScore: 6 },
  { name: "Favos Incorporated", address: "6053 Main St", city: "The Colony", state: "TX", zip: "75056", phone: "(214) 494-6222", specialty: "General", priority: "Medium", benefitScore: 5 },
];

const TAGS = [
  { name: "Family Owned", color: "#f59e0b" },
  { name: "Compounding", color: "#8b5cf6" },
  { name: "High Volume", color: "#10b981" },
  { name: "Friendly", color: "#06b6d4" },
  { name: "Uses PioneerRx", color: "#3b82f6" },
  { name: "Uses PrimeRx", color: "#6366f1" },
  { name: "Needs Follow-up", color: "#f97316" },
  { name: "Hot Lead", color: "#ef4444" },
  { name: "Cold Lead", color: "#6b7280" },
  { name: "Independent", color: "#84cc16" },
];

async function main() {
  console.log("Clearing existing data...");
  await (prisma as any).activityLog.deleteMany();
  await (prisma as any).note.deleteMany();
  await (prisma as any).task.deleteMany();
  await (prisma as any).pharmacyTag.deleteMany();
  await (prisma as any).pharmacy.deleteMany();
  await (prisma as any).tag.deleteMany();

  console.log("Creating tags...");
  const createdTags = await Promise.all(
    TAGS.map((tag) => (prisma as any).tag.create({ data: tag }))
  );

  console.log("Creating pharmacies...");
  for (const p of PHARMACIES) {
    const { specialty, priority, benefitScore, ownerName, pharmacistInCharge, ...rest } = p as any;
    await (prisma as any).pharmacy.create({
      data: {
        ...rest,
        specialty: specialty || null,
        priority: priority || "Medium",
        benefitScore: benefitScore || null,
        ownerName: ownerName || null,
        pharmacistInCharge: pharmacistInCharge || null,
        status: "Not Contacted",
        contacted: false,
        estimatedSize: null,
      },
    });
  }

  console.log(`✅ Seeded ${PHARMACIES.length} real DFW pharmacies and ${TAGS.length} tags`);
}

main().catch(console.error).finally(() => (prisma as any).$disconnect());
