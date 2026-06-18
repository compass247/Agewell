import Link from "next/link";

// Minimal 404. Kept locale-agnostic (the root has no locale segment).
export default function NotFound() {
  return (
    <html lang="vi">
      <body>
        <div
          style={{
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            fontFamily: "'Be Vietnam Pro', system-ui, sans-serif",
            textAlign: "center",
            padding: 24,
          }}
        >
          <h1 style={{ fontSize: 28 }}>404 — Không tìm thấy trang</h1>
          <p style={{ color: "#667" }}>Trang bạn tìm không tồn tại / Page not found.</p>
          <Link href="/vi" style={{ color: "#26a146", fontWeight: 600 }}>
            ← Về trang chủ / Home
          </Link>
        </div>
      </body>
    </html>
  );
}
