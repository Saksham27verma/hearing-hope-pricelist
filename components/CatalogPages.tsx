import type { ComponentType, ReactNode } from "react";
import {
  Activity,
  AudioLines,
  Baby,
  BatteryCharging,
  Bluetooth,
  Brain,
  Cpu,
  Ear,
  Globe,
  House,
  MapPin,
  MessageCircle,
  Phone,
  Stethoscope,
} from "lucide-react";
import {
  BRAND_LOGOS,
  DEVICE_TYPE_LABELS,
  type HearingAid,
} from "@/data/products";
import {
  summariseAccessoriesByBrand,
  summariseAidsByBrand,
  warrantyRange,
  type Range,
} from "@/lib/catalog-stats";
import { formatInr } from "@/lib/format";

const pageClass =
  "print-page mx-auto flex min-h-[297mm] w-full max-w-[210mm] flex-col overflow-hidden bg-white shadow-[0_18px_50px_rgba(10,31,27,0.12)] print:max-w-none print:shadow-none";

const guidePageClass =
  "print-page mx-auto flex min-h-[297mm] w-[210mm] max-w-[210mm] flex-col overflow-hidden bg-white shadow-[0_18px_50px_rgba(10,31,27,0.12)] print:h-[297mm] print:max-h-[297mm] print:max-w-none print:shadow-none print:break-before-page";

