import { Globe, MapPin, Phone } from "lucide-react";
import { BRAND_LOGOS, DEVICE_TYPE_LABELS } from "@/data/products";

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
          Recommended Price List
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

const HEARING_AID_TYPES = [
  {
    code: "BTE" as const,
    fit: "Mild to profound",
    summary:
      "The processor sits behind the ear and connects to a custom earmold through a tube. Easy to handle, powerful, and suitable for a wide range of hearing loss.",
  },
  {
    code: "RIC" as const,
    fit: "Mild to severe",
    summary:
      "A slim aid behind the ear with a tiny speaker placed in the canal. Discreet, comfortable, and the most common everyday style.",
  },
  {
    code: "CIC" as const,
    fit: "Mild to moderate",
    summary:
      "A custom shell that sits completely in the ear canal. Very discreet, with only a small faceplate visible on close look.",
  },
  {
    code: "IIC" as const,
    fit: "Mild to moderate",
    summary:
      "The deepest custom fit, placed far in the canal so it is nearly invisible. Best when discretion is the priority.",
  },
  {
    code: "ITE" as const,
    fit: "Mild to severe",
    summary:
      "A custom aid that fills the bowl of the outer ear. Larger controls and battery, easier to insert and remove.",
  },
  {
    code: "ITC" as const,
    fit: "Mild to moderate",
    summary:
      "A smaller custom aid that sits in the opening of the canal. A balance of discretion and easy handling.",
  },
];

function EarIllustration({
  type,
}: {
  type: (typeof HEARING_AID_TYPES)[number]["code"];
}) {
  return (
    <svg
      viewBox="0 0 200 220"
      className="h-[118px] w-auto"
      aria-hidden="true"
    >
      <ellipse cx="108" cy="112" rx="62" ry="86" fill="#F4FBF9" />
      <path
        d="M118 28c28 8 48 36 48 70 0 46-28 78-62 86-22 6-40-4-48-18-4 16-18 28-34 22"
        fill="none"
        stroke="#18AD8D"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M96 52c22 4 38 22 38 46 0 28-18 48-40 54"
        fill="none"
        stroke="#18AD8D"
        strokeOpacity="0.45"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M90 78c14 6 22 18 22 32 0 14-8 24-20 30"
        fill="none"
        stroke="#0A1F1B"
        strokeOpacity="0.18"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <ellipse cx="84" cy="118" rx="14" ry="18" fill="#E7F6F2" stroke="#18AD8D" strokeWidth="1.6" />

      {type === "BTE" ? (
        <>
          <rect x="142" y="58" width="28" height="58" rx="12" fill="#0A1F1B" />
          <rect x="147" y="66" width="18" height="10" rx="3" fill="#18AD8D" />
          <path
            d="M156 58c2-18-18-32-48-34"
            fill="none"
            stroke="#FF6503"
            strokeWidth="3.4"
            strokeLinecap="round"
          />
          <path
            d="M108 28c-8 18-16 42-22 70"
            fill="none"
            stroke="#FF6503"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <ellipse cx="84" cy="118" rx="11" ry="14" fill="#FF6503" />
        </>
      ) : null}

      {type === "RIC" ? (
        <>
          <rect x="148" y="64" width="22" height="42" rx="10" fill="#0A1F1B" />
          <rect x="152" y="70" width="14" height="8" rx="2" fill="#18AD8D" />
          <path
            d="M159 106c-8 8-28 14-62 16"
            fill="none"
            stroke="#0A1F1B"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="84" cy="122" r="8" fill="#FF6503" />
          <circle cx="84" cy="122" r="3.2" fill="#fff" />
        </>
      ) : null}

      {type === "ITE" ? (
        <path
          d="M78 86c18-8 38-4 46 14 6 14 2 32-12 42-16 12-36 8-46-6-8-12-6-32 12-50z"
          fill="#0A1F1B"
        />
      ) : null}

      {type === "ITC" ? (
        <path
          d="M74 100c12-8 28-6 34 8 4 10 2 22-8 28-12 8-26 4-32-8-4-10-2-20 6-28z"
          fill="#0A1F1B"
        />
      ) : null}

      {type === "CIC" ? (
        <>
          <ellipse cx="84" cy="118" rx="12" ry="15" fill="#0A1F1B" />
          <circle cx="80" cy="114" r="2.4" fill="#18AD8D" />
        </>
      ) : null}

      {type === "IIC" ? (
        <>
          <ellipse
            cx="84"
            cy="118"
            rx="18"
            ry="22"
            fill="none"
            stroke="#18AD8D"
            strokeDasharray="4 4"
            strokeWidth="1.6"
          />
          <ellipse cx="84" cy="120" rx="7" ry="9" fill="#0A1F1B" />
        </>
      ) : null}
    </svg>
  );
}

