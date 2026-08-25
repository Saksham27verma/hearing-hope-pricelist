"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import { useReactToPrint } from "react-to-print";
import {
  BatteryCharging,
  Bluetooth,
  ChevronDown,
  ChevronUp,
  FilePlus,
  GripVertical,
  Pencil,
  Phone,
  Plus,
  Printer,
  Trash2,
  Upload,
} from "lucide-react";
import {
  BRAND_LOGOS,
  DEVICE_TYPE_LABELS,
  DEVICE_TYPE_ORDER,
  defaultPages,
  normalizeWarrantyYears,
  products as defaultProducts,
  type CatalogPage,
  type DeviceType,
  type HearingAid,
  type StoredCatalog,
} from "@/data/products";
import CatalogEditor from "@/components/CatalogEditor";
import { ClosingPage, CoverPage } from "@/components/CatalogPages";
import CsvImport from "@/components/CsvImport";
import PageEditor from "@/components/PageEditor";
import {
  catalogLayoutChanged,
  layoutPrintSections,
  mergeBrandPages,
  PACKING_SAFETY_MM,
  reorderBrandList,
  reorderBrandProducts,
  type PackingMetrics,
} from "@/lib/paginate-catalog";

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
      warrantyYears: normalizeWarrantyYears(item.warrantyYears),
      channels:
        typeof item.channels === "string"
          ? item.channels.trim()
          : item.channels != null
            ? String(item.channels)
            : "",
      description:
        typeof item.description === "string" ? item.description.trim() : "",
      pageId:
        item.pageId ||
        `page-${item.brand.toLowerCase().replace(/\s+/g, "-")}`,
    };
  });
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

function parseStoredCatalog(raw: string | null): StoredCatalog | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredCatalog | HearingAid[];
    if (
      parsed &&
      !Array.isArray(parsed) &&
      Array.isArray(parsed.pages) &&
      Array.isArray(parsed.products)
    ) {
      return {
        pages: parsed.pages,
        products: normalizeCatalog(parsed.products),
      };
    }
    if (Array.isArray(parsed) && parsed.length > 0) {
      const products = normalizeCatalog(parsed);
      const nextPages = pagesFromProducts(products);
      const pageIdByBrand = new Map(
        nextPages.map((page) => [page.brand, page.id]),
      );
      return {
        pages: nextPages,
        products: products.map((item) => ({
          ...item,
          pageId: item.pageId || pageIdByBrand.get(item.brand) || nextPages[0]?.id,
        })),
      };
    }
  } catch {
    return null;
  }
  return null;
}

function readLocalCatalog(): StoredCatalog | null {
  return (
    parseStoredCatalog(window.localStorage.getItem(STORAGE_KEY)) ??
    parseStoredCatalog(window.localStorage.getItem(LEGACY_STORAGE_KEY))
  );
}

function cacheLocalCatalog(catalog: StoredCatalog) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(catalog));
}

async function fetchServerCatalog(): Promise<StoredCatalog | null> {
  try {
    const response = await fetch("/api/catalog", { cache: "no-store" });
    if (!response.ok) return null;
    return parseStoredCatalog(await response.text());
  } catch {
    return null;
  }
}

async function saveServerCatalog(catalog: StoredCatalog): Promise<boolean> {
  try {
    const response = await fetch("/api/catalog", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(catalog),
    });
    return response.ok;
  } catch {
    return false;
  }
}

function preferWorkingCatalog(
  local: StoredCatalog | null,
  server: StoredCatalog | null,
): StoredCatalog | null {
  if (!local) return server;
  if (!server) return local;
  const localCount = local.products.length;
  const serverCount = server.products.length;
  if (localCount >= 50 && localCount >= serverCount * 0.8) return local;
  if (serverCount !== localCount) {
    return serverCount > localCount ? server : local;
  }
  return local.pages.length >= server.pages.length ? local : server;
}