const BRANCHES = [
  { name: "Rohini", detail: "Kings Mall, Sector 10, New Delhi" },
  { name: "Green Park", detail: "E-12, Green Park Main, New Delhi" },
  { name: "Indirapuram", detail: "Krishna Apra, Shakti Khand 2, Ghaziabad" },
  { name: "Sanjay Nagar", detail: "Vardhman Hospital, Sector 23, Ghaziabad" },
  { name: "Gurgaon", detail: "Gurgaon" },
  { name: "Noida", detail: "Noida" },
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

export function FeatureMark({
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

function GuideHeader() {
  return (
    <header className="flex items-center justify-between gap-4">
      <img
        src="/brand/logo.png"
        alt="Hearing Hope — Centre for Speech & Hearing"
        className="h-8 w-auto object-contain"
      />
      <div className="text-right">
        <p className="text-[9px] font-semibold tracking-[0.28em] text-[#18AD8D] uppercase">
          Official Pricelist
        </p>
        <p className="mt-0.5 text-[11px] font-medium text-[#0A1F1B]">
          August 2026
        </p>
      </div>
    </header>
  );
}

function GuideFooter() {
  return (
    <footer className="mt-auto shrink-0 pt-3">
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
        <p className="text-[9px] font-medium text-[#18AD8D]">hearinghope.in</p>
      </div>
    </footer>
  );
}

/** Shell shared by every patient-guide page: rule, masthead, title block, footer. */
function GuidePage({
  title,
  standfirst,
  children,
}: {
  title: string;
  standfirst: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={guidePageClass}>
      <AccentBar />
      <div className="flex min-h-0 flex-1 flex-col px-8 pt-6 pb-5">
        <GuideHeader />

        <div className="mt-5">
          <p className="text-[10px] font-semibold tracking-[0.22em] text-[#FF6503] uppercase">
            Patient guide
          </p>
          <h2 className="mt-1 text-[26px] leading-none font-semibold tracking-tight text-[#0A1F1B]">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-neutral-500">
            {standfirst}
          </p>
        </div>

        {children}

        <GuideFooter />
      </div>
    </section>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-semibold tracking-[0.2em] text-[#18AD8D] uppercase">
      {children}
    </p>
  );
}

function StepNumber({ children }: { children: ReactNode }) {
  return (
    <span className="mt-px inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#0A1F1B] text-[7px] font-bold text-white">
      {children}
    </span>
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
          Hearing Aids Price List
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
            Rohini · Green Park · Indirapuram · Sanjay Nagar · Gurgaon · Noida
          </p>
        </div>
      </div>
    </section>
  );
}

const CLINICAL_SERVICES = [
  {
    code: "PTA",
    name: "Pure Tone Audiometry",
    detail:
      "The quietest sounds you can hear at each pitch — the standard hearing test for adults and older children.",
    Icon: AudioLines,
    tone: "teal" as const,
  },
  {
    code: "BERA",
    name: "Brainstem evoked response",
    detail:
      "How the hearing nerve and brain respond to sound. Objective, so it works for infants and anyone who cannot press a button.",
    Icon: Brain,
    tone: "orange" as const,
  },
  {
    code: "ASSR",
    name: "Auditory steady-state response",
    detail:
      "A frequency-by-frequency hearing map when a standard audiogram is not possible — often paired with BERA.",
    Icon: Activity,
    tone: "teal" as const,
  },
  {
    code: "OAE",
    name: "Otoacoustic emissions",
    detail:
      "A gentle inner-ear screen of the cochlear hair cells. The first test for newborns and young children.",
    Icon: Baby,
    tone: "orange" as const,
  },
  {
    code: "Impedance",
    name: "Middle-ear assessment",
    detail:
      "Eardrum movement and middle-ear pressure, to find fluid, blockage, or a perforation before fitting an aid.",
    Icon: Stethoscope,
    tone: "teal" as const,
  },
  {
    code: "Hearing aids",
    name: "Trial, fitting and programming",
    detail:
      "Demonstration, real-ear verification and fine-tuning of digital hearing aids from the brands in this list.",
    Icon: Ear,
    tone: "orange" as const,
  },
  {
    code: "Cochlear implant",
    name: "Candidacy and mapping",
    detail:
      "Assessment when aids are no longer enough, plus processor mapping and rehabilitation after implantation.",
    Icon: Cpu,
    tone: "teal" as const,
  },
  {
    code: "Speech therapy",
    name: "Listen and speak",
    detail:
      "Paediatric and adult sessions for speech delay, clarity, language, and communication after hearing loss.",
    Icon: MessageCircle,
    tone: "orange" as const,
  },
];

export function ServicesPage() {
  return (
    <section
      className={`${pageClass} print:h-[297mm] print:max-h-[297mm] print:break-before-page`}
    >
      <AccentBar />
      <div className="flex min-h-0 flex-1 flex-col items-center px-10 pt-8 pb-7 text-center">
        <p className="text-[10px] font-semibold tracking-[0.32em] text-[#18AD8D] uppercase">
          Centre for Speech & Hearing
        </p>

        <img
          src="/brand/logo.png"
          alt="Hearing Hope"
          className="mt-5 h-28 w-auto object-contain"
        />

        <div className="mt-4">
          <Wave />
        </div>

        <h2 className="mt-5 text-[26px] leading-none font-semibold tracking-tight text-[#0A1F1B]">
          Clinical services
        </h2>
        <p className="mt-2 max-w-lg text-[12px] leading-relaxed text-neutral-500">
          Diagnostics, devices and therapy under one roof — from the first
          hearing test to lifelong aftercare, at every Hearing Hope clinic.
        </p>

        <div className="mt-6 grid w-full min-h-0 flex-1 grid-cols-2 content-start gap-2.5 text-left">
          {CLINICAL_SERVICES.map((service) => {
            const iconWrap =
              service.tone === "teal"
                ? "bg-[#18AD8D]/12 text-[#18AD8D]"
                : "bg-[#FF6503]/12 text-[#FF6503]";
            return (
              <article
                key={service.code}
                className="flex break-inside-avoid gap-3 rounded-2xl border border-neutral-200 bg-[#F4FBF9] px-3.5 py-3"
              >
                <span
                  className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconWrap}`}
                >
                  <service.Icon className="h-4 w-4" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p
                    className={`text-[9px] font-semibold tracking-[0.16em] uppercase ${
                      service.tone === "teal"
                        ? "text-[#18AD8D]"
                        : "text-[#FF6503]"
                    }`}
                  >
                    {service.code}
                  </p>
                  <h3 className="mt-0.5 text-[13px] leading-tight font-semibold text-[#0A1F1B]">
                    {service.name}
                  </h3>
                  <p className="mt-1 text-[10px] leading-snug text-neutral-500">
                    {service.detail}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-2xl border border-[#18AD8D]/25 bg-[#18AD8D]/8 px-4 py-2.5 text-left">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#18AD8D] ring-1 ring-[#18AD8D]/20">
            <House className="h-4 w-4" strokeWidth={2} />
          </span>
          <p className="text-[11px] leading-snug text-neutral-600">
            <span className="font-semibold text-[#0A1F1B]">Home visits</span>
            {" · "}
            Audiologist care at your door, plus aided audiometry, free-field
            testing and annual aftercare at the clinic.
          </p>
        </div>

        <div className="mt-auto w-full border-t border-neutral-200 pt-4 text-[11px] text-neutral-500">
          <p className="font-medium text-[#0A1F1B]">hearinghope.in</p>
          <p className="mt-1">
            Rohini · Green Park · Indirapuram · Sanjay Nagar · Gurgaon · Noida
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

// Each source SVG frames its device low in the canvas by a different amount, so
// object-contain alone leaves the row visibly staggered. These are the measured
// upward nudges (px, against a 126px tile) that optically centre each one.
// Re-measure if the artwork in public/types is replaced.
const TYPE_ART_NUDGE_PX: Record<
  (typeof HEARING_AID_TYPES)[number]["code"],
  number
> = {
  BTE: 16,
  RIC: 17,
  CIC: 25,
  IIC: 19,
  ITE: 5,
  ITC: 13,
};

export function HearingAidTypesPage() {
  return (
    <GuidePage
      title="Types of hearing aids"
      standfirst="Six common styles used in clinic. The right choice depends on hearing loss, ear anatomy, and how discreet or easy to handle the aid should be."
    >
      <div className="mt-5 grid min-h-0 flex-1 grid-cols-2 grid-rows-3 gap-3">
        {HEARING_AID_TYPES.map((item) => (
          <article
            key={item.code}
            className="flex break-inside-avoid items-center gap-3 rounded-2xl border border-neutral-200 bg-[#F4FBF9] px-3 py-2.5"
          >
            <div className="flex h-[126px] w-[112px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-neutral-200">
              <img
                src={`/types/${item.code.toLowerCase()}.svg`}
                alt={`${DEVICE_TYPE_LABELS[item.code]} hearing aid`}
                className="h-full w-full object-contain"
                style={{
                  transform: `translateY(-${TYPE_ART_NUDGE_PX[item.code]}px)`,
                }}
              />
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
    </GuidePage>
  );
}

const AUDIOGRAM_FREQS = [125, 250, 500, 1000, 2000, 4000, 8000];
const AUDIOGRAM_DB_TICKS = [
  -10, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120,
];

/** Plot box inside the chart viewBox, plus the dB range mapped onto it. */
const PLOT = {
  left: 64,
  right: 520,
  top: 36,
  bottom: 430,
  dbMin: -10,
  dbMax: 120,
};

/** Frequency axis is one octave per step, so position is log2 of the ratio. */
function audiogramX(freq: number) {
  const step = (PLOT.right - PLOT.left) / (AUDIOGRAM_FREQS.length - 1);
  return PLOT.left + Math.log2(freq / AUDIOGRAM_FREQS[0]) * step;
}

function audiogramY(db: number) {
  return (
    PLOT.top +
    ((db - PLOT.dbMin) * (PLOT.bottom - PLOT.top)) / (PLOT.dbMax - PLOT.dbMin)
  );
}

const LOSS_BANDS = [
  {
    label: "Normal",
    range: "−10 to 25 dB",
    from: -10,
    to: 25,
    fill: "#E6F6F1",
    key: "#18AD8D",
    meaning: "Soft speech and everyday sounds are heard comfortably.",
  },
  {
    label: "Mild",
    range: "26 to 40 dB",
    from: 25,
    to: 40,
    fill: "#EDF6E0",
    key: "#8CBF3F",
    meaning: "Soft consonants slip away, especially in background noise.",
  },
  {
    label: "Moderate",
    range: "41 to 55 dB",
    from: 40,
    to: 55,
    fill: "#FDF3E0",
    key: "#E8A33D",
    meaning: "Normal conversation is hard to follow without amplification.",
  },
  {
    label: "Moderately severe",
    range: "56 to 70 dB",
    from: 55,
    to: 70,
    fill: "#FCE8D8",
    key: "#FF6503",
    meaning: "Speech has to be loud; group conversation becomes difficult.",
  },
  {
    label: "Severe",
    range: "71 to 90 dB",
    from: 70,
    to: 90,
    fill: "#F9DED4",
    key: "#E4491F",
    meaning: "Only shouted or amplified speech is heard; aids are essential.",
  },
  {
    label: "Profound",
    range: "91 dB and above",
    from: 90,
    to: 120,
    fill: "#F3D8D8",
    key: "#C0392B",
    meaning: "Powerful aids or implants are used alongside visual cues.",
  },
];

/** Upper and lower edge of the speech banana, in dB, per octave. */
const SPEECH_BANANA = [
  { freq: 250, top: 20, bottom: 50 },
  { freq: 500, top: 15, bottom: 50 },
  { freq: 1000, top: 20, bottom: 50 },
  { freq: 2000, top: 25, bottom: 55 },
  { freq: 4000, top: 30, bottom: 60 },
  { freq: 8000, top: 35, bottom: 60 },
];

const SPEECH_SOUNDS = [
  { sound: "m", freq: 250, db: 35 },
  { sound: "n", freq: 300, db: 32 },
  { sound: "u", freq: 350, db: 28 },
  { sound: "d", freq: 420, db: 41 },
  { sound: "b", freq: 540, db: 43 },
  { sound: "a", freq: 700, db: 38 },
  { sound: "l", freq: 900, db: 32 },
  { sound: "e", freq: 1200, db: 35 },
  { sound: "r", freq: 1500, db: 40 },
  { sound: "p", freq: 1800, db: 47 },
  { sound: "k", freq: 2200, db: 45 },
  { sound: "sh", freq: 2700, db: 42 },
  { sound: "f", freq: 3400, db: 47 },
  { sound: "s", freq: 4600, db: 43 },
  { sound: "th", freq: 5800, db: 40 },
];

const AUDIOGRAM_TIPS = [
  "Pitch runs left to right: low rumbles on the left, high hisses on the right.",
  "Loudness runs top to bottom. The lower a mark sits, the louder that sound must be before you hear it.",
  "O marks the right ear and X marks the left ear, usually printed in red and blue.",
  "Marks inside the shaded band mean speech is audible; marks below it mean those sounds are being missed.",
  "High pitches normally fade first, so s, f, th and sh are the earliest sounds to disappear.",
  "Each ear is tested on its own, so the two lines can look quite different from each other.",
];

/** Smooth cubic segments through a set of points, for the banana outline. */
function curveThrough(points: { x: number; y: number }[]) {
  let path = "";
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const midX = ((previous.x + current.x) / 2).toFixed(1);
    path += ` C ${midX} ${previous.y.toFixed(1)}, ${midX} ${current.y.toFixed(
      1,
    )}, ${current.x.toFixed(1)} ${current.y.toFixed(1)}`;
  }
  return path;
}

function speechBananaPath() {
  const upper = SPEECH_BANANA.map((point) => ({
    x: audiogramX(point.freq),
    y: audiogramY(point.top),
  }));
  const lower = [...SPEECH_BANANA].reverse().map((point) => ({
    x: audiogramX(point.freq),
    y: audiogramY(point.bottom),
  }));
  return [
    `M ${upper[0].x.toFixed(1)} ${upper[0].y.toFixed(1)}`,
    curveThrough(upper),
    ` L ${lower[0].x.toFixed(1)} ${lower[0].y.toFixed(1)}`,
    curveThrough(lower),
    " Z",
  ].join("");
}

function AudiogramChart() {
  const plotWidth = PLOT.right - PLOT.left;
  const axisMidY = (PLOT.top + PLOT.bottom) / 2;

  return (
    <svg
      viewBox="0 0 700 452"
      className="h-auto w-full"
      role="img"
      aria-label="Audiogram showing hearing loss ranges and the speech banana"
    >
      {LOSS_BANDS.map((band) => {
        const top = audiogramY(band.from);
        const height = audiogramY(band.to) - top;
        const midY = top + height / 2;
        return (
          <g key={band.label}>
            <rect
              x={PLOT.left}
              y={top}
              width={plotWidth}
              height={height}
              fill={band.fill}
            />
            <rect
              x={PLOT.right + 13}
              y={midY - 10}
              width={9}
              height={9}
              rx={2}
              fill={band.key}
            />
            <text
              x={PLOT.right + 28}
              y={midY - 1.5}
              fontSize="10.5"
              fontWeight="600"
              fill="#0A1F1B"
            >
              {band.label}
            </text>
            <text x={PLOT.right + 28} y={midY + 11} fontSize="9" fill="#8A9794">
              {band.range}
            </text>
          </g>
        );
      })}

      {AUDIOGRAM_DB_TICKS.map((db) => (
        <line
          key={`h-${db}`}
          x1={PLOT.left}
          x2={PLOT.right}
          y1={audiogramY(db)}
          y2={audiogramY(db)}
          stroke="#0A1F1B"
          strokeOpacity={db % 20 === 0 ? 0.18 : 0.08}
          strokeWidth="0.8"
        />
      ))}

      {AUDIOGRAM_FREQS.map((freq) => (
        <line
          key={`v-${freq}`}
          x1={audiogramX(freq)}
          x2={audiogramX(freq)}
          y1={PLOT.top}
          y2={PLOT.bottom}
          stroke="#0A1F1B"
          strokeOpacity="0.15"
          strokeWidth="0.8"
        />
      ))}

      <path
        d={speechBananaPath()}
        fill="#18AD8D"
        fillOpacity="0.24"
        stroke="#0F7A64"
        strokeOpacity="0.75"
        strokeWidth="1.6"
        strokeDasharray="5 3"
      />

      {SPEECH_SOUNDS.map((item) => (
        <text
          key={item.sound}
          x={audiogramX(item.freq)}
          y={audiogramY(item.db)}
          textAnchor="middle"
          fontSize="11.5"
          fontWeight="700"
          fill="#0A1F1B"
          fillOpacity="0.78"
        >
          {item.sound}
        </text>
      ))}

      <rect
        x={PLOT.left}
        y={PLOT.top}
        width={plotWidth}
        height={PLOT.bottom - PLOT.top}
        fill="none"
        stroke="#0A1F1B"
        strokeOpacity="0.38"
        strokeWidth="1.2"
      />

      {AUDIOGRAM_FREQS.map((freq) => (
        <text
          key={`fl-${freq}`}
          x={audiogramX(freq)}
          y={PLOT.top - 9}
          textAnchor="middle"
          fontSize="9.5"
          fontWeight="600"
          fill="#0A1F1B"
        >
          {freq >= 1000 ? `${freq / 1000}k` : freq}
        </text>
      ))}

      {AUDIOGRAM_DB_TICKS.map((db) => (
        <text
          key={`dl-${db}`}
          x={PLOT.left - 9}
          y={audiogramY(db) + 3.2}
          textAnchor="end"
          fontSize="9"
          fill="#6B7A77"
        >
          {db}
        </text>
      ))}

      <text
        x={PLOT.left}
        y={15}
        fontSize="8.5"
        fontWeight="700"
        fill="#FF6503"
        letterSpacing="1.3"
      >
        FREQUENCY IN Hz — PITCH
      </text>
      <text
        x={20}
        y={axisMidY}
        transform={`rotate(-90 20 ${axisMidY})`}
        textAnchor="middle"
        fontSize="8.5"
        fontWeight="700"
        fill="#FF6503"
        letterSpacing="1.3"
      >
        HEARING LEVEL IN dB — LOUDNESS
      </text>
    </svg>
  );
}

export function AudiogramPage() {
  return (
    <GuidePage
      title="Reading your audiogram"
      standfirst="An audiogram records the softest sound you can hear at each pitch. The shaded band is the speech banana — the region where the sounds of ordinary conversation sit. Thresholds that fall below it are the sounds being missed."
    >
      <>
        <div className="mt-4 rounded-2xl border border-neutral-200 bg-white px-3 pt-2 pb-2.5">
          <AudiogramChart />
          <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-neutral-100 pt-2 text-[9.5px] text-neutral-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-4 rounded-sm border border-[#0F7A64]/70 bg-[#18AD8D]/25" />
              Speech banana
            </span>
            <span>
              <span className="font-semibold text-[#0A1F1B]">O</span> right ear
              · <span className="font-semibold text-[#0A1F1B]">X</span> left ear
            </span>
            <span>Letters mark where each speech sound falls</span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {LOSS_BANDS.map((band) => (
            <div
              key={band.label}
              className="break-inside-avoid rounded-xl border border-neutral-200 px-2.5 py-2"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: band.key }}
                />
                <p className="text-[10.5px] leading-tight font-semibold text-[#0A1F1B]">
                  {band.label}
                </p>
              </div>
              <p className="mt-0.5 text-[9px] font-medium text-[#18AD8D]">
                {band.range}
              </p>
              <p className="mt-1 text-[9px] leading-snug text-neutral-500">
                {band.meaning}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-2xl bg-[#F4FBF9] px-4 py-3">
          <SectionLabel>How to read the chart</SectionLabel>
          <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5">
            {AUDIOGRAM_TIPS.map((tip, index) => (
              <p
                key={tip}
                className="flex gap-2 text-[9.5px] leading-snug text-neutral-600"
              >
                <StepNumber>{index + 1}</StepNumber>
                {tip}
              </p>
            ))}
          </div>
          <p className="mt-2.5 border-t border-[#18AD8D]/20 pt-2 text-[9.5px] leading-snug text-neutral-600">
            <span className="font-semibold text-[#0A1F1B]">Clinic tip:</span>{" "}
            bring your audiogram to the appointment. The shape of the loss, not
            just its depth, decides which style and power level will suit you
            best.
          </p>
        </div>
      </>
    </GuidePage>
  );
}

const COLUMN_NOTES = [
  {
    term: "#",
    detail: "Row number within the brand, so a model is quick to quote.",
  },
  {
    term: "Product",
    detail: "Model name, with the variant or fitting note printed underneath.",
  },
  {
    term: "Type",
    detail: "Style of aid. The six codes are set out on page 2.",
  },
  {
    term: "Channels / Bands",
    detail: "How many frequency bands the processor shapes independently.",
  },
  {
    term: "Unit",
    detail:
      "Single is one aid. Pair or Kit is two aids, usually with a charger.",
  },
  {
    term: "Warranty (Yrs)",
    detail: "Manufacturer cover in years, which varies by model.",
  },
];

/** Naming ladders are editorial; the channel range beside them comes from the data. */
const TECHNOLOGY_TIERS: Record<string, string> = {
  Signia:
    "1IX/1AX → 7IX/7AX (also Fast/Fun/Run/Prompt/Intuis value lines)",
  Phonak: "30 → 50 → 70 → 90 (Sphere Infinio at the top)",
  Bernafon: "Alpha/Encanta 1 → 9 and 100 → 400",
  ReSound: "Key/Savi → OMNIA → Nexia/Vivia, tiers 2/3/4/5/7/9",
  Widex: "110 → 220 → 330 → 440 (Magnify/Enjoy 30 → 100)",
  Unitron: "1 → 3 → 5 → 7 → 9 (Ativo entry)",
};

const WORTH_KNOWING = [
  {
    title: "Rechargeable or battery",
    detail:
      "A rechargeable aid docks overnight and runs the day. Zinc-air cells suit anyone who would rather swap a battery than remember to charge.",
  },
  {
    title: "Telecoil (T)",
    detail:
      "A telecoil picks up the induction loop fitted in halls, ticket counters and places of worship, so speech arrives without the room noise.",
  },
  {
    title: "CROS and BiCROS",
    detail:
      "For single-sided deafness. A transmitter worn on the unaidable ear sends sound across to an aid on the better ear.",
  },
  {
    title: "Custom shells",
    detail:
      "ITE, ITC, CIC and IIC are built from an ear impression, so the lead time is longer than for a stock RIC or BTE.",
  },
];

function priceLabel(value: number | null) {
  return value == null ? "—" : formatInr(value);
}

function rangeLabel(range: Range | null) {
  if (!range) return "—";
  if (range.from === range.to) return formatInr(range.from);
  return `${formatInr(range.from)} – ${formatInr(range.to)}`;
}

const tableHeadClass =
  "bg-[#0A1F1B] text-left text-[8px] font-semibold tracking-[0.12em] text-white uppercase";

function rowClass(index: number) {
  return `break-inside-avoid ${index % 2 === 0 ? "bg-white" : "bg-[#F4FBF9]"}`;
}

export function PriceGuidePage({
  brands,
  products,
}: {
  brands: string[];
  products: HearingAid[];
}) {
  const summary = summariseAidsByBrand(brands, products);

  return (
    <GuidePage
      title="How to read this price list"
      standfirst="The pages that follow list every model by brand. This page explains the columns and what separates one technology tier from the next."
    >
      <>
        <div className="mt-4">
          <SectionLabel>What the columns mean</SectionLabel>
          <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1">
            {COLUMN_NOTES.map((note) => (
              <div
                key={note.term}
                className="flex gap-2 text-[9.5px] leading-snug text-neutral-600"
              >
                <dt className="w-[74px] shrink-0 font-semibold text-[#0A1F1B]">
                  {note.term}
                </dt>
                <dd>{note.detail}</dd>
              </div>
            ))}
            <div className="col-span-2 mt-1 flex items-center gap-4 border-t border-neutral-200 pt-1.5 text-[9.5px] leading-snug text-neutral-600">
              <span className="inline-flex items-center gap-1.5">
                <FeatureMark
                  active
                  label="Rechargeable"
                  Icon={BatteryCharging}
                  tone="teal"
                />
                <span>
                  <span className="font-semibold text-[#0A1F1B]">Teal</span>{" "}
                  badge — rechargeable
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FeatureMark
                  active
                  label="Bluetooth"
                  Icon={Bluetooth}
                  tone="orange"
                />
                <span>
                  <span className="font-semibold text-[#0A1F1B]">Orange</span>{" "}
                  badge — Bluetooth streaming
                </span>
              </span>
              <span className="text-neutral-400">
                A greyed badge means the model does not offer that feature.
              </span>
            </div>
          </dl>
        </div>

        <div className="mt-4">
          <SectionLabel>Technology levels</SectionLabel>
          <div className="mt-2 overflow-hidden rounded-lg border border-neutral-200">
            <table className="w-full table-fixed border-collapse text-[10px]">
              <thead>
                <tr className={tableHeadClass}>
                  <th className="w-[74px] py-1 pr-2 pl-2 font-semibold">
                    Brand
                  </th>
                  <th className="py-1 pr-2 font-semibold">
                    Entry → Premium naming
                  </th>
                  <th className="w-[78px] py-1 pr-2 text-center font-semibold">
                    Channels
                  </th>
                </tr>
              </thead>
              <tbody>
                {summary
                  .filter((row) => TECHNOLOGY_TIERS[row.brand])
                  .map((row, index) => (
                    <tr key={row.brand} className={rowClass(index)}>
                      <td className="py-1 pr-2 pl-2 font-semibold text-[#0A1F1B]">
                        {row.brand}
                      </td>
                      <td className="py-1 pr-2 leading-snug text-neutral-600">
                        {TECHNOLOGY_TIERS[row.brand]}
                      </td>
                      <td className="py-1 pr-2 text-center font-semibold tabular-nums text-[#0A1F1B]">
                        {row.channels
                          ? `${row.channels.from}–${row.channels.to}`
                          : "—"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 rounded-2xl bg-[#F4FBF9] px-4 py-2.5 text-[9.5px] leading-snug text-neutral-600">
            <span className="font-semibold text-[#0A1F1B]">
              More channels does not mean louder.
            </span>{" "}
            Extra channels and bands improve clarity of speech in noise and how
            precisely the aid steers towards the person in front of you. Loudness
            capability is a separate matter, set by the fitting range in dB and
            by the receiver or power level — M, P, SP or UP.
          </p>
        </div>

        <div className="mt-4">
          <SectionLabel>Other things worth knowing</SectionLabel>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {WORTH_KNOWING.map((item) => (
              <div
                key={item.title}
                className="break-inside-avoid rounded-xl border border-neutral-200 px-2.5 py-2"
              >
                <p className="text-[10.5px] leading-tight font-semibold text-[#0A1F1B]">
                  {item.title}
                </p>
                <p className="mt-1 text-[9px] leading-snug text-neutral-500">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <SectionLabel>Price at a glance</SectionLabel>
          <div className="mt-2 overflow-hidden rounded-lg border border-neutral-200">
            <table className="w-full table-fixed border-collapse text-[10px]">
              <thead>
                <tr className={tableHeadClass}>
                  <th className="w-[26%] py-1 pr-2 pl-2 font-semibold">Brand</th>
                  <th className="w-[16%] py-1 pr-2 text-center font-semibold">
                    Models
                  </th>
                  <th className="py-1 pr-2 text-right font-semibold">
                    Single aid from
                  </th>
                  <th className="py-1 pr-3 text-right font-semibold">
                    Premium up to
                  </th>
                </tr>
              </thead>
              <tbody>
                {summary.map((row, index) => (
                  <tr key={row.brand} className={rowClass(index)}>
                    <td className="py-1 pr-2 pl-2 font-semibold text-[#0A1F1B]">
                      {row.brand}
                    </td>
                    <td className="py-1 pr-2 text-center tabular-nums text-neutral-600">
                      {row.models}
                    </td>
                    <td className="py-1 pr-2 text-right font-semibold tabular-nums text-[#0A1F1B]">
                      {priceLabel(row.singleFrom)}
                    </td>
                    <td className="py-1 pr-3 text-right font-semibold tabular-nums text-[#FF6503]">
                      {priceLabel(row.premiumUpTo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-3 text-[8.5px] leading-tight text-neutral-400">
          Prices are MRP for a single aid unless the row is marked Pair or Kit.
          Earmoulds, custom shells, receivers, chargers and consumables are
          priced separately. Clinic offers and schemes may apply.
        </p>
      </>
    </GuidePage>
  );
}

const FITTING_STEPS = [
  "Hearing test and case history at any Hearing Hope clinic.",
  "Counselling: style, power level and technology tier matched to your audiogram and lifestyle.",
  "Demonstration or trial so you hear the difference before you commit.",
  "Fitting with real-ear verification and first-fit programming.",
  "Follow-up fine-tuning in the first weeks as you adapt.",
  "Annual check, cleaning and re-programming as hearing changes.",
];

const CARE_TIPS = [
  "Use a dry box, or a drying charger, every night.",
  "Clean domes and wax filters weekly.",
  "Keep the aids away from hairspray and steam.",
  "Take them out to shower or swim unless the model is rated IP68.",
];

const COMMON_QUESTIONS = [
  {
    question: "Should I get one aid or two?",
    answer:
      "Both ears, if both have a loss — two aids restore spatial hearing and make speech far easier to pick out of noise.",
  },
  {
    question: "How long will they last?",
    answer: "Typically 4–6 years of daily use before replacement.",
  },
  {
    question: "How long until they feel normal?",
    answer:
      "A few weeks. The brain adapts gradually, so wear them daily rather than only in difficult situations.",
  },
  {
    question: "Can I try before buying?",
    answer: "Yes — ask about a demonstration at your clinic.",
  },
];

export function FittingJourneyPage({
  brands,
  products,
}: {
  brands: string[];
  products: HearingAid[];
}) {
  const accessories = summariseAccessoriesByBrand(brands, products);
  const warranty = warrantyRange(products);
  const warrantyLabel = !warranty
    ? "The manufacturer warranty"
    : warranty.from === warranty.to
      ? `The manufacturer warranty runs ${warranty.from} ${warranty.from === 1 ? "year" : "years"}`
      : `The manufacturer warranty runs ${warranty.from} to ${warranty.to} years`;

  return (
    <GuidePage
      title="Your fitting journey and aftercare"
      standfirst="The price is one part of the decision. This page covers everything that happens around it — how a fitting works, what the warranty holds, and what it costs to keep an aid running."
    >
      <>
        <div className="mt-4 rounded-2xl bg-[#F4FBF9] px-4 py-3">
          <SectionLabel>Six steps</SectionLabel>
          <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5">
            {FITTING_STEPS.map((step, index) => (
              <p
                key={step}
                className="flex gap-2 text-[9.5px] leading-snug text-neutral-600"
              >
                <StepNumber>{index + 1}</StepNumber>
                {step}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <SectionLabel>What the warranty holds</SectionLabel>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="break-inside-avoid rounded-xl border border-[#18AD8D]/30 bg-[#18AD8D]/8 px-3 py-2">
              <p className="text-[10.5px] leading-tight font-semibold text-[#0A1F1B]">
                Covered by warranty
              </p>
              <p className="mt-1 text-[9px] leading-snug text-neutral-600">
                {warrantyLabel} depending on the model, as printed in the
                Warranty column beside each aid. It covers manufacturing defects
                and failure of the electronics, repaired or replaced by the
                manufacturer.
              </p>
            </div>
            <div className="break-inside-avoid rounded-xl border border-[#FF6503]/30 bg-[#FF6503]/8 px-3 py-2">
              <p className="text-[10.5px] leading-tight font-semibold text-[#0A1F1B]">
                Not covered
              </p>
              <p className="mt-1 text-[9px] leading-snug text-neutral-600">
                Loss, physical damage, moisture damage, and consumables — domes,
                wax filters, tubes and earmoulds. Chargers, receivers and CROS
                transmitters carry their own shorter warranty, usually one year.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <SectionLabel>Consumables and accessories</SectionLabel>
          <div className="mt-2 overflow-hidden rounded-lg border border-neutral-200">
            <table className="w-full table-fixed border-collapse text-[10px]">
              <thead>
                <tr className={tableHeadClass}>
                  <th className="w-[26%] py-1 pr-2 pl-2 font-semibold">Brand</th>
                  <th className="py-1 pr-2 text-right font-semibold">
                    Receivers
                  </th>
                  <th className="py-1 pr-3 text-right font-semibold">
                    Chargers
                  </th>
                </tr>
              </thead>
              <tbody>
                {accessories.map((row, index) => (
                  <tr key={row.brand} className={rowClass(index)}>
                    <td className="py-1 pr-2 pl-2 font-semibold text-[#0A1F1B]">
                      {row.brand}
                    </td>
                    <td className="py-1 pr-2 text-right font-semibold tabular-nums text-[#0A1F1B]">
                      {rangeLabel(row.receivers)}
                    </td>
                    <td className="py-1 pr-3 text-right font-semibold tabular-nums text-[#0A1F1B]">
                      {rangeLabel(row.chargers)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-1.5 text-[9px] leading-snug text-neutral-500">
            Domes, wax filters and tubes are low-cost items, replaced as a matter
            of course at routine visits. A dash means the brand supplies no
            separately priced part in that category.
          </p>
        </div>

        <div className="mt-4">
          <SectionLabel>Care</SectionLabel>
          <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1">
            {CARE_TIPS.map((tip) => (
              <p
                key={tip}
                className="flex gap-2 text-[9.5px] leading-snug text-neutral-600"
              >
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#FF6503]" />
                {tip}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <SectionLabel>Common questions</SectionLabel>
          <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5">
            {COMMON_QUESTIONS.map((item) => (
              <p
                key={item.question}
                className="text-[9.5px] leading-snug text-neutral-600"
              >
                <span className="font-semibold text-[#0A1F1B]">
                  {item.question}
                </span>{" "}
                {item.answer}
              </p>
            ))}
          </div>
        </div>

        <p className="mt-3 text-[9.5px] leading-snug text-neutral-600">
          <span className="font-semibold text-[#0A1F1B]">Where to go:</span> all
          six Hearing Hope clinics are listed on the following page. Walk in for
          a test, a demonstration, or a service visit.
        </p>
      </>
    </GuidePage>
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
