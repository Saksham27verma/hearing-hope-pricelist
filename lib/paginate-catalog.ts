import type { CatalogPage, HearingAid, StoredCatalog } from "@/data/products";

/** Compact A4 density: header, 32 rows, notes, and footer stay on one page. */
export const MODELS_PER_PAGE = 32;

function chunkItems<T>(items: T[], size: number): T[][] {
  if (items.length === 0) return [[]];
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function unusedPageId(baseId: string, usedIds: Set<string>) {
  let suffix = 2;
  let id = `${baseId}-p${suffix}`;
  while (usedIds.has(id)) {
    suffix += 1;
    id = `${baseId}-p${suffix}`;
  }
  usedIds.add(id);
  return id;
}

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

export function paginateCatalog(catalog: StoredCatalog): StoredCatalog {
  const productsByPage = new Map<string, HearingAid[]>();
  for (const product of catalog.products) {
    const list = productsByPage.get(product.pageId) ?? [];
    list.push(product);
    productsByPage.set(product.pageId, list);
  }

  const brandOrder: string[] = [];
  const pagesByBrand = new Map<string, CatalogPage[]>();
  for (const page of catalog.pages) {
    if (!pagesByBrand.has(page.brand)) {
      brandOrder.push(page.brand);
      pagesByBrand.set(page.brand, []);
    }
    pagesByBrand.get(page.brand)!.push(page);
  }

  const usedIds = new Set<string>(catalog.pages.map((page) => page.id));
  const pages: CatalogPage[] = [];
  const products: HearingAid[] = [];

  for (const brand of brandOrder) {
    const brandPages = pagesByBrand.get(brand) ?? [];
    const brandProducts: HearingAid[] = [];
    for (const page of brandPages) {
      brandProducts.push(...(productsByPage.get(page.id) ?? []));
      productsByPage.delete(page.id);
    }

    const chunks = chunkItems(brandProducts, MODELS_PER_PAGE);
    const baseId = brandPages[0]?.id ?? `page-${brand.toLowerCase()}`;
    chunks.forEach((chunk, index) => {
      const nextPage = brandPages[index] ?? {
        id: unusedPageId(baseId, usedIds),
        brand,
      };
      usedIds.add(nextPage.id);
      pages.push(nextPage);
      products.push(
        ...chunk.map((item) => ({
          ...item,
          pageId: nextPage.id,
          brand,
        })),
      );
    });
  }

  for (const [pageId, items] of productsByPage) {
    const brand = items[0]?.brand ?? "Unknown";
    const chunks = chunkItems(items, MODELS_PER_PAGE);
    chunks.forEach((chunk, index) => {
      const nextPage =
        index === 0
          ? { id: pageId, brand }
          : { id: unusedPageId(pageId, usedIds), brand };
      usedIds.add(nextPage.id);
      if (!pages.some((page) => page.id === nextPage.id)) {
        pages.push(nextPage);
      }
      products.push(
        ...chunk.map((item) => ({
          ...item,
          pageId: nextPage.id,
          brand,
        })),
      );
    });
  }

  if (products.length !== catalog.products.length) {
    return catalog;
  }

  return { pages, products };
}
