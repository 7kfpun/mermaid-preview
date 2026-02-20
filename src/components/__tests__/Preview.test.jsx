import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import Preview from "../Preview";

vi.mock("@uiw/react-codemirror", () => ({
  __esModule: true,
  default: ({ value = "", onChange }) => (
    <textarea
      data-testid="codemirror"
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
    />
  ),
}));

vi.mock("../utils/ga", () => ({
  trackEvent: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

const createRefs = () => ({
  svgContainerRef: { current: document.createElement("div") },
  previewRef: { current: document.createElement("div") },
});

const baseHandlers = {
  handleMouseDown: vi.fn(),
  handleWheel: vi.fn(),
  handleTouchMove: vi.fn(),
  handleTouchStart: vi.fn(),
  handleTouchEnd: vi.fn(),
  zoomIn: vi.fn(),
  zoomOut: vi.fn(),
  resetZoom: vi.fn(),
  setTheme: vi.fn(),
  setShowThemeConfig: vi.fn(),
  setThemeConfig: vi.fn(),
  setEditorHeight: vi.fn(),
};

const renderPreview = (overrideProps = {}) => {
  const { svgContainerRef, previewRef } = createRefs();
  return render(
    <Preview
      editorWidth={50}
      theme="default"
      showThemeConfig={false}
      themeConfig='{"theme":"default"}'
      darkMode={false}
      isDragging={false}
      position={{ x: 0, y: 0 }}
      scale={1}
      isLoading={false}
      editorHeight={120}
      backgroundColor="#ffffff"
      error={null}
      {...baseHandlers}
      svgContainerRef={svgContainerRef}
      previewRef={previewRef}
      {...overrideProps}
    />,
  );
};

describe("Preview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders theme buttons and allows switching themes", () => {
    renderPreview();

    fireEvent.click(screen.getByText("dark"));
    expect(baseHandlers.setTheme).toHaveBeenCalledWith("dark");
  });

  it("shows JSON editor when custom theme config is open", () => {
    renderPreview({
      theme: "custom",
      showThemeConfig: true,
    });

    expect(screen.getByTestId("codemirror")).toBeInTheDocument();
  });

  it("toggles theme config when custom button clicked twice", () => {
    const setShowThemeConfig = vi.fn();
    renderPreview({
      theme: "custom",
      showThemeConfig: false,
      setShowThemeConfig,
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /custom/i,
      }),
    );
    expect(setShowThemeConfig).toHaveBeenCalled();
  });

  it("calls setTheme with 'default' when default button is clicked", () => {
    renderPreview({ theme: "dark" });
    fireEvent.click(screen.getByText("default"));
    expect(baseHandlers.setTheme).toHaveBeenCalledWith("default");
  });

  it("calls setTheme with 'forest' when forest button is clicked", () => {
    renderPreview();
    fireEvent.click(screen.getByText("forest"));
    expect(baseHandlers.setTheme).toHaveBeenCalledWith("forest");
  });

  it("calls setTheme with 'neutral' when neutral button is clicked", () => {
    renderPreview();
    fireEvent.click(screen.getByText("neutral"));
    expect(baseHandlers.setTheme).toHaveBeenCalledWith("neutral");
  });

  it("calls setTheme with 'base' when base button is clicked", () => {
    renderPreview();
    fireEvent.click(screen.getByText("base"));
    expect(baseHandlers.setTheme).toHaveBeenCalledWith("base");
  });

  it("marks the active theme button", () => {
    renderPreview({ theme: "forest" });
    expect(screen.getByText("forest")).toHaveClass("active");
  });

  it("shows error overlay when error prop is truthy", () => {
    renderPreview({ error: new Error("Syntax error") });
    expect(screen.getByText(/Error rendering diagram/i)).toBeInTheDocument();
  });

  it("does not show error overlay when error is null", () => {
    renderPreview({ error: null });
    expect(screen.queryByText(/Error rendering diagram/i)).not.toBeInTheDocument();
  });

  it("shows loading spinner when isLoading is true", () => {
    const { container } = renderPreview({ isLoading: true });
    expect(container.querySelector(".loading-overlay")).toBeInTheDocument();
  });

  it("does not show loading spinner when isLoading is false", () => {
    const { container } = renderPreview({ isLoading: false });
    expect(container.querySelector(".loading-overlay")).not.toBeInTheDocument();
  });

  it("calls zoomIn when zoom-in button is clicked", () => {
    renderPreview();
    fireEvent.click(screen.getByTitle("zoomIn"));
    expect(baseHandlers.zoomIn).toHaveBeenCalled();
  });

  it("calls zoomOut when zoom-out button is clicked", () => {
    renderPreview();
    fireEvent.click(screen.getByTitle("zoomOut"));
    expect(baseHandlers.zoomOut).toHaveBeenCalled();
  });

  it("calls resetZoom when reset button is clicked", () => {
    renderPreview();
    fireEvent.click(screen.getByTitle("resetZoom"));
    expect(baseHandlers.resetZoom).toHaveBeenCalled();
  });
});
