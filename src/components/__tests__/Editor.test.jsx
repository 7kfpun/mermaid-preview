import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import Editor from "../Editor";

vi.mock("@uiw/react-codemirror", () => ({
  __esModule: true,
  default: ({ value = "", onChange }) => (
    <textarea
      data-testid="codemirror"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
}));

vi.mock("codemirror-lang-mermaid", () => ({ mermaid: () => [] }));
vi.mock("@replit/codemirror-indentation-markers", () => ({
  indentationMarkers: () => [],
}));
vi.mock("@codemirror/theme-one-dark", () => ({ oneDark: {} }));
vi.mock("../utils/ga", () => ({ trackEvent: vi.fn() }));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));
vi.mock("../Icon", () => ({ default: ({ type }) => <span>{type}</span> }));

const CHATGPT_URL =
  "https://chatgpt.com/g/g-684cc36f30208191b21383b88650a45d-mermaid-chart-diagrams-and-charts";

const baseProps = {
  code: "graph TD\n  A --> B",
  setCode: vi.fn(),
  samples: { flowchart: "graph TD\n  A-->B", sequence: "sequenceDiagram\n  A->>B: Hi" },
  handleSampleClick: vi.fn(),
  darkMode: false,
  editorWidth: 50,
  imageSize: 1024,
  setImageSize: vi.fn(),
  downloadMenuOpen: false,
  setDownloadMenuOpen: vi.fn(),
  downloadSvg: vi.fn(),
  svgToRaster: vi.fn(),
  copyMenuOpen: false,
  setCopyMenuOpen: vi.fn(),
  copyImage: vi.fn(),
  handleShare: vi.fn(),
  copyEmbedHtml: vi.fn(),
  exportToFigma: vi.fn(),
  backgroundColor: "#ffffff",
  setBackgroundColor: vi.fn(),
  showSamples: false,
  setShowSamples: vi.fn(),
};

const renderEditor = (overrides = {}) =>
  render(<Editor {...baseProps} {...overrides} />);

