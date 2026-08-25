import { promises as fs } from "fs";
import path from "path";
import {
  defaultPages,
  products as defaultProducts,
  type CatalogPage,
  type HearingAid,
  type StoredCatalog,
} from "@/data/products";
import { ensureCatalogSchema, getDatabaseUrl, sql } from "@/lib/db";
import {
  catalogLayoutChanged,
  mergeBrandPages,
} from "@/lib/paginate-catalog";

const catalogFilePath = path.join(process.cwd(), "data", "catalog.json");
const CATALOG_ID = "main";

let cachedCatalog: StoredCatalog | null = null;

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

async function readCatalogFile(): Promise<StoredCatalog | null> {
  try {
    const raw = await fs.readFile(catalogFilePath, "utf8");
    return validateCatalog(JSON.parse(raw));
  } catch {
    return null;
  }
}

async function writeCatalogFile(catalog: StoredCatalog) {
  try {
    await fs.mkdir(path.dirname(catalogFilePath), { recursive: true });
    await fs.writeFile(
      catalogFilePath,
      `${JSON.stringify(catalog, null, 2)}\n`,
      "utf8",
    );
  } catch {
    // Read-only hosts such as Vercel still persist through the database.
  }
}

async function readCatalogFromDb(): Promise<StoredCatalog | null> {
  if (!getDatabaseUrl()) return null;
  await ensureCatalogSchema();
  const rows = await sql()`
    SELECT pages, products
    FROM catalogs
    WHERE id = ${CATALOG_ID}
    LIMIT 1
  `;
  const row = rows[0] as
    | { pages: unknown; products: unknown }
    | undefined;
  if (!row) return null;
  return validateCatalog({
    pages: row.pages,
    products: row.products,
  });
}

async function writeCatalogToDb(catalog: StoredCatalog) {
  if (!getDatabaseUrl()) return;
  await ensureCatalogSchema();
  const pages = JSON.stringify(catalog.pages);
  const products = JSON.stringify(catalog.products);
  await sql()`
    INSERT INTO catalogs (id, pages, products, updated_at)
    VALUES (${CATALOG_ID}, ${pages}::jsonb, ${products}::jsonb, NOW())
    ON CONFLICT (id) DO UPDATE SET
      pages = EXCLUDED.pages,
      products = EXCLUDED.products,
      updated_at = NOW()
  `;
}

function withPagedCatalog(catalog: StoredCatalog): StoredCatalog {
  const merged = mergeBrandPages(catalog);
  return merged.products.length === catalog.products.length ? merged : catalog;
}

async function persistCatalog(catalog: StoredCatalog) {
  await writeCatalogToDb(catalog);
  await writeCatalogFile(catalog);
  cachedCatalog = catalog;
}

export async function readCatalog(): Promise<StoredCatalog> {
  const fromDb = await readCatalogFromDb();
  if (fromDb && fromDb.products.length > 0) {
    const payload = withPagedCatalog(fromDb);
    if (
      payload.products.length === fromDb.products.length &&
      catalogLayoutChanged(fromDb, payload)
    ) {
      await persistCatalog(payload);
    } else {
      cachedCatalog = payload;
    }
    return payload;
  }

  if (cachedCatalog && cachedCatalog.products.length > 0) {
    return withPagedCatalog(cachedCatalog);
  }

  const fromFile = await readCatalogFile();
  if (fromFile && fromFile.products.length > 0) {
    cachedCatalog = withPagedCatalog(fromFile);
    return cachedCatalog;
  }

  cachedCatalog = emptyCatalog();
  return cachedCatalog;
}

export async function writeCatalog(catalog: StoredCatalog): Promise<StoredCatalog> {
  const existing =
    (await readCatalogFromDb()) ?? cachedCatalog ?? emptyCatalog();
  if (existing.products.length - catalog.products.length >= 10) {
    return withPagedCatalog(existing);
  }
  const payload = withPagedCatalog(catalog);
  if (existing.products.length - payload.products.length >= 10) {
    return withPagedCatalog(existing);
  }
  await persistCatalog(payload);
  return payload;
}
