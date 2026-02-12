/**
 * Tests that the Gantt diagram rendering fix works correctly.
 *
 * Root cause: Mermaid's Gantt renderer reads elem.parentElement.offsetWidth
 * to set the chart width.  The .diagram-container is position:absolute with
 * no explicit width, so offsetWidth resolves to 0 (CSS shrink-to-fit).
 * This produces viewBox="0 0 0 H" and style="max-width:0px", making the
 * chart invisible.  The fix passes gantt.useWidth via mermaid.initialize()
 * so Mermaid bypasses the offsetWidth lookup.
 */

import { render, act, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

// --- mocks ---------------------------------------------------------------

const mockInitialize = vi.fn();
const mockRun = vi.fn().mockResolvedValue(undefined);

vi.mock("mermaid", () => ({
  default: {
    initialize: mockInitialize,
    run: mockRun,
  },
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn(), promise: vi.fn() },
  Toaster: () => null,
}));

vi.mock("../utils/ga", () => ({ trackEvent: vi.fn() }));

vi.mock("@uiw/react-codemirror", () => ({
  __esModule: true,
  default: ({ value = "" }) => (
    <textarea data-testid="codemirror" defaultValue={value} />
  ),
}));

vi.mock("codemirror-lang-mermaid", () => ({ mermaid: () => [] }));
vi.mock("@replit/codemirror-indentation-markers", () => ({
  indentationMarkers: () => [],
}));
vi.mock("@codemirror/lang-javascript", () => ({ javascript: () => [] }));
vi.mock("@codemirror/theme-one-dark", () => ({ oneDark: {} }));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key, i18n: { language: "en" } }),
  initReactI18next: { type: "3rdParty", init: vi.fn() },
}));

vi.mock("../i18n", () => ({
  default: {},
  isRTL: () => false,
}));

vi.mock("../components/Header", () => ({ default: () => <div /> }));
vi.mock("../components/Footer", () => ({ default: () => <div /> }));

// -------------------------------------------------------------------------

// Lazy-import App after mocks are set up
async function renderApp(initialCode) {
  const { default: App } = await import("../App.jsx");

  // Provide a stable hash so loadFromURL uses our code
  Object.defineProperty(window, "location", {
    writable: true,
    value: { ...window.location, hash: "" },
  });

  // Pre-seed localStorage with the diagram code
  localStorage.setItem("mermaid_code", initialCode);
  localStorage.setItem("mermaid_theme", "default");

  let result;
  await act(async () => {
    result = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
  });
  return result;
}

// -------------------------------------------------------------------------

describe("Gantt diagram rendering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
  });

  it("passes gantt.useWidth to mermaid.initialize when rendering a Gantt diagram", async () => {
    const ganttCode = `gantt
    title A Gantt Diagram
    dateFormat YYYY-MM-DD
    section Section
        A task          :a1, 2014-01-01, 30d
        Another task    :after a1, 20d`;

    await renderApp(ganttCode);

    // Advance the debounce timer so renderDiagram fires
    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(mockInitialize).toHaveBeenCalled();
    });

    // Find the call that includes a gantt config
    const callsWithGantt = mockInitialize.mock.calls.filter(
      ([cfg]) => cfg && cfg.gantt,
    );
    expect(callsWithGantt.length).toBeGreaterThan(0);

    // useWidth must be set to a positive number (1200 fallback in jsdom)
    const ganttCfg = callsWithGantt[callsWithGantt.length - 1][0].gantt;
    expect(typeof ganttCfg.useWidth).toBe("number");
    expect(ganttCfg.useWidth).toBeGreaterThan(0);
  });

  it("always includes gantt.useWidth regardless of diagram type", async () => {
    // Even a non-Gantt diagram should get gantt.useWidth so subsequent
    // switches to Gantt are already configured correctly.
    await renderApp("flowchart TD\n  A --> B");

    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    await waitFor(() => {
      expect(mockInitialize).toHaveBeenCalled();
    });

    const latestCall =
      mockInitialize.mock.calls[mockInitialize.mock.calls.length - 1][0];
    expect(latestCall.gantt).toBeDefined();
    expect(typeof latestCall.gantt.useWidth).toBe("number");
    expect(latestCall.gantt.useWidth).toBeGreaterThan(0);
  });
});
