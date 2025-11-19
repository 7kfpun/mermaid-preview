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
});