function ReorderControls({
  label,
  index,
  total,
  onMove,
}: {
  label: string;
  index: number;
  total: number;
  onMove: (from: number, to: number) => void;
}) {
  return (
    <div className="print:hidden flex flex-col">
      <button
        type="button"
        disabled={index === 0}
        onClick={() => onMove(index, index - 1)}
        className="rounded-sm p-0.5 text-neutral-400 hover:text-[#0A1F1B] disabled:opacity-25"
        aria-label={`Move ${label} up`}
      >
        <ChevronUp className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
      <button
        type="button"
        disabled={index === total - 1}
        onClick={() => onMove(index, index + 1)}
        className="rounded-sm p-0.5 text-neutral-400 hover:text-[#0A1F1B] disabled:opacity-25"
        aria-label={`Move ${label} down`}
      >
        <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>
  );
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
      className={`mx-auto flex h-5 w-5 items-center justify-center rounded-full ${
        active ? activeClass : "bg-neutral-100 text-neutral-300"
      }`}
    >
      <Icon className="h-3 w-3" strokeWidth={2} />
    </span>
  );
}

function ClinicHeader({ compact = false }: { compact?: boolean }) {
  return (
    <header className="flex items-center justify-between gap-4">
      <img
        src="/brand/logo.png"
        alt="Hearing Hope — Centre for Speech & Hearing"
        className={`${compact ? "h-7" : "h-[48px]"} w-auto object-contain`}
      />
      <div className="text-right">
        <p className="text-[9px] font-semibold tracking-[0.28em] text-[#18AD8D] uppercase">
          Recommended Price List
        </p>
        <p className="mt-0.5 text-xs font-medium text-[#0A1F1B]">August 2026</p>
      </div>
    </header>
  );
}

