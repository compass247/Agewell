"use client";
/* ============================================================
   COMPASS AGEWELL — Breadcrumb
   Locale-aware trail for sub-pages: Trang chủ → Dịch vụ → <current>.
   The "Services" crumb points at the homepage services section
   (/#dichvu); the current page is plain (non-link) text.
   ============================================================ */
import { Fragment } from "react";
import { Link } from "../i18n/navigation.js";
import { Icon } from "./icons.jsx";

// items: [{ label, href }] where the LAST item has no href (current page).
export function Breadcrumb({ items }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol>
        {items.map((it, i) => {
          const isLast = i === items.length - 1;
          return (
            <Fragment key={i}>
              <li>
                {it.href && !isLast ? (
                  <Link href={it.href}>{it.label}</Link>
                ) : (
                  <span aria-current={isLast ? "page" : undefined}>{it.label}</span>
                )}
              </li>
              {!isLast && (
                <li className="sep" aria-hidden="true">
                  <Icon name="chevron" size={14} />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