describe("Editor", () => {
  let openSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
  });

  afterEach(() => {
    openSpy.mockRestore();
  });

  // ── Samples panel ────────────────────────────────────────────────────────
  it("hides sample grid when showSamples is false", () => {
    renderEditor();
    expect(screen.queryByText("flowchart")).not.toBeInTheDocument();
  });

  it("shows sample grid when showSamples is true", () => {
    renderEditor({ showSamples: true });
    // The Icon mock + the label span both render the type name, so use getAllByText
    expect(screen.getAllByText("flowchart").length).toBeGreaterThan(0);
    expect(screen.getAllByText("sequence").length).toBeGreaterThan(0);
  });

  it("calls setShowSamples with toggled value when toggle button clicked", () => {
    renderEditor({ showSamples: false });
    fireEvent.click(screen.getByRole("button", { name: /sampleDiagrams/i }));
    expect(baseProps.setShowSamples).toHaveBeenCalledWith(true);
  });

  it("calls handleSampleClick when a sample button is clicked", () => {
    renderEditor({ showSamples: true });
    // getAllByText because Icon mock + label span both render the type name
    fireEvent.click(screen.getAllByText("flowchart")[0].closest("button"));
    expect(baseProps.handleSampleClick).toHaveBeenCalledWith("flowchart");
  });

  // ── CodeMirror ────────────────────────────────────────────────────────────
  it("renders CodeMirror with the current code", () => {
    renderEditor();
    expect(screen.getByTestId("codemirror")).toHaveValue(baseProps.code);
  });

  it("calls setCode when the editor value changes", () => {
    renderEditor();
    fireEvent.change(screen.getByTestId("codemirror"), {
      target: { value: "graph LR\n  X-->Y" },
    });
    expect(baseProps.setCode).toHaveBeenCalledWith("graph LR\n  X-->Y");
  });

  // ── Download menu ─────────────────────────────────────────────────────────
  it("calls setDownloadMenuOpen when download button clicked", () => {
    renderEditor();
    fireEvent.click(screen.getByRole("button", { name: /download/i }));
    expect(baseProps.setDownloadMenuOpen).toHaveBeenCalledWith(true);
  });

  it("shows download options when downloadMenuOpen is true", () => {
    renderEditor({ downloadMenuOpen: true });
    expect(screen.getByRole("button", { name: /^svg$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^png$/i })).toBeInTheDocument();
  });

  it("calls downloadSvg when SVG download button clicked", () => {
    renderEditor({ downloadMenuOpen: true });
    fireEvent.click(screen.getByRole("button", { name: /^svg$/i }));
    expect(baseProps.downloadSvg).toHaveBeenCalled();
  });

  it("calls svgToRaster with png when PNG button clicked", () => {
    renderEditor({ downloadMenuOpen: true });
    fireEvent.click(screen.getByRole("button", { name: /^png$/i }));
    expect(baseProps.svgToRaster).toHaveBeenCalledWith("png");
  });

  // ── Copy menu ─────────────────────────────────────────────────────────────
  it("calls setCopyMenuOpen when copy button clicked", () => {
    renderEditor();
    fireEvent.click(screen.getByRole("button", { name: /^copy$/i }));
    expect(baseProps.setCopyMenuOpen).toHaveBeenCalledWith(true);
  });

  it("calls copyImage with svg when copy SVG option clicked", () => {
    renderEditor({ copyMenuOpen: true });
    // The copy menu's SVG button shares the label "svg" — get the one inside the dropdown
    const svgButtons = screen.getAllByRole("button", { name: /^svg$/i });
    fireEvent.click(svgButtons[svgButtons.length - 1]);
    expect(baseProps.copyImage).toHaveBeenCalledWith("svg");
  });

  // ── Other action buttons ──────────────────────────────────────────────────
  it("calls handleShare when share button clicked", () => {
    renderEditor();
    fireEvent.click(screen.getByRole("button", { name: /share/i }));
    expect(baseProps.handleShare).toHaveBeenCalled();
  });

  it("calls copyEmbedHtml when Embed HTML button clicked", () => {
    renderEditor();
    fireEvent.click(screen.getByRole("button", { name: /embedHTML/i }));
    expect(baseProps.copyEmbedHtml).toHaveBeenCalled();
  });

  it("calls exportToFigma when Figma button clicked", () => {
    renderEditor();
    fireEvent.click(
      screen.getByRole("button", { name: /figmaExportTitle/i }),
    );
    expect(baseProps.exportToFigma).toHaveBeenCalled();
  });

  // ── AI Help dropdown ──────────────────────────────────────────────────────
  const setupClipboard = () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });
    return writeText;
  };

  const openAiHelpMenu = () => {
    fireEvent.click(screen.getByRole("button", { name: /mermaidGpt/i }));
  };

  it("shows ChatGPT and Claude options when AI Help is opened", () => {
    renderEditor();
    openAiHelpMenu();
    expect(screen.getByRole("button", { name: /aiHelpChatGpt/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /aiHelpClaude/i })).toBeInTheDocument();
  });

  it("copies formatted prompt and opens ChatGPT when ChatGPT option clicked", () => {
    const writeText = setupClipboard();
    renderEditor();
    openAiHelpMenu();
    fireEvent.click(screen.getByRole("button", { name: /aiHelpChatGpt/i }));

    const expected = `Help me with this Mermaid diagram:\n\`\`\`mermaid\n${baseProps.code}\n\`\`\``;
    expect(writeText).toHaveBeenCalledWith(expected);
    expect(openSpy).toHaveBeenCalledWith(CHATGPT_URL, "_blank");
  });

  it("copies formatted prompt and opens Claude when Claude option clicked", () => {
    const writeText = setupClipboard();
    renderEditor();
    openAiHelpMenu();
    fireEvent.click(screen.getByRole("button", { name: /aiHelpClaude/i }));

    const expected = `Help me with this Mermaid diagram:\n\`\`\`mermaid\n${baseProps.code}\n\`\`\``;
    expect(writeText).toHaveBeenCalledWith(expected);
    expect(openSpy).toHaveBeenCalledWith("https://claude.ai/new", "_blank");
  });

  it("includes the current code in the clipboard prompt", () => {
    const customCode = "sequenceDiagram\n  Alice->>Bob: Hello";
    const writeText = setupClipboard();
    renderEditor({ code: customCode });
    openAiHelpMenu();
    fireEvent.click(screen.getByRole("button", { name: /aiHelpClaude/i }));

    expect(writeText.mock.calls[0][0]).toContain(customCode);
  });

  it("closes AI Help menu after selecting an option", () => {
    setupClipboard();
    renderEditor();
    openAiHelpMenu();
    expect(screen.getByRole("button", { name: /aiHelpChatGpt/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /aiHelpChatGpt/i }));
    expect(screen.queryByRole("button", { name: /aiHelpChatGpt/i })).not.toBeInTheDocument();
  });
});
