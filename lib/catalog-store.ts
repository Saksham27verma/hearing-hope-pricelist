import { promises as fs } from "fs";
import path from "path";
import {
  defaultPages,
  products as defaultProducts,
  type CatalogPage,
  type HearingAid,
  type StoredCatalog,
} from "@/data/products";

const catalogPath = path.join(process.cwd(), "data", "catalog.json");
const memoryKey = "__hearingHopeCatalog";

function memoryStore(): { current: StoredCatalog | null } {
  const globalRef = globalThis as typeof globalThis & {
    [memoryKey]?: { current: StoredCatalog | null };
  };
  globalRef[memoryKey] ??= { current: null };
  return globalRef[memoryKey];
}

function isCatalog(value: unknown): value is StoredCatalog {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<StoredCatalog>;
  return Array.isArray(record.pages) && Array.isArray(record.products);
}

export function emptyCatalog(): StoredCatalog {
  return {
    pages: defaultPages,
    products: defaultProducts,
  };
}

export async function readCatalog(): Promise<StoredCatalog> {
  const memory = memoryStore().current;
  let fromFile: StoredCatalog | null = null;
  try {
    const raw = await fs.readFile(catalogPath, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (isCatalog(parsed) && parsed.products.length > 0) {
      fromFile = parsed;
    }
  } catch {
    // Fall through if the file is missing.
  }

  const candidates = [memory, fromFile].filter(
    (item): item is StoredCatalog => !!item && item.products.length > 0,
  );
  if (candidates.length === 0) return emptyCatalog();

  const best = candidates.reduce((a, b) =>
    a.products.length >= b.products.length ? a : b,
  );
  memoryStore().current = best;
  return best;
}

export async function writeCatalog(catalog: StoredCatalog): Promise<StoredCatalog> {
  const existing = await readCatalog();
  if (existing.products.length - catalog.products.length >= 10) {
    return existing;
  }
  const payload: StoredCatalog = {
    pages: catalog.pages,
    products: catalog.products,
  };
  memoryStore().current = payload;
  try {
    await fs.mkdir(path.dirname(catalogPath), { recursive: true });
    await fs.writeFile(
      catalogPath,
      `${JSON.stringify(payload, null, 2)}\n`,
      "utf8",
    );
  } catch {
    // Vercel’s filesystem is read-only; memory still holds the catalog
    // for this server instance.
  }
  return payload;
}

export function validateCatalog(value: unknown): StoredCatalog | null {
  if (!isCatalog(value)) return null;
  const pages = value.pages.filter(
    (page): page is CatalogPage =>
      !!page &&
      typeof page.id === "string" &&
      typeof page.brand === "string" &&
      page.id.length > 0 &&
      page.brand.length > 0,
  );
  const products = value.products.filter(
    (item): item is HearingAid =>
      !!item &&
      typeof item.id === "string" &&
      typeof item.brand === "string" &&
      typeof item.pageId === "string" &&
      typeof item.name === "string" &&
      typeof item.mrp === "number",
  );
  if (pages.length === 0) return null;
  return { pages, products };
}
