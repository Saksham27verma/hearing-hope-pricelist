"use client";

import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import {
  DEVICE_TYPE_LABELS,
  DEVICE_TYPE_ORDER,
  WARRANTY_OPTIONS,
  labelForPage,
  type CatalogPage,
  type DeviceType,
  type HearingAid,
  type Unit,
  type WarrantyYears,
} from "@/data/products";

type Draft = {
  id?: string;
  pageId: string;
  brand: string;
  name: string;
  mrp: string;
  unit: Unit;
  warrantyYears: WarrantyYears;
  channels: string;
  description: string;
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
  warrantyYears: 2,
  channels: "",
  description: "",
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
    warrantyYears: product.warrantyYears === 4 ? 4 : 2,
    channels: product.channels ?? "",
    description: product.description ?? "",
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
      warrantyYears: draft.warrantyYears,
      channels: draft.channels.trim(),
      description: draft.description.trim(),
      isRechargeable: draft.isRechargeable,
      hasBluetooth: draft.hasBluetooth,
      deviceTypes: draft.deviceTypes,
    });
    onClose();
  }

  if (!open) return null;

  const fieldClass =
    "w-full min-w-0 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-sm outline-none focus:border-[#18AD8D]";

  return (
    <div className="print:hidden fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-[#0A1F1B]/45 p-3 sm:p-5">
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 px-5 pt-4 pb-3">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.22em] text-[#FF6503] uppercase">
              Catalog
            </p>
            <h2 className="mt-0.5 text-lg font-semibold text-[#0A1F1B]">
              {title}
            </h2>
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

        <div className="min-h-0 flex-1 overflow-y-auto px-5">
          <div className="grid gap-3 pb-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="grid min-w-0 gap-1 text-sm">
                <span className="font-medium text-[#0A1F1B]">Brand page</span>
                {pages.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-neutral-200 px-2.5 py-1.5 text-neutral-500">
                    Add a brand page first.
                  </p>
                ) : (
                  <select
                    value={draft.pageId}
                    onChange={(event) => selectPage(event.target.value)}
                    className={fieldClass}
                  >
                    <option value="">Select a page</option>
                    {pages.map((page) => (
                      <option key={page.id} value={page.id}>
                        {labelForPage(page, pages)}
                      </option>
                    ))}
                  </select>
                )}
              </label>

              <label className="grid min-w-0 gap-1 text-sm">
                <span className="font-medium text-[#0A1F1B]">Model name</span>
                <input
                  value={draft.name}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Audéo Lumity L90-R"
                  className={fieldClass}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="grid min-w-0 gap-1 text-sm">
                <span className="font-medium text-[#0A1F1B]">MRP (₹)</span>
                <input
                  inputMode="numeric"
                  value={draft.mrp}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      mrp: event.target.value,
                    }))
                  }
                  placeholder="325000"
                  className={fieldClass}
                />
              </label>
              <label className="grid min-w-0 gap-1 text-sm">
                <span className="font-medium text-[#0A1F1B]">Unit</span>
                <select
                  value={draft.unit}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      unit: event.target.value as Unit,
                    }))
                  }
                  className={fieldClass}
                >
                  <option value="Pair">Pair</option>
                  <option value="Single">Single</option>
                </select>
              </label>
              <label className="grid min-w-0 gap-1 text-sm">
                <span className="font-medium text-[#0A1F1B]">Warranty</span>
                <select
                  value={draft.warrantyYears}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      warrantyYears: Number(event.target.value) as WarrantyYears,
                    }))
                  }
                  className={fieldClass}
                >
                  {WARRANTY_OPTIONS.map((years) => (
                    <option key={years} value={years}>
                      {years} years
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid min-w-0 gap-1 text-sm">
                <span className="font-medium text-[#0A1F1B]">Channels/Band</span>
                <input
                  value={draft.channels}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      channels: event.target.value,
                    }))
                  }
                  placeholder="48"
                  className={fieldClass}
                />
              </label>
            </div>

            <label className="grid min-w-0 gap-1 text-sm">
              <span className="font-medium text-[#0A1F1B]">
                Description{" "}
                <span className="font-normal text-neutral-400">(optional)</span>
              </span>
              <textarea
                value={draft.description}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Shown under the model name if added"
                rows={2}
                className={`${fieldClass} resize-none`}
              />
            </label>

            <fieldset>
              <legend className="mb-1.5 text-sm font-medium text-[#0A1F1B]">
                Device type
              </legend>
              <div className="grid grid-cols-3 gap-1.5">
                {DEVICE_TYPE_ORDER.map((type) => {
                  const selected = draft.deviceTypes.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      title={DEVICE_TYPE_LABELS[type]}
                      onClick={() => toggleType(type)}
                      className={`rounded-lg border px-2 py-1.5 text-left transition-colors ${
                        selected
                          ? "border-[#18AD8D] bg-[#18AD8D]/10 text-[#0A1F1B]"
                          : "border-neutral-200 text-neutral-500 hover:border-neutral-300"
                      }`}
                    >
                      <span className="block text-sm font-semibold tracking-wide">
                        {type}
                      </span>
                      <span className="block truncate text-[10px] leading-tight">
                        {DEVICE_TYPE_LABELS[type]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
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
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-neutral-100 bg-white px-5 py-3">
          {error ? (
            <p className="min-w-0 text-sm text-[#FF6503]">{error}</p>
          ) : (
            <span />
          )}
          <div className="flex shrink-0 justify-end gap-2">
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
        </div>
      </form>
    </div>
  );
}
