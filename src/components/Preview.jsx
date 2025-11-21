import { memo, useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";
import { trackEvent } from "../utils/ga";
import { DEFAULT_CUSTOM_THEME } from "../utils/constants";

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
  handleTouchStart,
  handleTouchEnd,
  handleWheel,
  handleTouchMove,
  svgContainerRef,
  previewRef,
  position,
  scale,
  zoomIn,
  zoomOut,
  resetZoom,
  isLoading,
  setShowThemeConfig,
  editorHeight,
  setEditorHeight,
  backgroundColor,
  error,
}) => {
  const { t } = useTranslation();
  const [isResizingEditor, setIsResizingEditor] = useState(false);
  const resizeStartY = useRef(0);
  const resizeStartHeight = useRef(120);

  useEffect(() => {
    if (!isResizingEditor) return;

    const handleMouseMove = (e) => {
      const diff = e.clientY - resizeStartY.current;
      const newHeight = Math.max(80, Math.min(400, resizeStartHeight.current + diff));
      setEditorHeight(newHeight);
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 1) {
        const diff = e.touches[0].clientY - resizeStartY.current;
        const newHeight = Math.max(80, Math.min(400, resizeStartHeight.current + diff));
        setEditorHeight(newHeight);
        e.preventDefault();
      }
    };

    const handleEnd = () => {
      setIsResizingEditor(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [isResizingEditor, setEditorHeight]);

  const handleResizeStart = (e) => {
    setIsResizingEditor(true);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    resizeStartY.current = clientY;
    resizeStartHeight.current = editorHeight;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  };

  return (
    <section
      className="preview-container"
      style={{
        flexGrow: 100 - editorWidth,
        flexBasis: 0,
        flexShrink: 1,
      }}
    >
      <div className="theme-selector">
        <button
          onClick={() => {
            setTheme("default");
            setShowThemeConfig(false);
            trackEvent("set_theme", { theme: "default" });
          }}
          className={theme === "default" ? "active" : ""}
        >
          {t("default")}
        </button>
        <button
          onClick={() => {
            setTheme("dark");
            setShowThemeConfig(false);
            trackEvent("set_theme", { theme: "dark" });
          }}
          className={theme === "dark" ? "active" : ""}
        >
          {t("dark")}
        </button>
        <button
          onClick={() => {
            setTheme("forest");
            setShowThemeConfig(false);
            trackEvent("set_theme", { theme: "forest" });
          }}
          className={theme === "forest" ? "active" : ""}
        >
          {t("forest")}
        </button>
        <button
          onClick={() => {
            setTheme("neutral");
            setShowThemeConfig(false);
            trackEvent("set_theme", { theme: "neutral" });
          }}
          className={theme === "neutral" ? "active" : ""}
        >
          {t("neutral")}
        </button>
        <button
          onClick={() => {
            setTheme("base");
            setShowThemeConfig(false);
            trackEvent("set_theme", { theme: "base" });
          }}
          className={theme === "base" ? "active" : ""}
        >
          {t("base")}
        </button>
        <button
          onClick={() => {
            if (theme === "custom") {
              // Toggle JSON editor if already on custom
              setShowThemeConfig(!showThemeConfig);
              trackEvent("toggle_theme_config");
            } else {
              // Switch to custom theme and show editor
              setTheme("custom");
              setThemeConfig(themeConfig || DEFAULT_CUSTOM_THEME);
              setShowThemeConfig(true);
              trackEvent("set_theme", { theme: "custom" });
            }
          }}
          className={theme === "custom" ? "active" : ""}
        >
          {theme === "custom" && (showThemeConfig ? "▼ " : "▶ ")}
          {t("custom")}
        </button>
      </div>
      {showThemeConfig && (
        <div className="theme-config-wrapper">
          <CodeMirror
            value={themeConfig}
            height={`${editorHeight}px`}
            theme={darkMode ? oneDark : "light"}
            extensions={[javascript(), indentationMarkers()]}
            onChange={(value) => setThemeConfig(value)}
            placeholder={DEFAULT_CUSTOM_THEME}
            basicSetup={{
              lineNumbers: false,
              foldGutter: false,
              highlightActiveLine: false,
            }}
          />
          <div
            className="editor-resize-handle"
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
          >
            <div className="editor-resize-line" />
          </div>
        </div>
      )}
      <div
        className={`preview ${isDragging ? "dragging" : ""}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        ref={svgContainerRef}
        style={{ background: backgroundColor }}
      >
        {isLoading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
          </div>
        )}
        {error && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              zIndex: 10,
              color: "#e53e3e",
              textAlign: "center",
              padding: "20px",
            }}
          >
            <div style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px" }}>
              ⚠️ Error rendering diagram
            </div>
            <div style={{ marginBottom: "15px" }}>Check your syntax and try again.</div>
            <a
              href="https://chatgpt.com/g/g-684cc36f30208191b21383b88650a45d-mermaid-chart-diagrams-and-charts"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "#10a37f",
                color: "white",
                padding: "8px 16px",
                borderRadius: "6px",
                textDecoration: "none",
                fontWeight: 500,
                fontSize: "14px",
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#0d8c6f")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#10a37f")}
            >
              <span style={{ fontSize: "16px" }}>🤖</span> Get AI Help
            </a>
          </div>
        )}
        <div
          ref={previewRef}
          className="diagram-container"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            cursor: isDragging ? "grabbing" : "grab",
            opacity: error ? 0.3 : 1, // Dim the diagram when there's an error
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

export default memo(Preview);
