/* CSV cell encoding: quoting + formula-injection neutralization. */
import { describe, it, expect } from "vitest";
import { csvCell, csvLine } from "../src/lib/phi/csv.js";

describe("csvCell", () => {
  it("passes plain values through", () => {
    expect(csvCell("Nguyen")).toBe("Nguyen");
    expect(csvCell(42)).toBe("42");
    expect(csvCell(null)).toBe("");
    expect(csvCell(undefined)).toBe("");
  });

  it("quotes commas, quotes and newlines", () => {
    expect(csvCell("a,b")).toBe('"a,b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell("line1\nline2")).toBe('"line1\nline2"');
  });

  it("neutralizes formula-injection prefixes", () => {
    expect(csvCell("=1+1")).toBe("'=1+1");
    expect(csvCell("+1")).toBe("'+1");
    expect(csvCell("-1")).toBe("'-1");
    expect(csvCell("@cmd")).toBe("'@cmd");
    expect(csvCell("\tx")).toBe("'\tx");
    expect(csvCell("\rx")).toBe("'\rx");
  });

  it("quotes a neutralized cell that also contains a comma", () => {
    expect(csvCell("=SUM(A1,A2)")).toBe('"\'=SUM(A1,A2)"');
  });

  it("does not touch interior symbols, only leading ones", () => {
    expect(csvCell("a=b")).toBe("a=b");
    expect(csvCell("Mary-Jane")).toBe("Mary-Jane"); // interior '-' untouched
    expect(csvCell("-Jane")).toBe("'-Jane"); // leading '-' neutralized
  });
});

describe("csvLine", () => {
  it("joins encoded cells", () => {
    expect(csvLine(["a", "b,c", "=x"])).toBe('a,"b,c",\'=x');
  });
});
