"use client";

import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { useReactToPrint } from "react-to-print";
import {
  BatteryCharging,
  Bluetooth,
  FilePlus,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Printer,
  Trash2,
} from "lucide-react";
import {
  BRAND_LOGOS,
  DEVICE_TYPE_LABELS,
  DEVICE_TYPE_ORDER,
  defaultPages,
  labelForPage,
  products as defaultProducts,
  type CatalogPage,
  type DeviceType,
  type HearingAid,
} from "@/data/products";
import CatalogEditor from "@/components/CatalogEditor";
import { ClosingPage, CoverPage } from "@/components/CatalogPages";
import PageEditor from "@/components/PageEditor";

const STORAGE_KEY = "hearing-hope-catalog-v3";
const LEGACY_STORAGE_KEY = "hearing-hope-catalog-v2";

function normalizeCatalog(items: HearingAid[]): HearingAid[] {
  return items.map((item) => {
    const legacyType = (item as HearingAid & { deviceType?: DeviceType })
      .deviceType;
    const deviceTypes =
      item.deviceTypes?.length > 0
        ? item.deviceTypes
        : legacyType
          ? [legacyType]
          : [];
    return {
      ...item,
      deviceTypes,
      pageId:
        item.pageId ||
        `page-${item.brand.toLowerCase().replace(/\s+/g, "-")}`,
    };
  });
}

function groupProductsByPage(
  pages: CatalogPage[],
  items: HearingAid[],
): { page: CatalogPage; items: HearingAid[] }[] {
  return pages.map((page) => ({
    page,
    items: items.filter((item) => item.pageId === page.id),
  }));
}

