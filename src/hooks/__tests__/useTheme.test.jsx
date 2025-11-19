import { renderHook, act } from "@testing-library/react";
import { describe, beforeEach, it, expect } from "vitest";
import useTheme from "../useTheme";
import { STORAGE_KEYS } from "../../utils/constants";

describe("useTheme", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns default theme state", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("default");
    expect(result.current.darkMode).toBe(false);
    expect(result.current.showThemeConfig).toBe(false);
  });

  it("reads and persists dark mode preference", () => {
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, "true");
    const { result } = renderHook(() => useTheme());
    expect(result.current.darkMode).toBe(true);

    act(() => {
      result.current.toggleDarkMode();
    });

    expect(result.current.darkMode).toBe(false);
    expect(localStorage.getItem(STORAGE_KEYS.DARK_MODE)).toBe("false");
  });
});
