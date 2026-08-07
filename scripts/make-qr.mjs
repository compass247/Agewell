/* ============================================================
   COMPASS AGEWELL — QR generator for hand-out links (BD)

   Run by hand: `npm run qr`. Deliberately NOT wired into build:static —
   Cloudflare Pages only runs the build, and regenerating a binary asset on
   every deploy would churn the artifact for no reason.

   The generated files are COMMITTED to git. That is what makes them
   downloadable at https://compassagewell.com/assets/qr-contact-us.png —
   `output: "export"` copies public/** verbatim into out/, and Pages never
   runs this script. Uncommitted => 404.

   Uses the `qrcode` dependency that is already installed (src/lib/phi/totp.js
   uses it for TOTP enrolment). It cannot import SITE_URL from src/seo.js:
   package.json has no "type": "module", so Node would load that .js file as
   CommonJS and choke on its ESM syntax. The base URL is duplicated here on
   purpose — do NOT "fix" this by adding "type": "module", which would
   reclassify every .js file in the repo.

   Usage:
     npm run qr                                   -> /contact-us, brand green
     QR_DARK="#000000ff" npm run qr               -> black, for faint printing
     node scripts/make-qr.mjs <url> <name>        -> any other hand-out link
   ============================================================ */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import QRCode from "qrcode";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://compassagewell.com";

const [urlArg, nameArg] = process.argv.slice(2);

/* Encode the BARE path, not /vi/contact-us/. Two reasons: it is the shortest
   payload (fewest modules => biggest modules => scans best off paper), and it
   survives a future change of default locale, because public/_redirects stays
   the single point of indirection.

   Do NOT upper-case the URL to reach QR "alphanumeric" mode — paths on
   Cloudflare Pages are case-sensitive and /CONTACT-US would 404. */
const url = urlArg || `${SITE_URL}/contact-us`;
const name = nameArg || "contact-us";
const outDir = join(process.cwd(), "public", "assets");

const opts = {
  /* "M" (15%), not "H". The payload is ~37 bytes, which fits QR version 3
     (29x29 modules) at M but needs version 7 (45x45) at H. Fewer, bigger
     modules scan far more reliably off print and off an older phone camera,
     and there is no logo overlay here that would justify H. */
  errorCorrectionLevel: "M",
  /* 4 modules is the spec quiet zone. Shrinking it is the number one cause of
     "the printed QR won't scan". */
  margin: 4,
  /* Brand dark green (--green-d in src/styles.css), ~5.3:1 on white. NOT
     --green #26a146, which is only ~3.3:1 and gets unreliable under poor light
     or ink spread. Override with QR_DARK for a pure-black version. */
  color: { dark: process.env.QR_DARK || "#1c7d36ff", light: "#ffffffff" },
};

mkdirSync(outDir, { recursive: true });

// toFile picks its renderer from the file extension, so no `type` option.
const png = join(outDir, `qr-${name}.png`); // slides, Zalo, Word, email
const svg = join(outDir, `qr-${name}.svg`); // print — vector, scales to any size
await QRCode.toFile(png, url, { ...opts, width: 1024 });
await QRCode.toFile(svg, url, opts);

console.log(`[make-qr] encoded: ${url}`);
console.log(`[make-qr] wrote ${png}`);
console.log(`[make-qr] wrote ${svg}`);
