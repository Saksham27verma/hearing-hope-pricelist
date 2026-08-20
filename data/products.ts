export type DeviceType = "BTE" | "RIC" | "CIC" | "IIC" | "ITE" | "ITC";
export type Unit = "Pair" | "Single";
export type WarrantyYears = 2 | 4;

export const WARRANTY_OPTIONS: WarrantyYears[] = [2, 4];

export type CatalogPage = {
  id: string;
  brand: string;
};

export type HearingAid = {
  id: string;
  brand: string;
  pageId: string;
  name: string;
  mrp: number;
  unit: Unit;
  warrantyYears: WarrantyYears;
  isRechargeable: boolean;
  hasBluetooth: boolean;
  deviceTypes: DeviceType[];
};

export const DEVICE_TYPE_ORDER: DeviceType[] = [
  "BTE",
  "RIC",
  "CIC",
  "IIC",
  "ITE",
  "ITC",
];

export const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  BTE: "Behind the Ear",
  RIC: "Receiver in Canal",
  CIC: "Completely in Canal",
  IIC: "Invisible in Canal",
  ITE: "In the Ear",
  ITC: "In the Canal",
};

export const BRAND_LOGOS: Record<string, string> = {
  Phonak: "/brands/phonak.svg",
  Signia: "/brands/signia-word.svg",
  ReSound: "/brands/resound.svg",
  Oticon: "/brands/oticon.svg",
  Widex: "/brands/widex.svg",
};

export const KNOWN_BRANDS = Object.keys(BRAND_LOGOS);

export const defaultPages: CatalogPage[] = [
  { id: "page-phonak", brand: "Phonak" },
  { id: "page-signia", brand: "Signia" },
  { id: "page-resound", brand: "ReSound" },
  { id: "page-oticon", brand: "Oticon" },
  { id: "page-widex", brand: "Widex" },
];

function defaultPageId(brand: string) {
  return (
    defaultPages.find((page) => page.brand === brand)?.id ??
    `page-${brand.toLowerCase().replace(/\s+/g, "-")}`
  );
}

