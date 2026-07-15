/* CMS HTML sanitizer: XSS stripping, link hardening, JSON-LD escaping. */
import { describe, it, expect } from "vitest";
import { sanitizeCmsHtml, jsonLdSafe } from "../src/lib/sanitize.js";

describe("sanitizeCmsHtml", () => {
  it("keeps normal rich text", () => {
    const html = "<h2>Title</h2><p>Hello <strong>world</strong></p><ul><li>a</li></ul>";
    expect(sanitizeCmsHtml(html)).toBe(html);
  });

  it("strips <script> and inline event handlers", () => {
    const out = sanitizeCmsHtml('<p onclick="alert(1)">x</p><script>alert(1)</script>');
    expect(out).not.toMatch(/script/i);
    expect(out).not.toMatch(/onclick/i);
    expect(out).toContain("<p>x</p>");
  });

  it("blocks javascript: URLs but keeps https/mailto/tel", () => {
    expect(sanitizeCmsHtml('<a href="javascript:alert(1)">x</a>')).not.toMatch(/javascript:/i);
    expect(sanitizeCmsHtml('<a href="https://ok.example">x</a>')).toMatch(/https:\/\/ok\.example/);
    expect(sanitizeCmsHtml('<a href="tel:+14081234567">call</a>')).toMatch(/tel:/);
  });

  it("forces rel=noopener noreferrer on links", () => {
    const out = sanitizeCmsHtml('<a href="https://x.example" target="_blank">x</a>');
    expect(out).toMatch(/rel="noopener noreferrer"/);
  });

  it("strips iframes/styles and unknown tags", () => {
    const out = sanitizeCmsHtml('<iframe src="https://evil"></iframe><style>*{}</style><p>ok</p>');
    expect(out).toBe("<p>ok</p>");
  });

  it("handles null/empty input", () => {
    expect(sanitizeCmsHtml(null)).toBe("");
    expect(sanitizeCmsHtml("")).toBe("");
  });
});

describe("jsonLdSafe", () => {
  it("escapes < so CMS strings cannot close the script tag", () => {
    const out = jsonLdSafe({ headline: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("</script>");
    expect(out).toContain("\\u003c/script");
    expect(JSON.parse(out).headline).toBe("</script><script>alert(1)</script>");
  });
});