export function HearingAidTypesPage() {
  return (
    <section
      className="print-page mx-auto flex min-h-[297mm] w-[210mm] max-w-[210mm] flex-col overflow-hidden bg-white shadow-[0_18px_50px_rgba(10,31,27,0.12)] print:h-[297mm] print:max-h-[297mm] print:max-w-none print:shadow-none print:break-before-page"
    >
      <AccentBar />
      <div className="flex min-h-0 flex-1 flex-col px-8 pt-6 pb-5">
        <header className="flex items-center justify-between gap-4">
          <img
            src="/brand/logo.png"
            alt="Hearing Hope — Centre for Speech & Hearing"
            className="h-8 w-auto object-contain"
          />
          <div className="text-right">
            <p className="text-[9px] font-semibold tracking-[0.28em] text-[#18AD8D] uppercase">
              Recommended Price List
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-[#0A1F1B]">
              August 2026
            </p>
          </div>
        </header>

        <div className="mt-5">
          <p className="text-[10px] font-semibold tracking-[0.22em] text-[#FF6503] uppercase">
            Patient guide
          </p>
          <h2 className="mt-1 text-[26px] leading-none font-semibold tracking-tight text-[#0A1F1B]">
            Types of hearing aids
          </h2>
          <p className="mt-2 max-w-xl text-[12px] leading-relaxed text-neutral-500">
            Six common styles used in clinic. The right choice depends on hearing
            loss, ear anatomy, and how discreet or easy to handle the aid should
            be.
          </p>
        </div>

        <div className="mt-5 grid min-h-0 flex-1 grid-cols-2 grid-rows-3 gap-3">
          {HEARING_AID_TYPES.map((item) => (
            <article
              key={item.code}
              className="flex break-inside-avoid items-center gap-3 rounded-2xl border border-neutral-200 bg-[#F4FBF9] px-3 py-2.5"
            >
              <div className="flex h-[126px] w-[112px] shrink-0 items-center justify-center rounded-xl bg-white ring-1 ring-neutral-200">
                <EarIllustration type={item.code} />
              </div>
              <div className="min-w-0">
                <span className="inline-flex rounded-full bg-[#0A1F1B] px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-white">
                  {item.code}
                </span>
                <h3 className="mt-1.5 text-[15px] leading-tight font-semibold text-[#0A1F1B]">
                  {DEVICE_TYPE_LABELS[item.code]}
                </h3>
                <p className="mt-1 text-[10px] font-medium text-[#18AD8D]">
                  Typical fit: {item.fit}
                </p>
                <p className="mt-1.5 text-[10px] leading-snug text-neutral-600">
                  {item.summary}
                </p>
              </div>
            </article>
          ))}
        </div>

        <footer className="mt-4 shrink-0">
          <div className="mb-2 h-px w-full bg-gradient-to-r from-[#18AD8D] via-[#18AD8D]/20 to-[#FF6503]" />
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[9px] font-semibold tracking-wide text-[#0A1F1B]">
                Hearing Hope · Centre for Speech & Hearing
              </p>
              <p className="mt-0.5 text-[9px] text-neutral-500">
                +91 97118 71168 · +91 97118 71169
              </p>
            </div>
            <p className="text-[9px] font-medium text-[#18AD8D]">
              hearinghope.in
            </p>
          </div>
        </footer>
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
