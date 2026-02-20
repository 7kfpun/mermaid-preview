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

  it("imageSize defaults to 4096", () => {
    const { result } = renderHook(() => useUIState());
    expect(result.current.imageSize).toBe(4096);
  });

  it("editorHeight defaults to 120", () => {
    const { result } = renderHook(() => useUIState());
    expect(result.current.editorHeight).toBe(120);
  });

  it("scale defaults to 1", () => {
    const { result } = renderHook(() => useUIState());
    expect(result.current.scale).toBe(1);
  });

  it("isLoading defaults to false", () => {
    const { result } = renderHook(() => useUIState());
    expect(result.current.isLoading).toBe(false);
  });

  it("hasManuallyAdjusted defaults to false", () => {
    const { result } = renderHook(() => useUIState());
    expect(result.current.hasManuallyAdjusted).toBe(false);
  });

  it("position defaults to {x:0, y:0}", () => {
    const { result } = renderHook(() => useUIState());
    expect(result.current.position).toEqual({ x: 0, y: 0 });
  });

  it("downloadMenuOpen and copyMenuOpen default to false", () => {
    const { result } = renderHook(() => useUIState());
    expect(result.current.downloadMenuOpen).toBe(false);
    expect(result.current.copyMenuOpen).toBe(false);
  });

  it("showSamples loads true from localStorage", () => {
    localStorage.setItem(STORAGE_KEYS.SHOW_SAMPLES, "true");
    const { result } = renderHook(() => useUIState());
    expect(result.current.showSamples).toBe(true);
  });

  it("showSamples loads false from localStorage", () => {
    localStorage.setItem(STORAGE_KEYS.SHOW_SAMPLES, "false");
    const { result } = renderHook(() => useUIState());
    expect(result.current.showSamples).toBe(false);
  });

  it("showSamples defaults to true on desktop when no localStorage value", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, value: 1024 });
    const { result } = renderHook(() => useUIState());
    expect(result.current.showSamples).toBe(true);
  });

  it("showSamples defaults to false on mobile when no localStorage value", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, value: 375 });
    const { result } = renderHook(() => useUIState());
    expect(result.current.showSamples).toBe(false);
    // Restore
    Object.defineProperty(window, "innerWidth", { writable: true, value: 1024 });
  });

  it("setShowSamples persists to localStorage", () => {
    const { result } = renderHook(() => useUIState());

    act(() => {
      result.current.setShowSamples(false);
    });

    expect(localStorage.getItem(STORAGE_KEYS.SHOW_SAMPLES)).toBe("false");
  });

  it("setImageSize updates imageSize", () => {
    const { result } = renderHook(() => useUIState());
    act(() => {
      result.current.setImageSize(512);
    });
    expect(result.current.imageSize).toBe(512);
  });

  it("setIsLoading updates isLoading", () => {
    const { result } = renderHook(() => useUIState());
    act(() => {
      result.current.setIsLoading(true);
    });
    expect(result.current.isLoading).toBe(true);
  });

  it("setHasManuallyAdjusted updates hasManuallyAdjusted", () => {
    const { result } = renderHook(() => useUIState());
    act(() => {
      result.current.setHasManuallyAdjusted(true);
    });
    expect(result.current.hasManuallyAdjusted).toBe(true);
  });
});
