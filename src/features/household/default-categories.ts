import type { CategoryKind } from "@prisma/client";

export type DefaultCategory = {
  nameEn: string;
  nameTh: string;
  kind: CategoryKind;
};

/**
 * Starter categories seeded into every new household at onboarding, so records
 * have something to be filed under from day one. Names are stored bilingually in
 * the DB (nameEn/nameTh) — they are data, not UI strings, so they do NOT go
 * through the dictionaries/*.json i18n system.
 *
 * Reuse this list for any future "reset categories to defaults" flow; do not
 * re-seed when a user *joins* an existing household.
 */
export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { kind: "fixed", nameEn: "Rent / Mortgage", nameTh: "ค่าเช่า / ผ่อนบ้าน" },
  { kind: "fixed", nameEn: "Utilities", nameTh: "ค่าน้ำค่าไฟ" },
  { kind: "fixed", nameEn: "Education & Tuition", nameTh: "การศึกษา / ค่าเทอม" },
  { kind: "fixed", nameEn: "Insurance", nameTh: "ประกันภัย / ประกันชีวิต" },
  { kind: "fixed", nameEn: "Subscriptions & Cloud", nameTh: "ค่าบริการรายเดือน / คลาวด์" },
  { kind: "variable", nameEn: "Groceries", nameTh: "ของใช้ในบ้าน" },
  { kind: "variable", nameEn: "Transport & Logistics", nameTh: "เดินทาง / ขนส่งเดลิเวอรี" },
  { kind: "variable", nameEn: "Healthcare", nameTh: "สุขภาพ" },
  { kind: "variable", nameEn: "Beauty & Personal Care", nameTh: "เครื่องสำอาง / สกินแคร์" },
  { kind: "variable", nameEn: "Government Fees & Taxes", nameTh: "ค่าธรรมเนียมรัฐ / ภาษี" },
  { kind: "variable", nameEn: "Home Maintenance & Decor", nameTh: "ซ่อมแซมบ้าน / เฟอร์นิเจอร์" },
  { kind: "leisure", nameEn: "Dining Out", nameTh: "กินข้าวนอกบ้าน" },
  { kind: "leisure", nameEn: "Entertainment", nameTh: "ความบันเทิง" },
  { kind: "leisure", nameEn: "Travel & Accommodation", nameTh: "ท่องเที่ยว / ที่พัก" },
  { kind: "leisure", nameEn: "Gaming & Digital Apps", nameTh: "เกม / ดิจิทัลคอนเทนต์" },
];
