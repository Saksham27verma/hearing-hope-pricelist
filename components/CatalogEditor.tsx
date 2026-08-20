"use client";

import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import {
  DEVICE_TYPE_LABELS,
  DEVICE_TYPE_ORDER,
  labelForPage,
  type CatalogPage,
  type DeviceType,
  type HearingAid,
  type Unit,
} from "@/data/products";

type Draft = {
  id?: string;
  pageId: string;
  brand: string;
  name: string;
  mrp: string;
  unit: Unit;
  deviceTypes: DeviceType[];
  isRechargeable: boolean;
  hasBluetooth: boolean;
};

const emptyDraft = (page?: CatalogPage | null): Draft => ({
  pageId: page?.id ?? "",
  brand: page?.brand ?? "",
  name: "",
  mrp: "",
  unit: "Pair",
  deviceTypes: [],
  isRechargeable: true,
  hasBluetooth: true,
});

function toDraft(product: HearingAid): Draft {
  return {
    id: product.id,
    pageId: product.pageId,
    brand: product.brand,
    name: product.name,
    mrp: String(product.mrp),
    unit: product.unit,
    deviceTypes: [...product.deviceTypes],
    isRechargeable: product.isRechargeable,
    hasBluetooth: product.hasBluetooth,
  };
}

type CatalogEditorProps = {
  open: boolean;
  product?: HearingAid | null;
  defaultPage?: CatalogPage | null;
  pages: CatalogPage[];
  onClose: () => void;
  onSave: (product: HearingAid) => void;
};

export default function CatalogEditor({
  open,
  product,
  defaultPage,
  pages,
  onClose,
  onSave,
}: CatalogEditorProps) {
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setDraft(product ? toDraft(product) : emptyDraft(defaultPage));
  }, [open, product, defaultPage]);

  const title = product ? "Edit model" : "Add model";
  const selectedPage = pages.find((page) => page.id === draft.pageId);

  function selectPage(pageId: string) {
    const page = pages.find((item) => item.id === pageId);
    setDraft((current) => ({
      ...current,
      pageId,
      brand: page?.brand ?? current.brand,
    }));
  }

  function toggleType(type: DeviceType) {
    setDraft((current) => {
      const selected = current.deviceTypes.includes(type)
        ? current.deviceTypes.filter((item) => item !== type)
        : [...current.deviceTypes, type];
      return {
        ...current,
        deviceTypes: DEVICE_TYPE_ORDER.filter((item) => selected.includes(item)),
      };
    });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const name = draft.name.trim();
    const mrp = Number(draft.mrp.replace(/,/g, ""));
    const page = pages.find((item) => item.id === draft.pageId);

    if (!page) {
      setError("Select a brand page for this model.");
      return;
    }
    if (!name) {
      setError("Please enter the model name.");
      return;
    }
    if (!Number.isFinite(mrp) || mrp < 0) {
      setError("Please enter a valid MRP.");
      return;
    }
    if (draft.deviceTypes.length === 0) {
      setError("Select at least one device type. You can choose more than one.");
      return;
    }

    onSave({
      id: draft.id ?? `model-${Date.now()}`,
      pageId: page.id,
      brand: page.brand,
      name,
      mrp,
      unit: draft.unit,
      isRechargeable: draft.isRechargeable,
      hasBluetooth: draft.hasBluetooth,
      deviceTypes: draft.deviceTypes,
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
            <h2 className="mt-1 text-xl font-semibold text-[#0A1F1B]">{title}</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Choose the brand page, then add the model name, price, and device
              types.
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

        <div className="grid gap-4">
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium text-[#0A1F1B]">Brand page</span>
            {pages.length === 0 ? (
              <p className="rounded-lg border border-dashed border-neutral-200 px-3 py-2 text-neutral-500">
                Add a brand page first, then you can place a model on it.
              </p>
            ) : (
              <select
                value={draft.pageId}
                onChange={(event) => selectPage(event.target.value)}
                className="rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:border-[#18AD8D]"
              >
                <option value="">Select a page</option>
                {pages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {labelForPage(page, pages)}
                  </option>
                ))}
              </select>
            )}
            {selectedPage ? (
              <span className="text-xs text-neutral-500">
                This model will appear on the {selectedPage.brand} page.
              </span>
            ) : null}
          </label>

          <label className="grid gap-1.5 text-sm">
            <span className="font-medium text-[#0A1F1B]">Model name</span>
            <input
              value={draft.name}
              onChange={(event) =>
                setDraft((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Audéo Lumity L90-R"
              className="rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:border-[#18AD8D]"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-[#0A1F1B]">MRP (₹)</span>
              <input
                inputMode="numeric"
                value={draft.mrp}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, mrp: event.target.value }))
                }
                placeholder="325000"
                className="rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:border-[#18AD8D]"
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-[#0A1F1B]">Unit</span>
              <select
                value={draft.unit}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    unit: event.target.value as Unit,
                  }))
                }
                className="rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:border-[#18AD8D]"
              >
                <option value="Pair">Pair</option>
                <option value="Single">Single</option>
              </select>
            </label>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-[#0A1F1B]">
              Device type
            </legend>
            <p className="mb-2 text-xs text-neutral-500">
              Select every style this model is available in. Example: BTE and RIC.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {DEVICE_TYPE_ORDER.map((type) => {
                const selected = draft.deviceTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleType(type)}
                    className={`rounded-xl border px-3 py-2 text-left transition-colors ${
                      selected
                        ? "border-[#18AD8D] bg-[#18AD8D]/10 text-[#0A1F1B]"
                        : "border-neutral-200 text-neutral-500 hover:border-neutral-300"
                    }`}
                  >
                    <span className="block text-sm font-semibold tracking-wide">
                      {type}
                    </span>
                    <span className="block text-[10px] leading-tight">
                      {DEVICE_TYPE_LABELS[type]}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="flex flex-wrap gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={draft.isRechargeable}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    isRechargeable: event.target.checked,
                  }))
                }
                className="accent-[#18AD8D]"
              />
              Rechargeable
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={draft.hasBluetooth}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    hasBluetooth: event.target.checked,
                  }))
                }
                className="accent-[#FF6503]"
              />
              Bluetooth
            </label>
          </div>
        </div>

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
            Save model
          </button>
        </div>
      </form>
    </div>
  );
}
