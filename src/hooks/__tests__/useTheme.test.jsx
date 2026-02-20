import { renderHook, act } from "@testing-library/react";
import { describe, beforeEach, it, expect, vi } from "vitest";
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
    expect(result.current.themeConfig).toBe("");
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

  it("setTheme updates the theme value", () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.setTheme("dark");
    });
    expect(result.current.theme).toBe("dark");
  });

  it("setThemeConfig updates the themeConfig value", () => {
    const { result } = renderHook(() => useTheme());
    const config = '{"theme":"base"}';
    act(() => {
      result.current.setThemeConfig(config);
    });
    expect(result.current.themeConfig).toBe(config);
  });

  it("setShowThemeConfig toggles the showThemeConfig flag", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.showThemeConfig).toBe(false);

    act(() => {
      result.current.setShowThemeConfig(true);
    });
    expect(result.current.showThemeConfig).toBe(true);

    act(() => {
      result.current.setShowThemeConfig(false);
    });
    expect(result.current.showThemeConfig).toBe(false);
  });

  it("toggleDarkMode starts false and toggles to true, persisting to localStorage", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.darkMode).toBe(false);

    act(() => {
      result.current.toggleDarkMode();
    });

    expect(result.current.darkMode).toBe(true);
    expect(localStorage.getItem(STORAGE_KEYS.DARK_MODE)).toBe("true");
  });

  it("toggleDarkMode does not throw when localStorage is unavailable", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useTheme());
    expect(() => {
      act(() => {
        result.current.toggleDarkMode();
      });
    }).not.toThrow();

    spy.mockRestore();
    consoleSpy.mockRestore();
  });
});
