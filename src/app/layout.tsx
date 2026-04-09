import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { auth } from "@/auth";
import { Providers } from "@/app/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "МОСКАСТИНГ — кастинги в Москве",
  description: "Платформа кастингов для кино, рекламы и ТВ",
};

/** Клавиатура на Android Chrome пересчитывает layout; меньше артефактов с пустотой под полем ввода. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="ru" className={inter.variable}>
      <body className="flex min-h-screen flex-col font-sans">
        <Providers session={session}>
          <SiteHeader />
          <main className="mx-auto flex w-full min-h-0 min-w-0 max-w-6xl flex-1 flex-col px-3 py-5 sm:px-4 sm:py-6 md:py-8">
            {children}
          </main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
