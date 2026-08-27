import type { HearingAid } from "@/data/products";

export type Range = { from: number; to: number };

/**
 * A row naming CROS is a standalone transmitter unless it also names a kit or
 * an aid count, which is how the bundles ("... Kit ...", "1 Aid + 1 CROS")
 * are written in the catalog.
 */
const CROS = /cros/i;
const BUNDLED_WITH_AID = /\bkit\b|\d\s*aid/i;

/** Chargers, receivers and CROS transmitters are sold alongside an aid, not as one. */
export function isHearingAid(product: HearingAid) {
  if (
    product.deviceTypes.includes("CHG") ||
    product.deviceTypes.includes("REC")
  ) {
    return false;
  }
  return !CROS.test(product.name) || BUNDLED_WITH_AID.test(product.name);
}

function rangeOf(values: number[]): Range | null {
  if (values.length === 0) return null;
  return { from: Math.min(...values), to: Math.max(...values) };
}

function priceRange(items: HearingAid[]) {
  return rangeOf(items.map((item) => item.mrp));
}

function channelRange(items: HearingAid[]) {
  const counts = items
    .map((item) => Number(item.channels.trim()))
    .filter((count) => Number.isFinite(count) && count > 0);
  return rangeOf(counts);
}

function byBrand(products: HearingAid[]) {
  const grouped = new Map<string, HearingAid[]>();
  for (const product of products) {
    const list = grouped.get(product.brand) ?? [];
    list.push(product);
    grouped.set(product.brand, list);
  }
  return grouped;
}

export type BrandAidSummary = {
  brand: string;
  models: number;
  singleFrom: number | null;
  premiumUpTo: number | null;
  channels: Range | null;
};

export function summariseAidsByBrand(
  brands: string[],
  products: HearingAid[],
): BrandAidSummary[] {
  const grouped = byBrand(products.filter(isHearingAid));

  return brands.map((brand) => {
    const aids = grouped.get(brand) ?? [];
    const singles = aids.filter((aid) => aid.unit === "Single");
    return {
      brand,
      models: aids.length,
      singleFrom: (priceRange(singles) ?? priceRange(aids))?.from ?? null,
      premiumUpTo: priceRange(aids)?.to ?? null,
      channels: channelRange(aids),
    };
  });
}
