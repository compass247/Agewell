/* ============================================================
   COMPASS AGEWELL — App root
   ============================================================ */
(function () {
  const { useEffect, useState } = React;

  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "accent": "#26a146",
    "fontSize": 19,
    "showPlaceholders": true,
    "svcLayout": "Viền màu",
    "loopLayout": "Vòng tròn"
  }/*EDITMODE-END*/;

  const ACCENTS = {
    "#26a146": { d: "#1c7d36", soft: "#ecf3e0" },
    "#007bc3": { d: "#0367a3", soft: "#e2f0fb" },
    "#f47d42": { d: "#e0651f", soft: "#fdebe0" },
  };
  const SVC = { "Viền màu": "bordered", "Bóng nổi": "elevated", "Icon bên trái": "horizontal" };
  const LOOP = { "Vòng tròn": "circle", "Hàng ngang": "horizontal", "Dòng thời gian": "vertical" };

  function App() {
    const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
    const [lang, setLang] = useState(() => {
      try { return localStorage.getItem("agewell-lang") || "vi"; } catch (e) { return "vi"; }
    });
    const C = window.AGEWELL_CONTENT[lang];

    useEffect(() => {
      try { localStorage.setItem("agewell-lang", lang); } catch (e) {}
      document.documentElement.lang = lang;
    }, [lang]);

    useEffect(() => {
      const a = ACCENTS[t.accent] || ACCENTS["#26a146"];
      const r = document.documentElement.style;
      r.setProperty("--accent", t.accent);
      r.setProperty("--accent-d", a.d);
      r.setProperty("--accent-soft", a.soft);
      r.setProperty("--fs-base", t.fontSize + "px");
      document.body.classList.toggle("no-ph", !t.showPlaceholders);
    }, [t.accent, t.fontSize, t.showPlaceholders]);

    const svcVariant = SVC[t.svcLayout] || "bordered";
    const loopVariant = LOOP[t.loopLayout] || "circle";

    return (
      <React.Fragment>
        <Header t={C} lang={lang} setLang={setLang} />
        <MobileAnchor t={C} />
        <main key={lang} className="lang-fade">
          <Hero t={C} />
          <Problem t={C} />
          <Services t={C} variant={svcVariant} />
          <CareLoop t={C} variant={loopVariant} />
          <UspTeam t={C} />
          <Eligibility t={C} />
          {/* Testimonials section hidden — chưa có số liệu thật */}
          {/* <Testimonials t={C} /> */}
          <SignupForm t={C} />
        </main>
        <Footer t={C} lang={lang} setLang={setLang} />
        <ContactBar t={C} />

        <TweaksPanel>
          <TweakSection label="Thương hiệu" />
          <TweakColor label="Màu nhấn (CTA & icon)" value={t.accent}
            options={["#26a146", "#007bc3", "#f47d42"]}
            onChange={(v) => setTweak("accent", v)} />
          <TweakSlider label="Cỡ chữ nền" value={t.fontSize} min={17} max={22} step={1} unit="px"
            onChange={(v) => setTweak("fontSize", v)} />
          <TweakToggle label="Hiện ảnh placeholder" value={t.showPlaceholders}
            onChange={(v) => setTweak("showPlaceholders", v)} />

          <TweakSection label="Bố cục phương án" />
          <TweakRadio label="Thẻ dịch vụ — Section 3" value={t.svcLayout}
            options={["Viền màu", "Bóng nổi", "Icon bên trái"]}
            onChange={(v) => setTweak("svcLayout", v)} />
          <TweakRadio label="Vòng lặp chăm sóc — Section 4" value={t.loopLayout}
            options={["Vòng tròn", "Hàng ngang", "Dòng thời gian"]}
            onChange={(v) => setTweak("loopLayout", v)} />
        </TweaksPanel>
      </React.Fragment>
    );
  }

  ReactDOM.createRoot(document.getElementById("app")).render(<App />);
})();
