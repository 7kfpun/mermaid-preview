import { renderHook, act } from "@testing-library/react";
import { describe, beforeEach, it, expect } from "vitest";
import useUIState from "../useUIState";
import { STORAGE_KEYS } from "../../utils/constants";

describe("useUIState", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("provides default UI values", () => {
    const { result } = renderHook(() => useUIState());

    expect(result.current.isDragging).toBe(false);
    expect(result.current.editorWidth).toBe(50);
    expect(result.current.backgroundColor).toBe("#ffffff");
  });

  it("loads saved divider width and updates state", () => {
    localStorage.setItem(STORAGE_KEYS.DIVIDER_POS, "65");
    const { result } = renderHook(() => useUIState());
    expect(result.current.editorWidth).toBe(65);

    act(() => {
      result.current.setEditorWidth(40);
    });

    expect(result.current.editorWidth).toBe(40);
  });
});
