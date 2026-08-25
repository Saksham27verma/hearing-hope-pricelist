import {
  DEVICE_TYPE_ORDER,
  normalizeWarrantyYears,
  type CatalogPage,
  type DeviceType,
  type HearingAid,
  type Unit,
} from "@/data/products";

export const CSV_COLUMNS = [
  "name",
  "mrp",
  "unit",
  "warrantyYears",
  "channels",
  "description",
  "deviceTypes",
  "isRechargeable",
  "hasBluetooth",
] as const;

export const CSV_TEMPLATE = `${CSV_COLUMNS.join(",")}
Audeo Lumity L90-R,325000,Pair,4,48,Premium rechargeable RIC,BTE;RIC,Yes,Yes
Virto Paradise P90 Titanium,165000,Single,2,,Custom in-canal,IIC,No,Yes
`;

type CanonicalField = (typeof CSV_COLUMNS)[number];

const HEADER_ALIASES: Record<string, CanonicalField> = {
  name: "name",
  model: "name",
  modelname: "name",
  product: "name",
  productname: "name",
  mrp: "mrp",
  price: "mrp",
  unit: "unit",
  warrantyyears: "warrantyYears",
  warranty: "warrantyYears",
  channels: "channels",
  channel: "channels",
  band: "channels",
  channelsband: "channels",
  description: "description",
  desc: "description",
  notes: "description",
  devicetypes: "deviceTypes",
  devicetype: "deviceTypes",
  type: "deviceTypes",
  types: "deviceTypes",
  isrechargeable: "isRechargeable",
  rechargeable: "isRechargeable",
  hasbluetooth: "hasBluetooth",
  bluetooth: "hasBluetooth",
};

const DEVICE_TYPE_ALIASES: Record<string, DeviceType> = {
  bte: "BTE",
  behindtheear: "BTE",
  ric: "RIC",
  receiverincanal: "RIC",
  rie: "RIC",
  minirite: "RIC",
  cic: "CIC",
  completelyincanal: "CIC",
  iic: "IIC",
  invisibleincanal: "IIC",
  ite: "ITE",
  intheear: "ITE",
  itc: "ITC",
  inthecanal: "ITC",
  chg: "CHG",
  charger: "CHG",
  rec: "REC",
  receiver: "REC",
};

export type CsvRowError = {
  row: number;
  message: string;
};

export type CsvImportResult = {
  products: HearingAid[];
  errors: CsvRowError[];
  skipped: number;
};

function normalizeHeader(value: string) {
  return value.replace(/^\uFEFF/, "").trim().toLowerCase().replace(/[\s_-]+/g, "");
}

function detectDelimiter(headerLine: string) {
  let commas = 0;
  let semicolons = 0;
  let inQuotes = false;
  for (const ch of headerLine) {
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (inQuotes) continue;
    if (ch === ",") commas += 1;
    if (ch === ";") semicolons += 1;
  }
  return semicolons > commas ? ";" : ",";
}

function parseCsv(text: string): string[][] {
  const src = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const firstLine = src.split("\n")[0] ?? "";
  const delimiter = detectDelimiter(firstLine);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === delimiter) {
      row.push(field.trim());
      field = "";
      continue;
    }
    if (ch === "\n") {
      row.push(field.trim());
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
      field = "";
      continue;
    }
    field += ch;
  }

  row.push(field.trim());
  if (row.some((cell) => cell !== "")) rows.push(row);
  return rows;
}

function parseMrp(value: string) {
  const cleaned = value.replace(/[₹$£€,\s]/g, "");
  const amount = Number(cleaned);
  return Number.isFinite(amount) && amount >= 0 ? amount : NaN;
}

function parseUnit(value: string): Unit {
  return value.trim().toLowerCase().includes("single") ? "Single" : "Pair";
}

function parseWarranty(value: string) {
  const match = value.match(/[1-4]/);
  return normalizeWarrantyYears(match ? Number(match[0]) : 2);
}

function parseBoolean(value: string, fallback: boolean) {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return fallback;
  if (["1", "y", "yes", "true", "t"].includes(normalized)) return true;
  if (["0", "n", "no", "false", "f"].includes(normalized)) return false;
  return fallback;
}

function parseDeviceTypes(value: string): DeviceType[] {
  const tokens = value
    .split(/[|;,/]+/)
    .map((token) => token.trim())
    .filter(Boolean);
  const selected = new Set<DeviceType>();
  for (const token of tokens) {
    const alias = DEVICE_TYPE_ALIASES[normalizeHeader(token)];
    if (alias) selected.add(alias);
  }
  return DEVICE_TYPE_ORDER.filter((type) => selected.has(type));
}

function mapHeaders(headerRow: string[]) {
  const mapped = new Map<CanonicalField, number>();
  for (let index = 0; index < headerRow.length; index += 1) {
    const field = HEADER_ALIASES[normalizeHeader(headerRow[index] ?? "")];
    if (field && !mapped.has(field)) mapped.set(field, index);
  }
  return mapped;
}

export function parseCatalogCsv(
  text: string,
  page: CatalogPage,
): CsvImportResult {
  const rows = parseCsv(text);
  if (rows.length === 0) {
    return {
      products: [],
      errors: [{ row: 1, message: "The CSV file is empty." }],
      skipped: 0,
    };
  }

  const headers = mapHeaders(rows[0]);
  const missing = (["name", "mrp", "deviceTypes"] as const).filter(
    (field) => !headers.has(field),
  );
  if (missing.length > 0) {
    return {
      products: [],
      errors: [
        {
          row: 1,
          message: `Missing required column${missing.length === 1 ? "" : "s"}: ${missing.join(", ")}.`,
        },
      ],
      skipped: 0,
    };
  }

  const products: HearingAid[] = [];
  const errors: CsvRowError[] = [];
  const stamp = Date.now();

  rows.slice(1).forEach((cells, index) => {
    const rowNumber = index + 2;
    const cell = (field: CanonicalField) => {
      const column = headers.get(field);
      return column == null ? "" : (cells[column] ?? "").trim();
    };

    const name = cell("name");
    const mrp = parseMrp(cell("mrp"));
    const deviceTypes = parseDeviceTypes(cell("deviceTypes"));

    if (!name && !cell("mrp") && !cell("deviceTypes")) {
      return;
    }
    if (!name) {
      errors.push({ row: rowNumber, message: "Model name is required." });
      return;
    }
    if (!Number.isFinite(mrp)) {
      errors.push({ row: rowNumber, message: `Invalid MRP for "${name}".` });
      return;
    }
    if (deviceTypes.length === 0) {
      errors.push({
        row: rowNumber,
        message: `Select at least one device type for "${name}" (BTE, RIC, CIC, IIC, ITE, ITC, CHG, REC).`,
      });
      return;
    }

    products.push({
      id: `csv-${page.id}-${stamp}-${index}`,
      pageId: page.id,
      brand: page.brand,
      name,
      mrp,
      unit: parseUnit(cell("unit")),
      warrantyYears: parseWarranty(cell("warrantyYears")),
      channels: cell("channels"),
      description: cell("description"),
      isRechargeable: parseBoolean(cell("isRechargeable"), true),
      hasBluetooth: parseBoolean(cell("hasBluetooth"), true),
      deviceTypes,
    });
  });

  return {
    products,
    errors,
    skipped: errors.length,
  };
}
