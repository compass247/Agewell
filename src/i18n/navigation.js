import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing.js";

// Locale-aware wrappers. Use these instead of next/link & next/navigation so
// the active locale prefix (/vi, /en) is handled automatically — e.g. the
// language toggle does router.replace(pathname, { locale }) to swap VI<->EN.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
