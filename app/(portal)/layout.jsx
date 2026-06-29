/* Portal document shell — independent of the marketing site's next-intl layout.
   English-only internal tool. No locale provider. */
export const metadata = {
  title: "AgeWell Patient Intake Portal",
  robots: { index: false, follow: false }, // never index an internal PHI tool
};

export default function PortalRootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          background: "#f4f6f8",
          color: "#1a1f24",
        }}
      >
        {children}
      </body>
    </html>
  );
}
