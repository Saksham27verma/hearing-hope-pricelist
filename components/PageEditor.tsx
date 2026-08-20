"use client";

import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { BRAND_LOGOS, KNOWN_BRANDS, type CatalogPage } from "@/data/products";

type PageEditorProps = {
  open: boolean;
  page?: CatalogPage | null;
  existingBrands: string[];
  onClose: () => void;
  onSave: (page: CatalogPage) => void;
};

export default function PageEditor({
  open,
  page,
  existingBrands,
  onClose,
  onSave,
}: PageEditorProps) {
  const [brand, setBrand] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setBrand(page?.brand ?? "");
  }, [open, page]);

  const brandChoices = Array.from(
    new Set([...KNOWN_BRANDS, ...existingBrands]),
  );

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextBrand = brand.trim();
    if (!nextBrand) {
      setError("Select or enter a brand for this page.");
      return;
    }

    onSave({
      id: page?.id ?? `page-${Date.now()}`,
      brand: nextBrand,
    });
    onClose();
  }

  if (!open) return null;

  return (
    <div className="print:hidden fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-[#0A1F1B]/45 p-4 sm:p-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.22em] text-[#FF6503] uppercase">
              Catalog
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#0A1F1B]">
              {page ? "Edit page" : "Add page"}
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Choose the manufacturer this A4 page should show.
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

        <fieldset>
          <legend className="mb-3 text-sm font-medium text-[#0A1F1B]">
            Brand
          </legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {brandChoices.map((name) => {
              const selected = brand === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setBrand(name)}
                  className={`flex min-h-[76px] flex-col items-center justify-center gap-2 rounded-xl border px-3 py-3 text-center transition-colors ${
                    selected
                      ? "border-[#18AD8D] bg-[#18AD8D]/10"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  {BRAND_LOGOS[name] ? (
                    <img
                      src={BRAND_LOGOS[name]}
                      alt=""
                      className="h-7 max-w-[96px] w-auto object-contain"
                    />
                  ) : null}
                  <span className="text-xs font-semibold text-[#0A1F1B]">
                    {name}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="mt-4 grid gap-1.5 text-sm">
          <span className="font-medium text-[#0A1F1B]">
            Or type another brand
          </span>
          <input
            value={KNOWN_BRANDS.includes(brand) ? "" : brand}
            onChange={(event) => setBrand(event.target.value)}
            placeholder="Unitron, Starkey, ..."
            className="rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:border-[#18AD8D]"
          />
        </label>

        {error ? <p className="mt-4 text-sm text-[#FF6503]">{error}</p> : null}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-neutral-500 hover:bg-neutral-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-full bg-[#0A1F1B] px-5 py-2 text-sm font-semibold text-white hover:bg-[#14352e]"
          >
            Save page
          </button>
        </div>
      </form>
    </div>
  );
}