function pagesFromProducts(items: HearingAid[]): CatalogPage[] {
  const pages: CatalogPage[] = [];
  const seen = new Map<string, string>();
  for (const item of items) {
    if (seen.has(item.brand)) continue;
    const id =
      item.pageId ||
      `page-${item.brand.toLowerCase().replace(/\s+/g, "-")}`;
    seen.set(item.brand, id);
    pages.push({ id, brand: item.brand });
  }
  return pages;
}

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function FeatureMark({
  active,
  label,
  Icon,
  tone,
}: {
  active: boolean;
  label: string;
  Icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  tone: "teal" | "orange";
}) {
  const activeClass =
    tone === "teal"
      ? "bg-[#18AD8D]/12 text-[#18AD8D]"
      : "bg-[#FF6503]/12 text-[#FF6503]";

  return (
    <span
      aria-label={`${label}: ${active ? "Yes" : "No"}`}
      className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full ${
        active ? activeClass : "bg-neutral-100 text-neutral-300"
      }`}
    >
      <Icon className="h-4 w-4" strokeWidth={2} />
    </span>
  );
}

function ClinicHeader() {
  return (
    <header className="flex items-center justify-between gap-6">
      <img
        src="/brand/logo.png"
        alt="Hearing Hope — Centre for Speech & Hearing"
        className="h-[72px] w-auto object-contain"
      />
      <div className="text-right">
        <p className="text-[10px] font-semibold tracking-[0.28em] text-[#18AD8D] uppercase">
          Official Price List
        </p>
        <p className="mt-1 text-sm font-medium text-[#0A1F1B]">August 2026</p>
        <p className="mt-0.5 text-[11px] text-neutral-400">
          For clinic consultation
        </p>
      </div>
    </header>
  );
}

function BrandWave() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 282 13"
      className="mt-5 h-2.5 w-full"
      aria-hidden="true"
    >
      <path
        d="M0.255859 6.05294C47.0475 2.54355 93.8392 2.54355 140.631 6.05294C187.423 9.56232 234.214 9.56232 281.006 6.05294"
        stroke="#18AD8D"
        strokeOpacity="0.45"
        strokeWidth="6.8"
        fill="none"
      />
    </svg>
  );
}

function PageFooter({ brand }: { brand: string }) {
  return (
    <footer className="mt-auto pt-8">
      <div className="mb-4 h-px w-full bg-gradient-to-r from-[#18AD8D] via-[#18AD8D]/20 to-[#FF6503]" />
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[11px] font-semibold tracking-wide text-[#0A1F1B]">
            Hearing Hope · Centre for Speech & Hearing
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-neutral-500">
            <Phone className="h-3 w-3 text-[#18AD8D]" strokeWidth={2} />
            +91 97118 71168 · +91 97118 71169
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[11px] text-neutral-500">
            <MapPin className="h-3 w-3 text-[#FF6503]" strokeWidth={2} />
            Rohini · Green Park · Indirapuram · Sanjay Nagar
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-medium text-[#18AD8D]">
            hearinghope.in
          </p>
          <p className="mt-1 text-[10px] text-neutral-400">
            {brand} · Prices are MRP. Offers may apply.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function PriceList() {
  const contentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: "Hearing Hope - Official Price List",
    pageStyle: `
      @page { size: A4; margin: 0; }
      html, body { margin: 0; padding: 0; background: #fff; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    `,
  });

  const [pages, setPages] = useState<CatalogPage[]>(defaultPages);
  const [catalog, setCatalog] = useState<HearingAid[]>(defaultProducts);
  const [hydrated, setHydrated] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<HearingAid | null>(null);
  const [defaultPage, setDefaultPage] = useState<CatalogPage | null>(null);
  const [pageEditorOpen, setPageEditorOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CatalogPage | null>(null);

  useEffect(() => {
    const storedV3 = window.localStorage.getItem(STORAGE_KEY);
    if (storedV3) {
      try {
        const parsed = JSON.parse(storedV3) as {
          pages?: CatalogPage[];
          products?: HearingAid[];
        };
        if (Array.isArray(parsed.pages) && Array.isArray(parsed.products)) {
          setPages(parsed.pages);
          setCatalog(normalizeCatalog(parsed.products));
          setHydrated(true);
          return;
        }
      } catch {
        // Fall through to legacy data.
      }
    }

    const storedV2 = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (storedV2) {
      try {
        const parsed = JSON.parse(storedV2) as HearingAid[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const products = normalizeCatalog(parsed);
          const nextPages = pagesFromProducts(products);
          const pageIdByBrand = new Map(
            nextPages.map((page) => [page.brand, page.id]),
          );
          setPages(nextPages);
          setCatalog(
            products.map((item) => ({
              ...item,
              pageId: item.pageId || pageIdByBrand.get(item.brand) || nextPages[0]?.id,
            })),
          );
        }
      } catch {
        // Keep the default catalog if stored data is invalid.
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ pages, products: catalog }),
    );
  }, [pages, catalog, hydrated]);

  const pageSections = useMemo(
    () => groupProductsByPage(pages, catalog),
    [pages, catalog],
  );
  const existingBrands = useMemo(
    () => Array.from(new Set(pages.map((page) => page.brand))),
    [pages],
  );

  function openAdd(page?: CatalogPage) {
    if (pages.length === 0) {
      openAddPage();
      return;
    }
    setEditingProduct(null);
    setDefaultPage(page ?? pages[0] ?? null);
    setEditorOpen(true);
  }

  function openEdit(product: HearingAid) {
    setEditingProduct(product);
    setDefaultPage(pages.find((page) => page.id === product.pageId) ?? null);
    setEditorOpen(true);
  }

  function openAddPage() {
    setEditingPage(null);
    setPageEditorOpen(true);
  }

  function openEditPage(page: CatalogPage) {
    setEditingPage(page);
    setPageEditorOpen(true);
  }

  function savePage(page: CatalogPage) {
    setPages((current) => {
      const exists = current.some((item) => item.id === page.id);
      if (exists) {
        return current.map((item) => (item.id === page.id ? page : item));
      }
      return [...current, page];
    });
    setCatalog((current) =>
      current.map((item) =>
        item.pageId === page.id ? { ...item, brand: page.brand } : item,
      ),
    );
  }

  function deletePage(id: string) {
    setPages((current) => current.filter((page) => page.id !== id));
    setCatalog((current) => current.filter((item) => item.pageId !== id));
  }

  function saveProduct(product: HearingAid) {
    setCatalog((current) => {
      const exists = current.some((item) => item.id === product.id);
      if (exists) {
        return current.map((item) =>
          item.id === product.id ? product : item,
        );
      }
      return [...current, product];
    });
  }

  function deleteProduct(id: string) {
    setCatalog((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div className="min-h-screen bg-[#e8eeec] py-10 print:bg-white print:py-0">
      <div className="print:hidden fixed top-6 right-6 z-50 flex items-center gap-2">
        <button
          type="button"
          onClick={openAddPage}
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#0A1F1B] shadow-lg ring-1 ring-black/5 transition-colors hover:bg-neutral-50"
        >
          <FilePlus className="h-4 w-4 text-[#18AD8D]" strokeWidth={2} />
          Add page
        </button>
        <button
          type="button"
          onClick={() => openAdd()}
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#0A1F1B] shadow-lg ring-1 ring-black/5 transition-colors hover:bg-neutral-50"
        >
          <Plus className="h-4 w-4 text-[#FF6503]" strokeWidth={2} />
          Add model
        </button>
        <button
          type="button"
          onClick={() => handlePrint()}
          className="inline-flex items-center gap-2 rounded-full bg-[#0A1F1B] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-[#14352e]"
        >
          <Printer className="h-4 w-4 text-[#FF6503]" strokeWidth={2} />
          Print / Export PDF
        </button>
      </div>

      <PageEditor
        open={pageEditorOpen}
        page={editingPage}
        existingBrands={existingBrands}
        onClose={() => setPageEditorOpen(false)}
        onSave={savePage}
      />

      <CatalogEditor
        open={editorOpen}
        product={editingProduct}
        defaultPage={defaultPage}
        pages={pages}
        onClose={() => setEditorOpen(false)}
        onSave={saveProduct}
      />

      {pages.length === 0 ? (
        <div className="print:hidden mx-auto max-w-[210mm] rounded-2xl bg-white p-10 text-center shadow-lg">
          <p className="text-lg font-semibold text-[#0A1F1B]">No brand pages yet</p>
          <p className="mt-2 text-sm text-neutral-500">
            Add a page, choose the brand, then add model names to that page.
          </p>
          <button
            type="button"
            onClick={openAddPage}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#0A1F1B] px-5 py-2.5 text-sm font-semibold text-white"
          >
            <FilePlus className="h-4 w-4" />
            Add first page
          </button>
        </div>
      ) : null}

      <div ref={contentRef} className="print-root space-y-8 print:space-y-0">
        <CoverPage brandNames={existingBrands} modelCount={catalog.length} />
        {pageSections.map(({ page, items }) => {
          const typesOnPage = DEVICE_TYPE_ORDER.filter((type) =>
            items.some((item) => item.deviceTypes.includes(type)),
          );
          const brand = page.brand;
          const pageLabel = labelForPage(page, pages);

          return (
            <section
              key={page.id}
              className={`print-page mx-auto flex min-h-[297mm] w-full max-w-[210mm] flex-col overflow-hidden bg-white shadow-[0_18px_50px_rgba(10,31,27,0.12)] print:max-w-none print:shadow-none print:break-before-page ${
                items.length === 0 ? "print:hidden" : ""
              }`}
            >
              <div className="flex h-1.5 w-full">
                <div className="h-full flex-[3] bg-[#18AD8D]" />
                <div className="h-full flex-1 bg-[#FF6503]" />
              </div>

              <div className="flex flex-1 flex-col px-10 pt-8 pb-8">
                <ClinicHeader />
                <BrandWave />

                <div className="mt-8 mb-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.22em] text-[#FF6503] uppercase">
                      Manufacturer
                    </p>
                    {BRAND_LOGOS[brand] ? (
                      <>
                        <img
                          src={BRAND_LOGOS[brand]}
                          alt={brand}
                          className="mt-3 h-12 max-w-[220px] w-auto object-contain object-left"
                        />
                        <h2 className="sr-only">{brand}</h2>
                      </>
                    ) : (
                      <h2 className="mt-3 text-[28px] leading-none font-semibold tracking-tight text-[#0A1F1B]">
                        {brand}
                      </h2>
                    )}
                    {pageLabel !== brand ? (
                      <p className="mt-2 text-xs font-medium text-neutral-400">
                        {pageLabel}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditPage(page)}
                      className="print:hidden inline-flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1 text-[11px] font-medium text-[#0A1F1B] hover:bg-neutral-50"
                    >
                      <Pencil className="h-3 w-3" />
                      Brand
                    </button>
                    <button
                      type="button"
                      onClick={() => openAdd(page)}
                      className="print:hidden inline-flex items-center gap-1 rounded-full border border-[#18AD8D]/30 px-3 py-1 text-[11px] font-medium text-[#0A1F1B] hover:bg-[#18AD8D]/8"
                    >
                      <Plus className="h-3 w-3" />
                      Add model
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePage(page.id)}
                      className="print:hidden inline-flex items-center rounded-full border border-neutral-200 p-1.5 text-neutral-400 hover:text-[#FF6503]"
                      aria-label={`Delete ${pageLabel} page`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    <div className="rounded-full border border-[#18AD8D]/25 bg-[#18AD8D]/8 px-3 py-1 text-[11px] font-medium text-[#0A1F1B]">
                      {items.length} {items.length === 1 ? "model" : "models"}
                    </div>
                  </div>
                </div>

                {items.length === 0 ? (
                  <div className="print:hidden flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 px-6 py-16 text-center">
                    <p className="text-sm font-medium text-[#0A1F1B]">
                      No models on this {brand} page yet
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      Add a model name and it will appear on this page.
                    </p>
                    <button
                      type="button"
                      onClick={() => openAdd(page)}
                      className="mt-4 inline-flex items-center gap-1 rounded-full bg-[#0A1F1B] px-4 py-2 text-[12px] font-semibold text-white"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add model
                    </button>
                  </div>
                ) : (
                <div className="overflow-hidden rounded-xl border border-neutral-200">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-[#0A1F1B] text-left text-[10px] font-semibold tracking-[0.14em] text-white uppercase">
                        <th className="w-10 py-3 pr-2 pl-4 font-semibold">#</th>
                        <th className="py-3 pr-3 font-semibold">Product</th>
                        <th className="py-3 pr-3 text-center font-semibold">
                          Type
                        </th>
                        <th className="py-3 pr-3 text-center font-semibold">
                          Unit
                        </th>
                        <th className="w-[72px] py-3 pr-2 text-center font-semibold">
                          <span className="flex flex-col items-center gap-1 normal-case tracking-normal">
                            <BatteryCharging
                              className="h-3.5 w-3.5 text-[#18AD8D]"
                              strokeWidth={2}
                            />
                            <span className="text-[8px] tracking-[0.12em] text-white/70 uppercase">
                              Power
                            </span>
                          </span>
                        </th>
                        <th className="w-[72px] py-3 pr-2 text-center font-semibold">
                          <span className="flex flex-col items-center gap-1 normal-case tracking-normal">
                            <Bluetooth
                              className="h-3.5 w-3.5 text-[#FF6503]"
                              strokeWidth={2}
                            />
                            <span className="text-[8px] tracking-[0.12em] text-white/70 uppercase">
                              Connect
                            </span>
                          </span>
                        </th>
                        <th className="py-3 pr-4 text-right font-semibold">
                          MRP
                        </th>
                        <th className="print:hidden w-16 py-3 pr-3 text-right font-semibold">
                          <span className="sr-only">Edit</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((product, rowIndex) => (
                        <tr
                          key={product.id}
                          className={`break-inside-avoid ${
                            rowIndex % 2 === 0 ? "bg-white" : "bg-[#F4FBF9]"
                          }`}
                        >
                          <td className="py-3.5 pr-2 pl-4 text-[12px] font-medium text-neutral-400">
                            {String(rowIndex + 1).padStart(2, "0")}
                          </td>
                          <td className="py-3.5 pr-3 font-semibold text-[#0A1F1B]">
                            {product.name}
                          </td>
                          <td className="py-3.5 pr-3">
                            <div className="flex flex-wrap justify-center gap-1">
                              {product.deviceTypes.map((type) => (
                                <span
                                  key={type}
                                  title={DEVICE_TYPE_LABELS[type]}
                                  className="inline-flex min-w-[3.25rem] justify-center rounded-md border border-[#18AD8D]/25 bg-[#18AD8D]/10 px-2 py-0.5 text-[10px] font-semibold tracking-[0.12em] text-[#0A1F1B]"
                                >
                                  {type}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 pr-3 text-center">
                            <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-medium text-neutral-600">
                              {product.unit}
                            </span>
                          </td>
                          <td className="py-3.5 pr-2 text-center">
                            <FeatureMark
                              active={product.isRechargeable}
                              label="Rechargeable"
                              Icon={BatteryCharging}
                              tone="teal"
                            />
                          </td>
                          <td className="py-3.5 pr-2 text-center">
                            <FeatureMark
                              active={product.hasBluetooth}
                              label="Bluetooth"
                              Icon={Bluetooth}
                              tone="orange"
                            />
                          </td>
                          <td className="py-3.5 pr-4 text-right text-[15px] font-semibold tabular-nums text-[#FF6503]">
                            {formatInr(product.mrp)}
                          </td>
                          <td className="print:hidden py-3.5 pr-3">
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => openEdit(product)}
                                className="rounded-full p-1.5 text-neutral-400 hover:bg-white hover:text-[#18AD8D]"
                                aria-label={`Edit ${product.name}`}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteProduct(product.id)}
                                className="rounded-full p-1.5 text-neutral-400 hover:bg-white hover:text-[#FF6503]"
                                aria-label={`Delete ${product.name}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )}

                <div className="mt-3 space-y-1 text-[10px] leading-relaxed text-neutral-400">
                  <p>
                    {typesOnPage
                      .map((type) => `${type} ${DEVICE_TYPE_LABELS[type]}`)
                      .join("  ·  ")}
                  </p>
                  <p>
                    Teal badge = rechargeable · Orange badge = Bluetooth
                    connectivity
                  </p>
                </div>

                <PageFooter brand={brand} />
              </div>
            </section>
          );
        })}
        <ClosingPage />
      </div>
    </div>
  );
}
