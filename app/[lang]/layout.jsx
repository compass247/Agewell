import { notFound } from "next/navigation";
import { Be_Vietnam_Pro } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "../../src/i18n/routing.js";

// Vietnamese-safe brand font, self-hosted + optimized by next/font (replaces
// the old Google Fonts <link> from index.html).
const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-be-vietnam",
});

// Pre-render both locales at build time.
export function generateStaticParams() {
  return routing.locales.map((lang) => ({ lang }));
}

export default async function LocaleLayout({ children, params }) {
  const { lang } = await params;
  if (!routing.locales.includes(lang)) notFound();

  // Enable static rendering for this locale.
  setRequestLocale(lang);

  return (
    <html lang={lang} className={beVietnamPro.variable}>
      <body>
        <NextIntlClientProvider locale={lang} messages={{}}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
