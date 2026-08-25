import type { CatalogPage, HearingAid, StoredCatalog } from "@/data/products";

/** Fallback usable table-body height when row metrics are not measured yet. */
export const PRINT_BODY_MM = 228;

/** Extra clearance so print/PDF never paints rows over the footer. */
export const PACKING_SAFETY_MM = 10;

const BASE_ROW_MM = 6.2;
const DESC_LINE_MM = 3.35;
const DESC_CHARS_PER_LINE = 52;

export type PackingMetrics = {
  bodyPx: number;
  rowHeightsPx: Record<string, number>;
  fallbackRowPx: number;
};

export type PackedPage = {
  brand: string;
  page: CatalogPage;
  items: HearingAid[];
  pageNumber: number;
  pageCount: number;
  brandIndex: number;
  brandCount: number;
  brandOffset: number;
};

export function catalogLayoutChanged(a: StoredCatalog, b: StoredCatalog) {
  if (a.pages.length !== b.pages.length) return true;
  if (
    a.pages.some(
      (page, index) =>
        page.id !== b.pages[index]?.id || page.brand !== b.pages[index]?.brand,
    )
  ) {
    return true;
  }
  if (a.products.length !== b.products.length) return true;
  return a.products.some(
    (product, index) =>
      product.id !== b.products[index]?.id ||
      product.pageId !== b.products[index]?.pageId,
  );
}

export function estimateRowMm(product: HearingAid) {
  const description = product.description.trim();
  const descLines = description
    ? Math.max(1, Math.ceil(description.length / DESC_CHARS_PER_LINE))
    : 0;
  return BASE_ROW_MM + descLines * DESC_LINE_MM;
}

function productsByPageId(products: HearingAid[]) {
  const grouped = new Map<string, HearingAid[]>();
  for (const product of products) {
    const list = grouped.get(product.pageId) ?? [];
    list.push(product);
    grouped.set(product.pageId, list);
  }
  return grouped;
}

/** Keep one stored page per brand so brand order is a single list. */
export function mergeBrandPages(catalog: StoredCatalog): StoredCatalog {
  const grouped = productsByPageId(catalog.products);
  const brandOrder: string[] = [];
  const firstPageByBrand = new Map<string, CatalogPage>();
  const brandProducts = new Map<string, HearingAid[]>();

  for (const page of catalog.pages) {
    if (!firstPageByBrand.has(page.brand)) {
      brandOrder.push(page.brand);
      firstPageByBrand.set(page.brand, page);
      brandProducts.set(page.brand, []);
    }
    brandProducts.get(page.brand)!.push(...(grouped.get(page.id) ?? []));
    grouped.delete(page.id);
  }

  for (const items of grouped.values()) {
    if (items.length === 0) continue;
    const brand = items[0]?.brand ?? "Unknown";
    if (!firstPageByBrand.has(brand)) {
      brandOrder.push(brand);
      firstPageByBrand.set(brand, {
        id: items[0].pageId,
        brand,
      });
      brandProducts.set(brand, []);
    }
    brandProducts.get(brand)!.push(...items);
  }

  const pages: CatalogPage[] = [];
  const products: HearingAid[] = [];

  for (const brand of brandOrder) {
    const page = firstPageByBrand.get(brand);
    if (!page) continue;
    pages.push(page);
    products.push(
      ...(brandProducts.get(brand) ?? []).map((item) => ({
        ...item,
        pageId: page.id,
        brand,
      })),
    );
  }

  if (products.length !== catalog.products.length) {
    return catalog;
  }

  return { pages, products };
}

function packProducts(
  items: HearingAid[],
  measure: (item: HearingAid) => number,
  limit: number,
) {
  if (items.length === 0) return [[] as HearingAid[]];

  const packed: HearingAid[][] = [];
  let current: HearingAid[] = [];
  let used = 0;

  for (const item of items) {
    const height = Math.max(1, measure(item));
    const wouldOverflow = current.length > 0 && used + height > limit;
    if (wouldOverflow) {
      packed.push(current);
      current = [item];
      used = height;
      continue;
    }
    current.push(item);
    used += height;
  }

  if (current.length > 0) packed.push(current);
  return packed;
}

export function layoutPrintSections(
  pages: CatalogPage[],
  products: HearingAid[],
  metrics?: PackingMetrics | null,
): PackedPage[] {
  const grouped = productsByPageId(products);
  const brandOrder = Array.from(new Set(pages.map((page) => page.brand)));
  const sections: PackedPage[] = [];
  const useMeasured = Boolean(metrics && metrics.bodyPx > 40);
  const measure = useMeasured
    ? (item: HearingAid) =>
        metrics!.rowHeightsPx[item.id] ?? metrics!.fallbackRowPx
    : estimateRowMm;
  const limit = useMeasured ? metrics!.bodyPx : PRINT_BODY_MM;

  brandOrder.forEach((brand, brandIndex) => {
    const brandPages = pages.filter((page) => page.brand === brand);
    const brandItems = brandPages.flatMap((page) => grouped.get(page.id) ?? []);
    const chunks = packProducts(brandItems, measure, limit);
    const pageCount = chunks.length;
    let brandOffset = 0;

    chunks.forEach((items, index) => {
      sections.push({
        brand,
        page: brandPages[0] ?? { id: `page-${brand}`, brand },
        items,
        pageNumber: index + 1,
        pageCount,
        brandIndex,
        brandCount: brandOrder.length,
        brandOffset,
      });
      brandOffset += items.length;
    });
  });

  return sections;
}

export function reorderBrandList(
  pages: CatalogPage[],
  from: number,
  to: number,
): CatalogPage[] {
  const brands = Array.from(new Set(pages.map((page) => page.brand)));
  if (from === to || from < 0 || to < 0 || to >= brands.length) return pages;
  const nextBrands = [...brands];
  const [brand] = nextBrands.splice(from, 1);
  nextBrands.splice(to, 0, brand);
  const byBrand = new Map<string, CatalogPage[]>();
  for (const page of pages) {
    const list = byBrand.get(page.brand) ?? [];
    list.push(page);
    byBrand.set(page.brand, list);
  }
  return nextBrands.flatMap((name) => byBrand.get(name) ?? []);
}

export function reorderBrandProducts(
  items: HearingAid[],
  brand: string,
  from: number,
  to: number,
): HearingAid[] {
  const brandItems = items.filter((item) => item.brand === brand);
  if (from === to || from < 0 || to < 0 || to >= brandItems.length) {
    return items;
  }
  const next = [...brandItems];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  let index = 0;
  return items.map((product) =>
    product.brand === brand ? next[index++] : product,
  );
}