const rawProducts: Omit<HearingAid, "pageId" | "warrantyYears">[] = [
  {
    id: "ph-01",
    brand: "Phonak",
    name: "Audéo Lumity L90-R",
    mrp: 325000,
    unit: "Pair",
    isRechargeable: true,
    hasBluetooth: true,
    deviceTypes: ["BTE", "RIC"],
  },
  {
    id: "ph-02",
    brand: "Phonak",
    name: "Audéo Lumity L70-R",
    mrp: 245000,
    unit: "Pair",
    isRechargeable: true,
    hasBluetooth: true,
    deviceTypes: ["BTE", "RIC"],
  },
  {
    id: "ph-03",
    brand: "Phonak",
    name: "Audéo Lumity L50-R",
    mrp: 185000,
    unit: "Pair",
    isRechargeable: true,
    hasBluetooth: true,
    deviceTypes: ["RIC"],
  },
  {
    id: "ph-04",
    brand: "Phonak",
    name: "Naída Paradise P90-UP",
    mrp: 295000,
    unit: "Pair",
    isRechargeable: false,
    hasBluetooth: true,
    deviceTypes: ["BTE"],
  },
  {
    id: "ph-05",
    brand: "Phonak",
    name: "Virto Paradise P90 Titanium",
    mrp: 165000,
    unit: "Single",
    isRechargeable: false,
    hasBluetooth: true,
    deviceTypes: ["IIC"],
  },
  {
    id: "sg-01",
    brand: "Signia",
    name: "Pure Charge&Go 7AX",
    mrp: 275000,
    unit: "Pair",
    isRechargeable: true,
    hasBluetooth: true,
    deviceTypes: ["BTE", "RIC"],
  },
  {
    id: "sg-02",
    brand: "Signia",
    name: "Styletto 7AX",
    mrp: 255000,
    unit: "Pair",
    isRechargeable: true,
    hasBluetooth: true,
    deviceTypes: ["RIC"],
  },
  {
    id: "sg-03",
    brand: "Signia",
    name: "Insio Charge&Go AX",
    mrp: 235000,
    unit: "Pair",
    isRechargeable: true,
    hasBluetooth: true,
    deviceTypes: ["ITE", "ITC"],
  },
  {
    id: "sg-04",
    brand: "Signia",
    name: "Silk Charge&Go IX",
    mrp: 195000,
    unit: "Pair",
    isRechargeable: true,
    hasBluetooth: true,
    deviceTypes: ["CIC"],
  },
  {
    id: "sg-05",
    brand: "Signia",
    name: "Insio AX ITC",
    mrp: 175000,
    unit: "Pair",
    isRechargeable: false,
    hasBluetooth: true,
    deviceTypes: ["ITC"],
  },
  {
    id: "rs-01",
    brand: "ReSound",
    name: "Nexia 9 RIE",
    mrp: 285000,
    unit: "Pair",
    isRechargeable: true,
    hasBluetooth: true,
    deviceTypes: ["BTE", "RIC"],
  },
  {
    id: "rs-02",
    brand: "ReSound",
    name: "Omnia 9 RIE",
    mrp: 245000,
    unit: "Pair",
    isRechargeable: true,
    hasBluetooth: true,
    deviceTypes: ["RIC"],
  },
  {
    id: "rs-03",
    brand: "ReSound",
    name: "ONE 9 RIE",
    mrp: 215000,
    unit: "Pair",
    isRechargeable: true,
    hasBluetooth: true,
    deviceTypes: ["RIC"],
  },
  {
    id: "rs-04",
    brand: "ReSound",
    name: "Key 4 BTE",
    mrp: 85000,
    unit: "Pair",
    isRechargeable: false,
    hasBluetooth: false,
    deviceTypes: ["BTE"],
  },
  {
    id: "ot-01",
    brand: "Oticon",
    name: "Intent 1 miniRITE R",
    mrp: 310000,
    unit: "Pair",
    isRechargeable: true,
    hasBluetooth: true,
    deviceTypes: ["BTE", "RIC"],
  },
  {
    id: "ot-02",
    brand: "Oticon",
    name: "Real 1 miniRITE R",
    mrp: 265000,
    unit: "Pair",
    isRechargeable: true,
    hasBluetooth: true,
    deviceTypes: ["RIC"],
  },
  {
    id: "ot-03",
    brand: "Oticon",
    name: "More 1 miniRITE R",
    mrp: 225000,
    unit: "Pair",
    isRechargeable: true,
    hasBluetooth: true,
    deviceTypes: ["RIC"],
  },
  {
    id: "ot-04",
    brand: "Oticon",
    name: "Own 1 CIC",
    mrp: 95000,
    unit: "Single",
    isRechargeable: false,
    hasBluetooth: false,
    deviceTypes: ["CIC"],
  },
  {
    id: "ot-05",
    brand: "Oticon",
    name: "Own 1 IIC",
    mrp: 110000,
    unit: "Single",
    isRechargeable: false,
    hasBluetooth: false,
    deviceTypes: ["IIC"],
  },
  {
    id: "wd-01",
    brand: "Widex",
    name: "SmartRIC 440",
    mrp: 290000,
    unit: "Pair",
    isRechargeable: true,
    hasBluetooth: true,
    deviceTypes: ["BTE", "RIC"],
  },
  {
    id: "wd-02",
    brand: "Widex",
    name: "Moment Sheer 440",
    mrp: 250000,
    unit: "Pair",
    isRechargeable: true,
    hasBluetooth: true,
    deviceTypes: ["RIC"],
  },
  {
    id: "wd-03",
    brand: "Widex",
    name: "Moment 330 RIC",
    mrp: 175000,
    unit: "Pair",
    isRechargeable: true,
    hasBluetooth: true,
    deviceTypes: ["RIC"],
  },
  {
    id: "wd-04",
    brand: "Widex",
    name: "Unique 440 ITE",
    mrp: 145000,
    unit: "Pair",
    isRechargeable: false,
    hasBluetooth: false,
    deviceTypes: ["ITE"],
  },
];

export const products: HearingAid[] = rawProducts.map((item) => ({
  ...item,
  pageId: defaultPageId(item.brand),
  warrantyYears: item.mrp >= 250000 ? 4 : 2,
}));

export function labelForPage(page: CatalogPage, pages: CatalogPage[]) {
  const siblings = pages.filter((item) => item.brand === page.brand);
  if (siblings.length <= 1) return page.brand;
  const index = siblings.findIndex((item) => item.id === page.id) + 1;
  return `${page.brand} · page ${index}`;
}
