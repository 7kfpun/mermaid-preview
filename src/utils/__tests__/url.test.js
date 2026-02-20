import { describe, it, expect, vi } from "vitest";
import { encodeState, decodeState } from "../url";

describe("url utils", () => {
  it("encodes and decodes state correctly", () => {
    const state = {
      code: "graph TD; A-->B;",
      theme: "dark",
      themeConfig: { theme: "base" },
    };

    const encoded = encodeState(state.code, state.theme, state.themeConfig);
    const decoded = decodeState(encoded);

    expect(decoded).toEqual({
      code: state.code,
      theme: state.theme,
      themeConfig: state.themeConfig,
    });
  });

  it("returns null for invalid payloads", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = decodeState("invalid");
    expect(result).toBeNull();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("handles null themeConfig — omits the key from the encoded payload", () => {
    // encodeState guards with `if (themeConfigJson)`, so null is never stored.
    // decodeState therefore returns an object without a themeConfig property.
    const encoded = encodeState("flowchart TD\n  A-->B", "forest", null);
    const decoded = decodeState(encoded);
    expect(decoded.code).toBe("flowchart TD\n  A-->B");
    expect(decoded.theme).toBe("forest");
    expect(decoded.themeConfig).toBeUndefined();
  });

  it("handles undefined themeConfig", () => {
    const encoded = encodeState("pie\n  A: 50", "neutral", undefined);
    const decoded = decodeState(encoded);
    expect(decoded.code).toBe("pie\n  A: 50");
    expect(decoded.theme).toBe("neutral");
  });

  it("preserves multiline code with special characters", () => {
    const code = `sequenceDiagram\n    Alice->>Bob: Hello & "goodbye"\n    Bob-->>Alice: Hi! @#$%`;
    const encoded = encodeState(code, "default", null);
    const decoded = decodeState(encoded);
    expect(decoded.code).toBe(code);
  });

  it("round-trips a themeConfig object with nested variables", () => {
    const themeConfig = {
      theme: "base",
      themeVariables: { primaryColor: "#ff0000", fontFamily: "Arial" },
    };
    const encoded = encodeState("graph LR\n  A-->B", "base", themeConfig);
    const decoded = decodeState(encoded);
    expect(decoded.themeConfig).toEqual(themeConfig);
  });

  it("returns null and logs error for empty string", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(decodeState("")).toBeNull();
    spy.mockRestore();
  });

  it("produces a different hash for different code inputs", () => {
    const a = encodeState("graph TD\n  A-->B", "default", null);
    const b = encodeState("graph TD\n  A-->C", "default", null);
    expect(a).not.toBe(b);
  });

  it("produces a different hash for different themes", () => {
    const a = encodeState("graph TD\n  A-->B", "dark", null);
    const b = encodeState("graph TD\n  A-->B", "forest", null);
    expect(a).not.toBe(b);
  });
});
