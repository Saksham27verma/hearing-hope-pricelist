"use client";

import { useEffect, useState, type DragEvent } from "react";
import { FileSpreadsheet, Upload, X } from "lucide-react";
import { CSV_COLUMNS, CSV_TEMPLATE, parseCatalogCsv } from "@/lib/csv-import";
import type { CatalogPage, HearingAid } from "@/data/products";

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

type CsvImportProps = {
  open: boolean;
  page?: CatalogPage | null;
  onClose: () => void;
  onImport: (products: HearingAid[]) => void;
};

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "hearing-hope-devices-template.csv";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function CsvImport({
  open,
  page,
  onClose,
  onImport,
}: CsvImportProps) {
  const [fileName, setFileName] = useState("");
  const [products, setProducts] = useState<HearingAid[]>([]);
  const [errors, setErrors] = useState<{ row: number; message: string }[]>([]);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFileName("");
    setProducts([]);
    setErrors([]);
    setDragging(false);
  }, [open, page]);

  function handleFile(file: File) {
    if (!page) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setFileName(file.name);
      setProducts([]);
      setErrors([{ row: 1, message: "Please choose a .csv file." }]);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      const result = parseCatalogCsv(text, page);
      setFileName(file.name);
      setProducts(result.products);
      setErrors(result.errors);
    };
    reader.readAsText(file);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function confirmImport() {
    if (products.length === 0) return;
    onImport(products);
    onClose();
  }

  if (!open || !page) return null;

  return (
    <div className="print:hidden fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-[#0A1F1B]/45 p-3 sm:p-5">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-start justify-between gap-3 px-5 pt-4 pb-3">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.22em] text-[#FF6503] uppercase">
              Catalog
            </p>
            <h2 className="mt-0.5 text-lg font-semibold text-[#0A1F1B]">
              Import {page.brand} devices
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Models in this CSV are added to the current {page.brand} page.
              Brand is taken from the page, so do not include a brand column.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-[#0A1F1B]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
          <div className="rounded-xl border border-neutral-200 bg-[#F4FBF9] p-3">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-[#0A1F1B] uppercase">
              Header row, in this order
            </p>
            <code className="mt-2 block whitespace-pre-wrap break-words rounded-lg bg-white px-3 py-2 text-[11px] leading-relaxed text-[#0A1F1B]">
              {CSV_COLUMNS.join(",")}
            </code>
            <div className="mt-2 flex flex-wrap gap-1">
              {CSV_COLUMNS.map((column) => (
                <span
                  key={column}
                  className="rounded-md bg-white px-1.5 py-0.5 font-mono text-[10px] text-[#0A1F1B]"
                >
                  {column}
                  {column === "name" ||
                  column === "mrp" ||
                  column === "deviceTypes"
                    ? " *"
                    : ""}
                </span>
              ))}
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-neutral-500">
              * required. Use <span className="font-medium text-[#0A1F1B]">BTE;RIC</span>{" "}
              in deviceTypes. Yes/No works for rechargeable and Bluetooth.
            </p>
            <button
              type="button"
              onClick={downloadTemplate}
              className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-medium text-[#18AD8D] hover:underline"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Download CSV template
            </button>
          </div>

          <label
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-8 text-center transition-colors ${
              dragging
                ? "border-[#18AD8D] bg-[#18AD8D]/8"
                : "border-neutral-200 hover:border-neutral-300"
            }`}
          >
            <Upload className="h-5 w-5 text-[#18AD8D]" />
            <span className="mt-2 text-sm font-medium text-[#0A1F1B]">
              Drop a .csv file here, or click to browse
            </span>
            <span className="mt-1 text-xs text-neutral-500">
              {fileName || "UTF-8 CSV from Excel or Google Sheets"}
            </span>
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleFile(file);
                event.target.value = "";
              }}
            />
          </label>

          {errors.length > 0 ? (
            <div className="mt-3 rounded-xl border border-[#FF6503]/30 bg-[#FF6503]/8 px-3 py-2">
              <p className="text-sm font-medium text-[#0A1F1B]">
                {errors.length} row{errors.length === 1 ? "" : "s"} could not be
                imported
              </p>
              <ul className="mt-1 max-h-28 space-y-0.5 overflow-y-auto text-[12px] text-[#FF6503]">
                {errors.slice(0, 8).map((error) => (
                  <li key={`${error.row}-${error.message}`}>
                    Row {error.row}: {error.message}
                  </li>
                ))}
                {errors.length > 8 ? (
                  <li>and {errors.length - 8} more…</li>
                ) : null}
              </ul>
            </div>
          ) : null}

          {products.length > 0 ? (
            <div className="mt-3 overflow-hidden rounded-xl border border-neutral-200">
              <p className="bg-[#0A1F1B] px-3 py-1.5 text-[11px] font-medium text-white">
                {products.length} model{products.length === 1 ? "" : "s"} ready
                for {page.brand}
              </p>
              <div className="max-h-48 overflow-auto">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="text-[10px] tracking-wide text-neutral-400 uppercase">
                      <th className="px-3 py-1.5 font-medium">Name</th>
                      <th className="px-3 py-1.5 font-medium">Type</th>
                      <th className="px-3 py-1.5 text-right font-medium">MRP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.slice(0, 12).map((product) => (
                      <tr key={product.id} className="border-t border-neutral-100">
                        <td className="px-3 py-1.5 font-medium text-[#0A1F1B]">
                          {product.name}
                        </td>
                        <td className="px-3 py-1.5 text-neutral-500">
                          {product.deviceTypes.join(", ")}
                        </td>
                        <td className="px-3 py-1.5 text-right tabular-nums text-[#FF6503]">
                          {formatInr(product.mrp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {products.length > 12 ? (
                <p className="border-t border-neutral-100 px-3 py-1.5 text-[11px] text-neutral-400">
                  and {products.length - 12} more models
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-neutral-100 bg-white px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-neutral-500 hover:bg-neutral-100"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={products.length === 0}
            onClick={confirmImport}
            className="rounded-full bg-[#0A1F1B] px-5 py-2 text-sm font-semibold text-white hover:bg-[#14352e] disabled:opacity-40"
          >
            Import {products.length || ""}{" "}
            {products.length === 1 ? "model" : "models"}
          </button>
        </div>
      </div>
    </div>
  );
}
