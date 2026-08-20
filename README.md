# Hearing Hope Price List

A printable A4 catalog for [Hearing Hope](https://hearinghope.in/), a speech and hearing clinic in Delhi NCR. The app groups hearing aids by brand, supports clinic editing, and exports a branded PDF.

## Features

- Cover page, brand pages, and a closing page sized for A4 print
- Official Hearing Hope branding plus manufacturer logos
- Add brand pages, choose the manufacturer, and add or edit models
- Multiple device types per model (BTE, RIC, CIC, IIC, ITE, ITC)
- Print / Export PDF via the browser print dialog

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use **Print / Export PDF** and keep background graphics enabled so brand colors print correctly.

Catalog edits are stored in the browser. They are not committed to git.

## Tech stack

- Next.js (App Router)
- Tailwind CSS
- react-to-print
- lucide-react
