import { describe, it, expect, vi, afterEach } from "vitest";
import { trackEvent } from "../ga";

describe("trackEvent", () => {
  afterEach(() => {
    delete window.gtag;
  });

  it("calls window.gtag with the event name when gtag is defined", () => {
    window.gtag = vi.fn();
    trackEvent("click_button");
    expect(window.gtag).toHaveBeenCalledWith("event", "click_button", undefined);
  });

  it("passes params to window.gtag", () => {
    window.gtag = vi.fn();
    trackEvent("select_sample", { sample_type: "gantt" });
    expect(window.gtag).toHaveBeenCalledWith("event", "select_sample", {
      sample_type: "gantt",
    });
  });

  it("does nothing when window.gtag is not defined", () => {
    // Should not throw
    expect(() => trackEvent("some_event")).not.toThrow();
  });

  it("throws when window.gtag is a truthy non-function value", () => {
    // The guard is `if (window.gtag)` — it only checks truthiness, not typeof.
    // A truthy non-function passes the guard and then throws on invocation.
    window.gtag = "not-a-function";
    expect(() => trackEvent("some_event")).toThrow(TypeError);
  });
});
