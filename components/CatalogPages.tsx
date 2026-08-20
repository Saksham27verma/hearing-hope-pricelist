import { Globe, MapPin, Phone } from "lucide-react";
import { BRAND_LOGOS } from "@/data/products";

const pageClass =
  "print-page mx-auto flex min-h-[297mm] w-full max-w-[210mm] flex-col overflow-hidden bg-white shadow-[0_18px_50px_rgba(10,31,27,0.12)] print:max-w-none print:shadow-none";

const BRANCHES = [
  { name: "Rohini", detail: "Kings Mall, Sector 10, New Delhi" },
  { name: "Green Park", detail: "E-12, Green Park Main, New Delhi" },
  { name: "Indirapuram", detail: "Krishna Apra, Shakti Khand 2, Ghaziabad" },
  { name: "Sanjay Nagar", detail: "Vardhman Hospital, Sector 23, Ghaziabad" },
];

function AccentBar() {
  return (
    <div className="flex h-1.5 w-full">
      <div className="h-full flex-[3] bg-[#18AD8D]" />
      <div className="h-full flex-1 bg-[#FF6503]" />
    </div>
  );
}

function Wave() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 282 13"
      className="h-2.5 w-40"
      aria-hidden="true"
    >
      <path
        d="M0.255859 6.05294C47.0475 2.54355 93.8392 2.54355 140.631 6.05294C187.423 9.56232 234.214 9.56232 281.006 6.05294"
        stroke="#18AD8D"
        strokeOpacity="0.55"
        strokeWidth="6.8"
        fill="none"
      />
    </svg>
  );
}

export function CoverPage({
  brandNames,
  modelCount,
}: {
  brandNames: string[];
  modelCount: number;
}) {
  const logos = brandNames.filter((brand) => BRAND_LOGOS[brand]);

  return (
    <section className={pageClass}>
      <AccentBar />
      <div className="flex flex-1 flex-col items-center px-14 pt-16 pb-12 text-center">
        <p className="text-[11px] font-semibold tracking-[0.32em] text-[#18AD8D] uppercase">
          Centre for Speech & Hearing
        </p>

        <img
          src="/brand/logo.png"
          alt="Hearing Hope"
          className="mt-12 h-40 w-auto object-contain"
        />

        <div className="mt-8">
          <Wave />
        </div>

        <h1 className="mt-8 text-[34px] leading-tight font-semibold tracking-tight text-[#0A1F1B]">
          Official Price List
        </h1>
        <p className="mt-3 text-sm text-neutral-500">August 2026</p>

        <div className="mt-8 flex items-center gap-6 text-[12px] font-medium text-[#0A1F1B]">
          <span>{brandNames.length} brands</span>
          <span className="h-1 w-1 rounded-full bg-[#FF6503]" />
          <span>
            {modelCount} {modelCount === 1 ? "model" : "models"}
          </span>
        </div>

        <p className="mt-5 max-w-sm text-[13px] leading-relaxed text-neutral-500">
          Premium hearing aids from trusted manufacturers, prepared for clinic
          consultation at Hearing Hope.
        </p>

        {logos.length > 0 ? (
          <div className="mt-auto w-full pt-12">
            <p className="mb-5 text-[10px] font-semibold tracking-[0.22em] text-neutral-400 uppercase">
              Featured brands
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
              {logos.map((brand) => (
                <img
                  key={brand}
                  src={BRAND_LOGOS[brand]}
                  alt={brand}
                  className="h-8 max-w-[110px] w-auto object-contain"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-auto" />
        )}

        <div className="mt-10 w-full border-t border-neutral-200 pt-5 text-[11px] text-neutral-500">
          <p className="font-medium text-[#0A1F1B]">hearinghope.in</p>
          <p className="mt-1">
            Rohini · Green Park · Indirapuram · Sanjay Nagar
          </p>
        </div>
      </div>
    </section>
  );
}

export function ClosingPage() {
  return (
    <section className={`${pageClass} print:break-before-page`}>
      <AccentBar />
      <div className="flex flex-1 flex-col items-center px-14 pt-16 pb-12 text-center">
        <p className="text-[11px] font-semibold tracking-[0.32em] text-[#FF6503] uppercase">
          Thank you
        </p>

        <img
          src="/brand/logo.png"
          alt="Hearing Hope"
          className="mt-10 h-32 w-auto object-contain"
        />

        <div className="mt-8">
          <Wave />
        </div>

        <h2 className="mt-8 max-w-md text-[28px] leading-tight font-semibold tracking-tight text-[#0A1F1B]">
          Silence is overrated.
          <br />
          Start hearing today.
        </h2>
        <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-neutral-500">
          Visit any Hearing Hope clinic for a hearing test, expert fitting, and
          a personalised recommendation.
        </p>

        <div className="mt-10 grid w-full grid-cols-2 gap-3 text-left">
          {BRANCHES.map((branch) => (
            <div
              key={branch.name}
              className="rounded-xl border border-neutral-200 bg-[#F4FBF9] px-4 py-3"
            >
              <p className="text-[12px] font-semibold text-[#0A1F1B]">
                {branch.name}
              </p>
              <p className="mt-1 text-[10px] leading-snug text-neutral-500">
                {branch.detail}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-auto w-full pt-10">
          <div className="flex flex-col items-center gap-2 text-[12px] text-[#0A1F1B]">
            <p className="inline-flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-[#18AD8D]" strokeWidth={2} />
              +91 97118 71168 · +91 97118 71169
            </p>
            <p className="inline-flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-[#FF6503]" strokeWidth={2} />
              hearinghope.in
            </p>
            <p className="inline-flex items-center gap-2 text-neutral-500">
              <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
              Delhi NCR
            </p>
          </div>
          <p className="mt-6 text-[10px] text-neutral-400">
            Prices listed are MRP. Clinic offers and schemes may apply. Hearing
            Hope — Centre for Speech & Hearing.
          </p>
        </div>
      </div>
      <div className="flex h-1.5 w-full">
        <div className="h-full flex-1 bg-[#FF6503]" />
        <div className="h-full flex-[3] bg-[#18AD8D]" />
      </div>
    </section>
  );
}
