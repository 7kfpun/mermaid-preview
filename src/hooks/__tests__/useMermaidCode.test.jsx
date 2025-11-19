import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import useMermaidCode from "../useMermaidCode";

describe("useMermaidCode", () => {
  it("exposes code state setters", () => {
    const { result } = renderHook(() => useMermaidCode());

    expect(result.current.code).toBe("");
    expect(result.current.embedHtml).toBe("");

    act(() => {
      result.current.setCode("graph TD; A-->B;");
      result.current.setEmbedHtml("<div></div>");
    });

    expect(result.current.code).toBe("graph TD; A-->B;");
    expect(result.current.embedHtml).toBe("<div></div>");
  });
});
