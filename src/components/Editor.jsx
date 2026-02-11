import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";
import { mermaid as mermaidLang } from "codemirror-lang-mermaid";
import Icon from "./Icon";
import { trackEvent } from "../utils/ga";

const Editor = ({
  code,
  setCode,
  samples,
  handleSampleClick,
  darkMode,
  editorWidth,
  imageSize,
  setImageSize,
  downloadMenuOpen,
  setDownloadMenuOpen,
  downloadSvg,
  svgToRaster,
  copyMenuOpen,
  setCopyMenuOpen,
  copyImage,
  handleShare,
  copyEmbedHtml,
  exportToFigma,
  backgroundColor,
  setBackgroundColor,
  showSamples,
  setShowSamples,
}) => {
  const { t } = useTranslation();
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [aiHelpMenuOpen, setAiHelpMenuOpen] = useState(false);

  const openAiHelp = (url, eventName) => {
    const prompt = `Help me with this Mermaid diagram:\n\`\`\`mermaid\n${code}\n\`\`\``;
    navigator.clipboard.writeText(prompt).catch(() => {});
    window.open(url, "_blank");
    trackEvent(eventName);
    setAiHelpMenuOpen(false);
  };

  return (
    <section
      className="editor"
      style={{ flexGrow: editorWidth, flexBasis: 0, flexShrink: 1 }}
    >
      <div className="selectors-container">
        <div className="sample-selector">
          {showSamples && (
            <div className="sample-grid">
              {Object.keys(samples).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    handleSampleClick(type);
                    trackEvent("select_sample", { sample_type: type });
                  }}
                  className="sample-button"
                >
                  <Icon type={type} />
                  <span>{t(type)}</span>
                </button>
              ))}
            </div>
          )}
          <button
            className="sample-toggle-btn"
            onClick={() => {
              setShowSamples(!showSamples);
              trackEvent("toggle_samples", { visible: !showSamples });
            }}
            aria-expanded={showSamples}
          >
            <span>{t("sampleDiagrams")}</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: showSamples ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
      </div>
      <CodeMirror
        value={code}
        height="100%"
        theme={darkMode ? oneDark : "light"}
        extensions={[mermaidLang(), indentationMarkers()]}
        onChange={(value) => setCode(value)}
        placeholder={t("placeholder")}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          foldGutter: true,
          drawSelection: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          searchKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
        }}
        style={{ flex: 1, overflow: "auto" }}
      />
      <div className="controls">
        <div className="size-input">
          <label htmlFor="image-size">{t("size")}</label>
          <input
            type="number"
            id="image-size"
            value={imageSize}
            onChange={(e) => setImageSize(parseInt(e.target.value, 10))}
            min="128"
            step="128"
            aria-label="Image size in pixels"
          />
        </div>
        <div className="size-input">
          <label htmlFor="bg-color">{t("bgColor")}</label>
          <input
            type="color"
            id="bg-color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            aria-label="Background color for exports"
            style={{ width: "60px", height: "38px", cursor: "pointer" }}
          />
        </div>
        <div className="dropdown">
          <button
            onClick={() => {
              setDownloadMenuOpen(!downloadMenuOpen);
              setCopyMenuOpen(false);
              setShareMenuOpen(false);
              trackEvent("open_download_menu");
            }}
            className="dropdown-toggle"
            aria-haspopup="true"
            aria-expanded={downloadMenuOpen}
          >
            {t("download")}
          </button>
          {downloadMenuOpen && (
            <div className="dropdown-menu">
              <button
                onClick={() => {
                  downloadSvg();
                  trackEvent("download_svg");
                }}
              >
                {t("svg")}
              </button>
              <button
                onClick={() => {
                  svgToRaster("png");
                  trackEvent("download_png");
                }}
              >
                {t("png")}
              </button>
              <button
                onClick={() => {
                  svgToRaster("jpg");
                  trackEvent("download_jpg");
                }}
              >
                {t("jpg")}
              </button>
              <button
                onClick={() => {
                  svgToRaster("webp");
                  trackEvent("download_webp");
                }}
              >
                {t("webp")}
              </button>
            </div>
          )}
        </div>
        <div className="dropdown">
          <button
            onClick={() => {
              setCopyMenuOpen(!copyMenuOpen);
              setDownloadMenuOpen(false);
              setShareMenuOpen(false);
              trackEvent("open_copy_menu");
            }}
            className="dropdown-toggle"
            aria-haspopup="true"
            aria-expanded={copyMenuOpen}
          >
            {t("copy")}
          </button>
          {copyMenuOpen && (
            <div className="dropdown-menu">
              <button
                onClick={() => {
                  copyImage("svg");
                  trackEvent("copy_svg");
                }}
              >
                {t("svg")}
              </button>
              <button
                onClick={() => {
                  copyImage("png");
                  trackEvent("copy_png");
                }}
              >
                {t("image")}
              </button>
            </div>
          )}
        </div>
        <div className="dropdown">
          <button
            onClick={() => {
              setShareMenuOpen(!shareMenuOpen);
              setDownloadMenuOpen(false);
              setCopyMenuOpen(false);
              trackEvent("open_share_menu");
            }}
            className="dropdown-toggle"
            aria-haspopup="true"
            aria-expanded={shareMenuOpen}
          >
            {t("share")}
          </button>
          {shareMenuOpen && (
            <div className="dropdown-menu">
              <button
                onClick={() => {
                  handleShare();
                  setShareMenuOpen(false);
                  trackEvent("share_link");
                }}
              >
                {t("shareLink")}
              </button>
              <button
                onClick={() => {
                  copyEmbedHtml();
                  setShareMenuOpen(false);
                  trackEvent("copy_embed_html");
                }}
              >
                {t("embedHTML")}
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => {
            exportToFigma();
            trackEvent("export_to_figma");
          }}
          title={t("figmaExportTitle")}
          aria-label={t("figmaExportTitle")}
          className="figma-button"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 38 57"
            fill="currentColor"
            style={{ marginRight: "6px" }}
            aria-hidden="true"
          >
            <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z"/>
            <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 0 1-19 0z"/>
            <path d="M19 0v19h9.5a9.5 9.5 0 0 0 0-19H19z"/>
            <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z"/>
            <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z"/>
          </svg>
          {t("exportToFigma")}
        </button>
        <div className="dropdown">
          <button
            onClick={() => {
              setAiHelpMenuOpen(!aiHelpMenuOpen);
              setDownloadMenuOpen(false);
              setCopyMenuOpen(false);
              setShareMenuOpen(false);
            }}
            className="dropdown-toggle"
            aria-haspopup="true"
            aria-expanded={aiHelpMenuOpen}
          >
            {t("mermaidGpt")}
          </button>
          {aiHelpMenuOpen && (
            <div className="dropdown-menu">
              <button
                onClick={() =>
                  openAiHelp(
                    "https://chatgpt.com/g/g-684cc36f30208191b21383b88650a45d-mermaid-chart-diagrams-and-charts",
                    "open_mermaid_gpt"
                  )
                }
                title={t("aiHelpChatGptTitle")}
              >
                {t("aiHelpChatGpt")}
              </button>
              <button
                onClick={() =>
                  openAiHelp("https://claude.ai/new", "open_mermaid_claude")
                }
                title={t("aiHelpClaudeTitle")}
              >
                {t("aiHelpClaude")}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default memo(Editor);
