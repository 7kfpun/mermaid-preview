import { useTranslation } from "react-i18next";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";
import { trackEvent } from "../utils/ga";

const Preview = ({
  editorWidth,
  theme,
  setTheme,
  showThemeConfig,
  themeConfig,
  setThemeConfig,
  darkMode,
  isDragging,
  handleMouseDown,
  handleWheel,
  svgContainerRef,
  previewRef,
  position,
  scale,
  zoomIn,
  zoomOut,
  resetZoom,
}) => {
  const { t } = useTranslation();
  return (
    <section
      className="preview-container"
      style={{
        flexBasis: `${100 - editorWidth}%`,
        flexGrow: 0,
        flexShrink: 0,
      }}
    >
      <div className="theme-selector">
        <button
          onClick={() => {
            setTheme("default");
            trackEvent("set_theme", { theme: "default" });
          }}
          className={theme === "default" ? "active" : ""}
        >
          {t("default")}
        </button>
        <button
          onClick={() => {
            setTheme("dark");
            trackEvent("set_theme", { theme: "dark" });
          }}
          className={theme === "dark" ? "active" : ""}
        >
          {t("dark")}
        </button>
        <button
          onClick={() => {
            setTheme("forest");
            trackEvent("set_theme", { theme: "forest" });
          }}
          className={theme === "forest" ? "active" : ""}
        >
          {t("forest")}
        </button>
        <button
          onClick={() => {
            setTheme("neutral");
            trackEvent("set_theme", { theme: "neutral" });
          }}
          className={theme === "neutral" ? "active" : ""}
        >
          {t("neutral")}
        </button>
        <button
          onClick={() => {
            setTheme("custom");
            trackEvent("set_theme", { theme: "custom" });
          }}
          className={theme === "custom" ? "active" : ""}
        >
          {t("custom")}
        </button>
      </div>
      {showThemeConfig && (
        <CodeMirror
          value={themeConfig}
          height="120px"
          theme={darkMode ? oneDark : "light"}
          extensions={[javascript(), indentationMarkers()]}
          onChange={(value) => setThemeConfig(value)}
          placeholder='{"theme": "base", "themeVariables": {"primaryColor": "#ff0000"}}'
          basicSetup={{
            lineNumbers: false,
            foldGutter: false,
            highlightActiveLine: false,
          }}
        />
      )}
      <div
        className={`preview ${isDragging ? "dragging" : ""}`}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        ref={svgContainerRef}
      >
        <div
          ref={previewRef}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            cursor: isDragging ? "grabbing" : "grab",
          }}
        />
        <div className="zoom-controls">
          <button
            onClick={() => {
              zoomIn();
              trackEvent("zoom_in");
            }}
            title={t("zoomIn")}
            aria-label={t("zoomIn")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
          <button
            onClick={() => {
              zoomOut();
              trackEvent("zoom_out");
            }}
            title={t("zoomOut")}
            aria-label={t("zoomOut")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
          <button
            onClick={() => {
              resetZoom();
              trackEvent("reset_zoom");
            }}
            title={t("resetZoom")}
            aria-label={t("resetZoom")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Preview;
