/* AES-256-GCM field encryption: roundtrip, tamper detection, wrong key, masking. */
import { describe, it, expect, beforeEach, vi } from "vitest";

const KEY_A = Buffer.alloc(32, 7).toString("base64");
const KEY_B = Buffer.alloc(32, 9).toString("base64");

// crypto.js caches the key on first use, so each test loads a fresh module
// copy with the env it needs.
async function loadCrypto(key) {
  vi.resetModules();
  process.env.PHI_ENC_KEY = key;
  return import("../src/lib/phi/crypto.js");
}

describe("encryptField / decryptField", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("roundtrips a value", async () => {
    const { encryptField, decryptField } = await loadCrypto(KEY_A);
    const stored = encryptField("01/31/1950");
    expect(stored).toMatch(/^[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+$/);
    expect(decryptField(stored)).toBe("01/31/1950");
  });

  it("returns null for null/empty input (optional fields stay null)", async () => {
    const { encryptField, decryptField } = await loadCrypto(KEY_A);
    expect(encryptField(null)).toBeNull();
    expect(encryptField("")).toBeNull();
    expect(decryptField(null)).toBeNull();
    expect(decryptField("")).toBeNull();
  });

  it("produces a fresh IV per call (same plaintext ≠ same ciphertext)", async () => {
    const { encryptField } = await loadCrypto(KEY_A);
    expect(encryptField("same")).not.toBe(encryptField("same"));
  });

  it("throws on tampered ciphertext (auth tag mismatch)", async () => {
    const { encryptField, decryptField } = await loadCrypto(KEY_A);
    const stored = encryptField("secret");
    const [iv, tag, data] = stored.split(".");
    const flipped = Buffer.from(data, "base64");
    flipped[0] ^= 0xff;
    const tampered = `${iv}.${tag}.${flipped.toString("base64")}`;
    expect(() => decryptField(tampered)).toThrow();
  });

  it("throws on malformed ciphertext", async () => {
    const { decryptField } = await loadCrypto(KEY_A);
    expect(() => decryptField("not-a-ciphertext")).toThrow(/Malformed/);
  });

  it("throws when decrypting with a different key", async () => {
    const { encryptField } = await loadCrypto(KEY_A);
    const stored = encryptField("secret");
    const { decryptField } = await loadCrypto(KEY_B);
    expect(() => decryptField(stored)).toThrow();
  });

  it("rejects a key that is not 32 bytes", async () => {
    const { encryptField } = await loadCrypto(Buffer.alloc(16, 1).toString("base64"));
    expect(() => encryptField("x")).toThrow(/32 bytes/);
  });
});

describe("maskTail", () => {
  it("masks all but the last 4 by default", async () => {
    const { maskTail } = await loadCrypto(KEY_A);
    expect(maskTail("1EG4TE5MK73")).toBe("•••••••MK73");
    expect(maskTail("abc")).toBe("•••");
    expect(maskTail("")).toBe("");
    expect(maskTail(null)).toBe("");
  });
});
