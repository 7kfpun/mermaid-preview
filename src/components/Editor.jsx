import { memo } from "react";
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
  backgroundColor,
  setBackgroundColor,
}) => {
  const { t } = useTranslation();
  return (
    <section
      className="editor"
      style={{ flexBasis: `${editorWidth}%`, flexGrow: 0, flexShrink: 0 }}
    >
      <div className="selectors-container">
        <div className="sample-selector">
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
              setCopyMenuOpen(false); // Close copy menu
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
              setDownloadMenuOpen(false); // Close download menu
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
                {t("png")}
              </button>
              <button
                onClick={() => {
                  copyImage("jpg");
                  trackEvent("copy_jpg");
                }}
              >
                {t("jpg")}
              </button>
              <button
                onClick={() => {
                  copyImage("webp");
                  trackEvent("copy_webp");
                }}
              >
                {t("webp")}
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => {
            handleShare();
            trackEvent("share_link");
          }}
          title={t("shareLink")}
          aria-label={t("shareLink")}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginRight: "6px" }}
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          {t("share")}
        </button>
        <button
          onClick={() => {
            copyEmbedHtml();
            trackEvent("copy_embed_html");
          }}
        >
          {t("embedHTML")}
        </button>
      </div>
    </section>
  );
};

export default memo(Editor);
