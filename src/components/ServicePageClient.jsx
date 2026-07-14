"use client";
/* ============================================================
   COMPASS AGEWELL — Service page client shell
   Wraps a service detail page in the same Header/Footer/ContactBar
   chrome as the homepage, plus a breadcrumb, then renders the 8
   shared service sections. Mirrors BlogChrome.

   All three services use the green accent (per BD's shipped
   designs), so we set the same accent tokens as the rest of the
   site — no per-page override needed.
   ============================================================ */
import { useEffect } from "react";
import { Header, MobileAnchor } from "../sections/sections-a.jsx";
import { Footer, ContactBar, SignupForm } from "../sections/sections-b.jsx";
import { Breadcrumb } from "./Breadcrumb.jsx";
import {
  ServiceHero,
  ServiceWhatIs,
  ServiceWhoFor,
  ServiceSteps,
  ServiceBenefits,
  ServiceCost,
  ServiceFaq,
  ServiceRelated,
} from "../sections/service-detail.jsx";

export default function ServicePageClient({ C, lang, service }) {
  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty("--accent", "#26a146");
    r.setProperty("--accent-d", "#1c7d36");
    r.setProperty("--accent-soft", "#ecf3e0");
    r.setProperty("--fs-base", "19px");
  }, []);

  // Breadcrumb: Trang chủ → Dịch vụ → <current service>. The "Services"
  // crumb points at the homepage services section; labels are localized.
  const homeLabel = lang === "en" ? "Home" : "Trang chủ";
  const servicesLabel = lang === "en" ? "Services" : "Dịch vụ";
  const crumbs = [
    { label: homeLabel, href: "/" },
    { label: servicesLabel, href: "/#dichvu" },
    { label: service.breadcrumbLabel },
  ];

  return (
    <>
      <Header t={C} lang={lang} />
      <MobileAnchor t={C} />
      <main className="lang-fade">
        <div className="container">
          <Breadcrumb items={crumbs} />
        </div>
        <ServiceHero s={service} hotline={C.hotline} />
        <ServiceWhatIs s={service} />
        <ServiceWhoFor s={service} />
        <ServiceSteps s={service} />
        <ServiceBenefits s={service} />
        <ServiceCost s={service} />
        <ServiceFaq s={service} />
        <ServiceRelated s={service} />
        {/* Signup form at the very bottom — page CTAs scroll here (#dangky). */}
        <SignupForm t={C} />
      </main>
      <Footer t={C} lang={lang} />
      <ContactBar t={C} />
    </>
  );
}