function BrandWave() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 282 13"
      className="mt-1 h-1.5 w-full"
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
    <footer className="mt-auto shrink-0 pt-1.5">
      <div className="mb-1.5 h-px w-full bg-gradient-to-r from-[#18AD8D] via-[#18AD8D]/20 to-[#FF6503]" />
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[9px] font-semibold tracking-wide text-[#0A1F1B]">
            Hearing Hope · Centre for Speech & Hearing
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[9px] text-neutral-500">
            <Phone className="h-3 w-3 text-[#18AD8D]" strokeWidth={2} />
            +91 97118 71168 · +91 97118 71169
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-medium text-[#18AD8D]">
            hearinghope.in
          </p>
          <p className="mt-0.5 text-[8px] text-neutral-400">
            {brand} · Prices are MRP.
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
    documentTitle: "Hearing Hope - Recommended Price List",
    pageStyle: `
      @page { size: A4; margin: 0; }
      html, body { margin: 0; padding: 0; background: #fff; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .print-page { height: 297mm !important; max-height: 297mm !important; overflow: hidden !important; }
      .print-page footer { flex-shrink: 0 !important; break-inside: avoid; page-break-inside: avoid; }
      .print-table-wrap { min-height: 0 !important; overflow: hidden !important; }
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
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [csvImportPage, setCsvImportPage] = useState<CatalogPage | null>(null);
  const [draggingBrand, setDraggingBrand] = useState<string | null>(null);
  const [draggingModel, setDraggingModel] = useState<{
    brand: string;
    index: number;
  } | null>(null);
  const [packMetrics, setPackMetrics] = useState<PackingMetrics | null>(null);
  const packingProbeRef = useRef<HTMLDivElement>(null);
  const skipNextSave = useRef(true);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const local = readLocalCatalog();
      const server = await fetchServerCatalog();
      const next = preferWorkingCatalog(local, server) ?? {
        pages: defaultPages,
        products: defaultProducts,
      };
      if (cancelled) return;

      const merged = mergeBrandPages(next);
      const payload =
        merged.products.length === next.products.length ? merged : next;

      setPages(payload.pages);
      setCatalog(payload.products);
      cacheLocalCatalog(payload);
      if (
        !server ||
        payload.products.length !== server.products.length ||
        catalogLayoutChanged(payload, server)
      ) {
        await saveServerCatalog(payload);
      }
      if (!cancelled) setHydrated(true);
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const payload: StoredCatalog = { pages, products: catalog };
    cacheLocalCatalog(payload);
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      void saveServerCatalog(payload);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [pages, catalog, hydrated]);

  const existingBrands = useMemo(
    () => Array.from(new Set(pages.map((page) => page.brand))),
    [pages],
  );
  const packingSignature = useMemo(
    () =>
      catalog
        .map(
          (item) =>
            `${item.id}\t${item.name}\t${item.description}\t${item.deviceTypes.join(",")}`,
        )
        .join("\n"),
    [catalog],
  );

  useLayoutEffect(() => {
    const probe = packingProbeRef.current;
    if (probe == null || catalog.length === 0) return;

    function measure(root: HTMLDivElement) {
      const page = root.querySelector("[data-packing-page]");
      const notes = root.querySelector("[data-packing-notes]");
      const rows = [
        ...root.querySelectorAll<HTMLTableRowElement>("[data-packing-row]"),
      ];
      if (!page || !notes || rows.length === 0) return;

      const pageWidth = page.getBoundingClientRect().width;
      if (pageWidth < 40) return;

      const rowHeightsPx: Record<string, number> = {};
      let heightSum = 0;
      let heightCount = 0;
      for (const row of rows) {
        const id = row.dataset.productId;
        if (!id) continue;
        const height = Math.ceil(row.getBoundingClientRect().height) + 3;
        rowHeightsPx[id] = height;
        heightSum += height;
        heightCount += 1;
      }

      const firstRow = rows[0]?.getBoundingClientRect();
      if (!firstRow) return;
      const notesTop = notes.getBoundingClientRect().top;
      const bodyPx = Math.max(
        80,
        notesTop - firstRow.top - PACKING_SAFETY_MM * (pageWidth / 210),
      );

      setPackMetrics({
        bodyPx,
        rowHeightsPx,
        fallbackRowPx: heightCount > 0 ? heightSum / heightCount : 22,
      });
    }

    measure(probe);
    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (!cancelled) measure(probe);
    });
    return () => {
      cancelled = true;
    };
  }, [catalog.length, packingSignature]);

  const pageSections = useMemo(
    () => layoutPrintSections(pages, catalog, packMetrics),
    [pages, catalog, packMetrics],
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

  function openCsvImport(page: CatalogPage) {
    setCsvImportPage(page);
    setCsvImportOpen(true);
  }

  function commitCatalog(next: StoredCatalog) {
    const merged = mergeBrandPages(next);
    const payload =
      merged.products.length === next.products.length ? merged : next;
    setPages(payload.pages);
    setCatalog(payload.products);
  }

  function savePage(page: CatalogPage) {
    const nextPages = pages.some((item) => item.id === page.id)
      ? pages.map((item) => (item.id === page.id ? page : item))
      : [...pages, page];
    commitCatalog({
      pages: nextPages,
      products: catalog.map((item) =>
        item.pageId === page.id ? { ...item, brand: page.brand } : item,
      ),
    });
  }

  function deletePage(id: string) {
    const page = pages.find((item) => item.id === id);
    commitCatalog({
      pages: pages.filter((item) => item.id !== id && item.brand !== page?.brand),
      products: catalog.filter(
        (item) => item.pageId !== id && item.brand !== page?.brand,
      ),
    });
  }

  function saveProduct(product: HearingAid) {
    const exists = catalog.some((item) => item.id === product.id);
    commitCatalog({
      pages,
      products: exists
        ? catalog.map((item) => (item.id === product.id ? product : item))
        : [...catalog, product],
    });
  }

  function importProducts(products: HearingAid[]) {
    if (products.length === 0) return;
    commitCatalog({
      pages,
      products: [...catalog, ...products],
    });
  }

  function updateChannels(id: string, channels: string) {
    commitCatalog({
      pages,
      products: catalog.map((item) =>
        item.id === id ? { ...item, channels } : item,
      ),
    });
  }

  function deleteProduct(id: string) {
    commitCatalog({
      pages,
      products: catalog.filter((item) => item.id !== id),
    });
  }

  function moveBrand(from: number, to: number) {
    commitCatalog({
      pages: reorderBrandList(pages, from, to),
      products: catalog,
    });
  }

  function moveModel(brand: string, from: number, to: number) {
    commitCatalog({
      pages,
      products: reorderBrandProducts(catalog, brand, from, to),
    });
  }

  return (
    <div className="min-h-screen bg-[#e8eeec] py-10 pt-20 print:bg-white print:py-0">
      <div className="print:hidden fixed top-6 right-6 z-50 flex items-center gap-2">
        <div className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#0A1F1B] shadow-lg ring-1 ring-black/5">
          {catalog.length} models
        </div>
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

      <CsvImport
        open={csvImportOpen}
        page={csvImportPage}
        onClose={() => setCsvImportOpen(false)}
        onImport={importProducts}
      />

      {existingBrands.length > 1 ? (
        <div className="print:hidden mx-auto mb-6 w-[210mm] max-w-full rounded-2xl bg-white p-4 shadow-lg ring-1 ring-black/5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] text-[#FF6503] uppercase">
                Brand page order
              </p>
              <p className="mt-0.5 text-[12px] text-neutral-500">
                Drag a brand, or use the arrows, to change the order of brand
                pages in the catalog and PDF.
              </p>
            </div>
            <p className="text-[11px] font-medium text-neutral-400">
              {existingBrands.length} brands
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {existingBrands.map((brand, brandIndex) => (
              <div
                key={brand}
                onDragOver={(event) => {
                  event.preventDefault();
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (!draggingBrand) return;
                  moveBrand(
                    existingBrands.indexOf(draggingBrand),
                    brandIndex,
                  );
                  setDraggingBrand(null);
                }}
                className={`flex items-center rounded-full border bg-white pr-1 ${
                  draggingBrand === brand
                    ? "border-[#18AD8D] ring-2 ring-[#18AD8D]/30"
                    : "border-neutral-200"
                }`}
              >
                <button
                  type="button"
                  draggable
                  onDragStart={() => setDraggingBrand(brand)}
                  onDragEnd={() => setDraggingBrand(null)}
                  className="cursor-grab px-1.5 py-1 text-neutral-400 hover:text-[#0A1F1B]"
                  aria-label={`Drag ${brand} brand`}
                >
                  <GripVertical className="h-3.5 w-3.5" />
                </button>
                <span className="pr-1 text-[12px] font-semibold text-[#0A1F1B]">
                  {brand}
                </span>
                <ReorderControls
                  label={`${brand} brand`}
                  index={brandIndex}
                  total={existingBrands.length}
                  onMove={moveBrand}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}

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

      <div
        ref={packingProbeRef}
        aria-hidden="true"
        className="print:hidden pointer-events-none absolute top-0 left-[-9999px] -z-10 w-[210mm] opacity-0"
      >
        <div
          data-packing-page
          className="flex h-[297mm] w-[210mm] flex-col bg-white"
        >
          <div className="h-1 w-full bg-[#18AD8D]" />
          <div
            data-packing-inner
            className="flex min-h-0 flex-1 flex-col px-5 pt-3 pb-3"
          >
            <div
              data-packing-top
              className="shrink-0"
            >
              <ClinicHeader compact />
              <BrandWave />
              <div className="mt-1.5 mb-1.5">
                <p className="text-[8px] font-semibold tracking-[0.22em] text-[#FF6503] uppercase">
                  Manufacturer
                </p>
                <p className="mt-1 text-[18px] leading-none font-semibold">
                  Brand
                </p>
                <p className="mt-0.5 text-[9px] font-medium text-neutral-400">
                  Brand · page 1 of 2
                </p>
              </div>
            </div>
            <div className="print-table-wrap min-h-0 flex-1 overflow-hidden rounded-lg border border-neutral-200">
              <table className="w-full table-fixed border-collapse text-[11px]">
                <thead data-packing-head>
                  <tr className="bg-[#0A1F1B] text-left text-[8px] font-semibold tracking-[0.12em] text-white uppercase">
                    <th className="w-7 py-1 pr-1.5 pl-1 font-semibold">#</th>
                    <th className="w-[78mm] py-1 pr-1.5 font-semibold">
                      Product
                    </th>
                    <th className="w-28 py-1 pr-1.5 text-center font-semibold">
                      Type
                    </th>
                    <th className="w-16 py-1 pr-1.5 text-center font-semibold">
                      Channels/Band
                    </th>
                    <th className="w-12 py-1 pr-1.5 text-center font-semibold">
                      Unit
                    </th>
                    <th className="w-16 py-1 pr-1.5 text-center font-semibold">
                      Warranty (yrs)
                    </th>
                    <th className="w-9 py-1 pr-1 text-center font-semibold">
                      R
                    </th>
                    <th className="w-9 py-1 pr-1 text-center font-semibold">
                      B
                    </th>
                    <th className="py-1 pr-1.5 text-right font-semibold">
                      MRP
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {catalog.map((product) => (
                    <tr
                      key={product.id}
                      data-packing-row
                      data-product-id={product.id}
                    >
                      <td className="py-0.5 pr-1.5 pl-1 align-top text-[10px] font-medium text-neutral-400">
                        01
                      </td>
                      <td className="py-0.5 pr-1.5 align-top">
                        <p className="font-semibold leading-tight break-words text-[#0A1F1B]">
                          {product.name}
                        </p>
                        {product.description.trim() ? (
                          <p className="mt-0.5 text-[9px] leading-snug font-normal break-words text-neutral-500">
                            {product.description.trim()}
                          </p>
                        ) : null}
                      </td>
                      <td className="py-0.5 pr-1.5 align-top">
                        <div className="flex flex-wrap justify-center gap-px">
                          {product.deviceTypes.map((type) => (
                            <span
                              key={type}
                              className="inline-flex min-w-[1.65rem] justify-center rounded border border-[#18AD8D]/25 bg-[#18AD8D]/10 px-1 py-px text-[7px] font-semibold tracking-[0.06em] text-[#0A1F1B]"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-0.5 pr-1.5 text-center">
                        <span className="tabular-nums font-semibold">
                          {product.channels.trim() || "—"}
                        </span>
                      </td>
                      <td className="py-0.5 pr-1.5 text-center">
                        <span className="inline-flex rounded-full bg-neutral-100 px-1.5 py-px text-[9px] font-medium text-neutral-600">
                          {product.unit}
                        </span>
                      </td>
                      <td className="py-0.5 pr-1.5 text-center tabular-nums font-semibold">
                        {product.warrantyYears}
                      </td>
                      <td className="py-0.5 pr-1 text-center">
                        <FeatureMark
                          active={product.isRechargeable}
                          label="Rechargeable"
                          Icon={BatteryCharging}
                          tone="teal"
                        />
                      </td>
                      <td className="py-0.5 pr-1 text-center">
                        <FeatureMark
                          active={product.hasBluetooth}
                          label="Bluetooth"
                          Icon={Bluetooth}
                          tone="orange"
                        />
                      </td>
                      <td className="py-0.5 pr-1.5 text-right text-[12px] font-semibold tabular-nums text-[#FF6503]">
                        {formatInr(product.mrp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div
              data-packing-notes
              className="mt-1 shrink-0 space-y-0 text-[8px] leading-tight text-neutral-400"
            >
              <p>
                BTE Behind the Ear · RIC Receiver in Canal · CIC Completely in
                Canal · IIC Invisible in Canal · ITE In the Ear · ITC In the
                Canal
              </p>
              <p>
                Teal badge = rechargeable · Orange badge = Bluetooth
                connectivity
              </p>
            </div>
            <div data-packing-footer className="shrink-0">
              <PageFooter brand="Brand" />
            </div>
          </div>
        </div>
      </div>

      <div ref={contentRef} className="print-root space-y-8 print:space-y-0">
        <CoverPage brandNames={existingBrands} modelCount={catalog.length} />
        {pageSections.map((section) => {
          const {
            page,
            items,
            brand,
            pageNumber,
            pageCount,
            brandIndex,
            brandCount,
            brandOffset,
          } = section;
          const typesOnPage = DEVICE_TYPE_ORDER.filter((type) =>
            items.some((item) => item.deviceTypes.includes(type)),
          );
          const pageLabel =
            pageCount > 1 ? `${brand} · page ${pageNumber} of ${pageCount}` : brand;
          const isFirstBrandPage = pageNumber === 1;
          const brandItemCount = catalog.filter(
            (item) => item.brand === brand,
          ).length;

          return (
            <section
              key={`${page.id}-${pageNumber}`}
              onDragOver={(event) => {
                if (!draggingBrand) return;
                event.preventDefault();
              }}
              onDrop={(event) => {
                event.preventDefault();
                if (!draggingBrand) return;
                moveBrand(existingBrands.indexOf(draggingBrand), brandIndex);
                setDraggingBrand(null);
              }}
              className={`print-page mx-auto flex h-auto min-h-[297mm] w-[210mm] max-w-[210mm] flex-col overflow-hidden bg-white shadow-[0_18px_50px_rgba(10,31,27,0.12)] print:h-[297mm] print:max-h-[297mm] print:max-w-none print:shadow-none print:break-before-page ${
                items.length === 0 ? "print:hidden" : ""
              } ${draggingBrand === brand ? "ring-2 ring-[#18AD8D]/40" : ""}`}
            >
              <div className="flex h-1 w-full">
                <div className="h-full flex-[3] bg-[#18AD8D]" />
                <div className="h-full flex-1 bg-[#FF6503]" />
              </div>

              <div className="flex min-h-0 flex-1 flex-col px-5 pt-3 pb-3">
                <div className="shrink-0">
                <ClinicHeader compact />
                <BrandWave />

                <div className="mt-1.5 mb-1.5 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[8px] font-semibold tracking-[0.22em] text-[#FF6503] uppercase">
                      Manufacturer
                    </p>
                    {BRAND_LOGOS[brand] ? (
                      <>
                        <img
                          src={BRAND_LOGOS[brand]}
                          alt={brand}
                          className="mt-1 h-6 max-w-[150px] w-auto object-contain object-left"
                        />
                        <h2 className="sr-only">{brand}</h2>
                      </>
                    ) : (
                      <h2 className="mt-1 text-[18px] leading-none font-semibold tracking-tight text-[#0A1F1B]">
                        {brand}
                      </h2>
                    )}
                    {pageLabel !== brand ? (
                      <p className="mt-0.5 text-[9px] font-medium text-neutral-400">
                        {pageLabel}
                      </p>
                    ) : null}
                  </div>
                  <div className="print:hidden flex flex-wrap items-center justify-end gap-1.5">
                    <div className="flex items-center rounded-full border border-neutral-200 bg-white pr-1">
                      <button
                        type="button"
                        draggable
                        onDragStart={() => setDraggingBrand(brand)}
                        onDragEnd={() => setDraggingBrand(null)}
                        className="cursor-grab px-1.5 py-1 text-neutral-400 hover:text-[#0A1F1B]"
                        aria-label={`Drag ${brand} brand`}
                      >
                        <GripVertical className="h-3.5 w-3.5" />
                      </button>
                      <ReorderControls
                        label={`${brand} brand`}
                        index={brandIndex}
                        total={brandCount}
                        onMove={moveBrand}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => openEditPage(page)}
                      className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1 text-[11px] font-medium text-[#0A1F1B] hover:bg-neutral-50"
                    >
                      <Pencil className="h-3 w-3" />
                      Brand
                    </button>
                    <button
                      type="button"
                      onClick={() => openAdd(page)}
                      className="inline-flex items-center gap-1 rounded-full border border-[#18AD8D]/30 px-3 py-1 text-[11px] font-medium text-[#0A1F1B] hover:bg-[#18AD8D]/8"
                    >
                      <Plus className="h-3 w-3" />
                      Add model
                    </button>
                    <button
                      type="button"
                      onClick={() => openCsvImport(page)}
                      className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1 text-[11px] font-medium text-[#0A1F1B] hover:bg-neutral-50"
                    >
                      <Upload className="h-3 w-3" />
                      Import CSV
                    </button>
                    {isFirstBrandPage ? (
                      <button
                        type="button"
                        onClick={() => deletePage(page.id)}
                        className="inline-flex items-center rounded-full border border-neutral-200 p-1.5 text-neutral-400 hover:text-[#FF6503]"
                        aria-label={`Delete ${brand}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    ) : null}
                    <div className="rounded-full border border-[#18AD8D]/25 bg-[#18AD8D]/8 px-3 py-1 text-[11px] font-medium text-[#0A1F1B]">
                      {brandItemCount} {brandItemCount === 1 ? "model" : "models"}
                    </div>
                  </div>
                </div>
                </div>

                {items.length === 0 ? (
                  <div className="print:hidden flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 px-6 py-16 text-center">
                    <p className="text-sm font-medium text-[#0A1F1B]">
                      No models on this {brand} page yet
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      Add a model name, or import several from a CSV file.
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openAdd(page)}
                        className="inline-flex items-center gap-1 rounded-full bg-[#0A1F1B] px-4 py-2 text-[12px] font-semibold text-white"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add model
                      </button>
                      <button
                        type="button"
                        onClick={() => openCsvImport(page)}
                        className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-4 py-2 text-[12px] font-medium text-[#0A1F1B] hover:bg-neutral-50"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Import CSV
                      </button>
                    </div>
                  </div>
                ) : (
                <div className="print-table-wrap min-h-0 flex-1 overflow-hidden rounded-lg border border-neutral-200">
                  <table className="w-full table-fixed border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-[#0A1F1B] text-left text-[8px] font-semibold tracking-[0.12em] text-white uppercase">
                        <th className="print:hidden w-7 py-1 pr-0 pl-1.5 font-semibold">
                          <span className="sr-only">Reorder</span>
                        </th>
                        <th className="w-7 py-1 pr-1.5 pl-1 font-semibold">#</th>
                        <th className="w-[78mm] py-1 pr-1.5 font-semibold">Product</th>
                        <th className="w-28 py-1 pr-1.5 text-center font-semibold">
                          Type
                        </th>
                        <th className="w-16 py-1 pr-1.5 text-center font-semibold">
                          Channels/Band
                        </th>
                        <th className="w-12 py-1 pr-1.5 text-center font-semibold">
                          Unit
                        </th>
                        <th className="w-16 py-1 pr-1.5 text-center font-semibold">
                          Warranty (yrs)
                        </th>
                        <th className="w-9 py-1 pr-1 text-center font-semibold">
                          <BatteryCharging
                            className="mx-auto h-3 w-3 text-[#18AD8D]"
                            strokeWidth={2}
                          />
                          <span className="sr-only">Rechargeable</span>
                        </th>
                        <th className="w-9 py-1 pr-1 text-center font-semibold">
                          <Bluetooth
                            className="mx-auto h-3 w-3 text-[#FF6503]"
                            strokeWidth={2}
                          />
                          <span className="sr-only">Bluetooth</span>
                        </th>
                        <th className="py-1 pr-1.5 text-right font-semibold">
                          MRP
                        </th>
                        <th className="print:hidden w-14 py-1 pr-1.5 text-right font-semibold">
                          <span className="sr-only">Edit</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((product, rowIndex) => (
                        <tr
                          key={product.id}
                          onDragOver={(event) => {
                            if (draggingModel?.brand !== brand) return;
                            event.preventDefault();
                          }}
                          onDrop={(event) => {
                            event.preventDefault();
                            if (draggingModel?.brand !== brand) return;
                            moveModel(
                              brand,
                              draggingModel.index,
                              brandOffset + rowIndex,
                            );
                            setDraggingModel(null);
                          }}
                          className={`break-inside-avoid ${
                            rowIndex % 2 === 0 ? "bg-white" : "bg-[#F4FBF9]"
                          } ${
                            draggingModel?.brand === brand &&
                            draggingModel.index === brandOffset + rowIndex
                              ? "bg-[#18AD8D]/10"
                              : ""
                          }`}
                        >
                          <td className="print:hidden py-0.5 pr-0 pl-1 align-top">
                            <div className="flex items-center">
                              <button
                                type="button"
                                draggable
                                onDragStart={() =>
                                  setDraggingModel({
                                    brand,
                                    index: brandOffset + rowIndex,
                                  })
                                }
                                onDragEnd={() => setDraggingModel(null)}
                                className="cursor-grab p-0.5 text-neutral-300 hover:text-[#0A1F1B]"
                                aria-label={`Drag ${product.name}`}
                              >
                                <GripVertical className="h-3.5 w-3.5" />
                              </button>
                              <ReorderControls
                                label={product.name}
                                index={brandOffset + rowIndex}
                                total={brandItemCount}
                                onMove={(from, to) => moveModel(brand, from, to)}
                              />
                            </div>
                          </td>
                          <td className="py-0.5 pr-1.5 pl-1 align-top text-[10px] font-medium text-neutral-400">
                            {String(brandOffset + rowIndex + 1).padStart(2, "0")}
                          </td>
                          <td className="w-[78mm] py-0.5 pr-1.5 align-top">
                            <p className="font-semibold leading-tight break-words text-[#0A1F1B]">
                              {product.name}
                            </p>
                            {product.description.trim() ? (
                              <p className="mt-0.5 text-[9px] leading-snug font-normal break-words whitespace-normal text-neutral-500">
                                {product.description.trim()}
                              </p>
                            ) : null}
                          </td>
                          <td className="py-0.5 pr-1.5 align-top">
                            <div className="flex flex-wrap justify-center gap-px">
                              {product.deviceTypes.map((type) => (
                                <span
                                  key={type}
                                  title={DEVICE_TYPE_LABELS[type]}
                                  className="inline-flex min-w-[1.65rem] justify-center rounded border border-[#18AD8D]/25 bg-[#18AD8D]/10 px-1 py-px text-[7px] font-semibold tracking-[0.06em] text-[#0A1F1B]"
                                >
                                  {type}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-0.5 pr-1.5 text-center">
                            <input
                              type="text"
                              value={product.channels}
                              placeholder="—"
                              aria-label={`Channels for ${product.name}`}
                              onChange={(event) =>
                                updateChannels(product.id, event.target.value)
                              }
                              onClick={(event) => event.stopPropagation()}
                              className="print:hidden mx-auto block w-[4.25rem] rounded border border-transparent bg-transparent px-1 py-0 text-center text-[11px] tabular-nums font-semibold text-[#0A1F1B] outline-none placeholder:font-medium placeholder:text-neutral-300 hover:border-neutral-200 hover:bg-white focus:border-[#18AD8D] focus:bg-white"
                            />
                            <span className="hidden print:inline tabular-nums font-semibold text-[#0A1F1B]">
                              {product.channels.trim() || "—"}
                            </span>
                          </td>
                          <td className="py-0.5 pr-1.5 text-center">
                            <span className="inline-flex rounded-full bg-neutral-100 px-1.5 py-px text-[9px] font-medium text-neutral-600">
                              {product.unit}
                            </span>
                          </td>
                          <td className="py-0.5 pr-1.5 text-center tabular-nums font-semibold text-[#0A1F1B]">
                            {product.warrantyYears}
                          </td>
                          <td className="py-0.5 pr-1 text-center">
                            <FeatureMark
                              active={product.isRechargeable}
                              label="Rechargeable"
                              Icon={BatteryCharging}
                              tone="teal"
                            />
                          </td>
                          <td className="py-0.5 pr-1 text-center">
                            <FeatureMark
                              active={product.hasBluetooth}
                              label="Bluetooth"
                              Icon={Bluetooth}
                              tone="orange"
                            />
                          </td>
                          <td className="py-0.5 pr-1.5 text-right text-[12px] font-semibold tabular-nums text-[#FF6503]">
                            {formatInr(product.mrp)}
                          </td>
                          <td className="print:hidden py-0.5 pr-1.5">
                            <div className="flex justify-end gap-0.5">
                              <button
                                type="button"
                                onClick={() => openEdit(product)}
                                className="rounded-full p-1 text-neutral-400 hover:bg-white hover:text-[#18AD8D]"
                                aria-label={`Edit ${product.name}`}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteProduct(product.id)}
                                className="rounded-full p-1 text-neutral-400 hover:bg-white hover:text-[#FF6503]"
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

                <div
                  data-print-notes
                  className="mt-1 shrink-0 space-y-0 text-[8px] leading-tight text-neutral-400"
                >
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
