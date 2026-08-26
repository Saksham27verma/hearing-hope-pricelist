import type { Metadata } from "next";
import { jakarta } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hearing Hope – Official Pricelist",
  description:
    "Recommended printable A4 price list for Hearing Hope hearing aids.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}
