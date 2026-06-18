import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing.js";

// next-intl per-request config. We don't use message JSON files for editorial
// copy (that comes from content-data.js / Directus). next-intl here just gives
// us the validated active locale and a place for any UI-chrome strings later.
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale)) {
    locale = routing.defaultLocale;
  }
  return { locale, messages: {} };
});
