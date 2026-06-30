/* ============================================================
   App-layer field encryption — AES-256-GCM (Node built-in crypto, zero deps).

   Used for the highest-sensitivity columns (Medicare MBI, DOB) and the TOTP
   secret. Keeps plaintext PHI out of the SQL/query-log surface, on top of disk
   encryption. Stored format: base64(iv).base64(authTag).base64(ciphertext).

   ⚠️ Local-first: keyed by PHI_ENC_KEY (32-byte base64) from env. Production
   replaces this static key with an AWS KMS CMK + envelope encryption (deferred).
   ============================================================ */
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

const ALGO = "aes-256-gcm";
const IV_LEN = 12; // 96-bit nonce, standard for GCM

let cachedKey = null;

function getKey() {
  if (cachedKey) return cachedKey;
  const raw = process.env.PHI_ENC_KEY;
  if (!raw) {
    throw new Error(
      "PHI_ENC_KEY is not set. Add it to .env.local (openssl rand -base64 32)."
    );
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error(
      `PHI_ENC_KEY must decode to 32 bytes (got ${key.length}). Regenerate with openssl rand -base64 32.`
    );
  }
  cachedKey = key;
  return key;
}

/**
 * Encrypt a plaintext string. Returns iv.tag.ciphertext (all base64), or null
 * for null/undefined input (so optional fields stay null).
 */
export function encryptField(plaintext) {
  if (plaintext == null || plaintext === "") return null;
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, getKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(String(plaintext), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${ciphertext.toString(
    "base64"
  )}`;
}

/**
 * Decrypt a value produced by encryptField. Returns null for null input.
 * Throws if the value is malformed or the auth tag fails (tamper detection).
 */
export function decryptField(stored) {
  if (stored == null || stored === "") return null;
  const parts = String(stored).split(".");
  if (parts.length !== 3) {
    throw new Error("Malformed ciphertext (expected iv.tag.ciphertext).");
  }
  const [ivB64, tagB64, dataB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const data = Buffer.from(dataB64, "base64");
  const decipher = createDecipheriv(ALGO, getKey(), iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(data), decipher.final()]);
  return plaintext.toString("utf8");
}

/** Mask a sensitive value for display/audit (e.g. MBI -> ••••1234). */
export function maskTail(plaintext, visible = 4) {
  if (!plaintext) return "";
  const s = String(plaintext);
  if (s.length <= visible) return "•".repeat(s.length);
  return "•".repeat(s.length - visible) + s.slice(-visible);
}
