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
});
