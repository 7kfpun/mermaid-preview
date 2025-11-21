import { useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import mermaid from "mermaid";
import toast, { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Editor from "./components/Editor";
import Preview from "./components/Preview";
import useMermaidCode from "./hooks/useMermaidCode";
import useTheme from "./hooks/useTheme";
import useUIState from "./hooks/useUIState";
import { STORAGE_KEYS, DEFAULT_CUSTOM_THEME, samples } from "./utils/constants";
import { encodeState, decodeState } from "./utils/url";
import { isRTL } from "./i18n";

function App() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const { code, setCode, embedHtml, setEmbedHtml } = useMermaidCode();
  const {
    theme,
    setTheme,
    themeConfig,
    setThemeConfig,
    showThemeConfig,
    setShowThemeConfig,
    darkMode,
    toggleDarkMode,
  } = useTheme();
  const {
    isDragging,
    setIsDragging,
    dragOffset,
    setDragOffset,
    position,
    setPosition,
    scale,
    setScale,
    isResizing,
    setIsResizing,
    downloadMenuOpen,
    setDownloadMenuOpen,
    copyMenuOpen,
    setCopyMenuOpen,
    imageSize,
    setImageSize,
    editorWidth,
    setEditorWidth,
    hasManuallyAdjusted,
    setHasManuallyAdjusted,
    isLoading,
    setIsLoading,
    editorHeight,
    setEditorHeight,
    backgroundColor,
    setBackgroundColor,
    showSamples,
    setShowSamples,
  } = useUIState();

  const previewRef = useRef(null);
  const svgContainerRef = useRef(null);
  const debounceTimer = useRef(null);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(50);

  const saveToLocalStorage = useCallback(() => {
    try {
      if (code.trim()) {
        localStorage.setItem(STORAGE_KEYS.CODE, code);
      }
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, darkMode.toString());
      if (theme === "custom" && themeConfig) {
        localStorage.setItem(STORAGE_KEYS.THEME_CONFIG, themeConfig);
      } else {
        localStorage.removeItem(STORAGE_KEYS.THEME_CONFIG);
      }
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  }, [code, theme, themeConfig, darkMode]);

  const updateURL = useCallback(() => {
    if (!code.trim()) return; // Don't update URL if no code

    const themeConfigValue = theme === "custom" ? themeConfig : null;
    const encoded = encodeState(code, theme, themeConfigValue);
    window.history.replaceState(null, "", "#pako:" + encoded);

    // Also save to localStorage
    saveToLocalStorage();
  }, [code, theme, themeConfig, saveToLocalStorage]);

  const loadFromURL = useCallback(() => {
    const hash = window.location.hash;

    if (hash.startsWith("#pako:")) {
      // Load from hash with pako compression
      const encoded = hash.substring(6); // Remove '#pako:' prefix
      const state = decodeState(encoded);
      if (state) {
        setCode(state.code || "");
        setTheme(state.theme || "default");
        if (state.themeConfig) {
          setThemeConfig(state.themeConfig);
          setShowThemeConfig(true);
        }
        return true;
      } else {
        // Failed to decode, clear invalid hash
        window.history.replaceState(null, "", window.location.pathname);
      }
    }

    // If no URL data, load from localStorage
    try {
      const savedCode = localStorage.getItem(STORAGE_KEYS.CODE);
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
      const savedThemeConfig = localStorage.getItem(STORAGE_KEYS.THEME_CONFIG);

      if (savedCode) {
        setCode(savedCode);
      }
      if (savedTheme) {
        setTheme(savedTheme);
      }
      if (savedThemeConfig && savedTheme === "custom") {
        setThemeConfig(savedThemeConfig);
        setShowThemeConfig(true);
      }

      return !!savedCode;
    } catch (e) {
      console.error("Failed to load from localStorage:", e);
      return false;
    }
  }, [setCode, setTheme, setThemeConfig, setShowThemeConfig]);

  const initializeMermaid = (selectedTheme, configObj) => {
    const config = {
      startOnLoad: false,
      securityLevel: "strict",
      theme: selectedTheme,
    };

    if (configObj) {
      Object.assign(config, configObj);
    }

    mermaid.initialize(config);
  };

  const renderDiagram = useCallback(async () => {
    if (!code.trim() || !previewRef.current) return;

    setIsLoading(true);
    try {
      // Apply theme before rendering
      let themeConfigObj = null;
      if (theme === "custom" && themeConfig) {
        try {
          themeConfigObj = JSON.parse(themeConfig);
        } catch (e) {
          console.error("Invalid theme JSON:", e);
        }
      }
      initializeMermaid(
        theme === "custom" ? themeConfigObj?.theme || "default" : theme,
        themeConfigObj,
      );

      // Clear previous content
      previewRef.current.innerHTML = `<div class="mermaid" id="diagram-target">${code}</div>`;

      // Wait for next tick to ensure DOM is updated
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Check if element exists before rendering
      const diagramElement = document.getElementById("diagram-target");
      if (!diagramElement) {
        console.error("Diagram target element not found");
        return;
      }

      // Render with Mermaid
      await mermaid.run({ querySelector: "#diagram-target" });

      // Update URL
      updateURL();

      const embedTheme = theme !== "custom" ? theme : themeConfigObj?.theme || "default";
      const themeVariablesSnippet =
        theme === "custom" && themeConfigObj?.themeVariables
          ? `,\n  themeVariables: ${JSON.stringify(
            themeConfigObj.themeVariables,
            null,
            2,
          )}`
          : "";

      // Update embed HTML
      const newEmbedHtml = `<!-- Mermaid diagram -->
<div class="mermaid">
${code}
</div>
<script type="module">
  import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
  mermaid.initialize({
    startOnLoad: true,
    theme: "${embedTheme}"${themeVariablesSnippet}
  });
</script>`;

      setEmbedHtml(newEmbedHtml);

      // Auto-fit the diagram only if user hasn't manually adjusted view
      if (!hasManuallyAdjusted) {
        const svgEl = previewRef.current.querySelector("svg");
        if (svgEl && svgContainerRef.current) {
          const containerWidth = svgContainerRef.current.offsetWidth;
          const containerHeight = svgContainerRef.current.offsetHeight;
          const svgWidth = svgEl.width.baseVal.value;
          const svgHeight = svgEl.height.baseVal.value;

          const scaleX = containerWidth / svgWidth;
          const scaleY = containerHeight / svgHeight;
          const newScale = Math.min(scaleX, scaleY) * 0.95; // 95% padding

          const newX = (containerWidth - svgWidth * newScale) / 2;
          const newY = (containerHeight - svgHeight * newScale) / 2;

          setScale(newScale);
          setPosition({ x: newX, y: newY });
        }
      }
    } catch (error) {
      console.error("Mermaid rendering error:", error);
      previewRef.current.innerHTML = `
        <div style="color: #e53e3e; padding: 20px; text-align: center;">
          <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">⚠️ Error rendering diagram</div>
          <div style="margin-bottom: 15px;">Check your syntax and try again.</div>
          <a
            href="https://chatgpt.com/g/g-684cc36f30208191b21383b88650a45d-mermaid-chart-diagrams-and-charts"
            target="_blank"
            rel="noopener noreferrer"
            style="
              display: inline-block;
              background-color: #10a37f;
              color: white;
              padding: 10px 20px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: 500;
              transition: background-color 0.2s;
            "
            onmouseover="this.style.backgroundColor='#0d8c6f'"
            onmouseout="this.style.backgroundColor='#10a37f'"
          >
            🤖 Get AI Help with Mermaid Chart GPT
          </a>
        </div>
      `;
    } finally {
      setIsLoading(false);
    }
  }, [
    code,
    theme,
    themeConfig,
    updateURL,
    setEmbedHtml,
    setPosition,
    setScale,
    hasManuallyAdjusted,
    setIsLoading,
  ]);

  useEffect(() => {
    // Initial load
    loadFromURL();

    const handleHashChange = () => {
      loadFromURL();
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [loadFromURL]);

  // Handle diagram import from gallery
  useEffect(() => {
    if (location.state?.diagramCode) {
      setCode(location.state.diagramCode);
      // Clear the state to prevent re-importing on subsequent renders
      window.history.replaceState({}, document.title);
      // Show toast notification
      const title = location.state.diagramTitle || "Diagram";
      toast.success(`${title} imported to editor`);
    }
  }, [location.state, setCode]);

  // Debounced diagram rendering
  useEffect(() => {
    if (!code.trim()) return;

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      renderDiagram();
    }, 500);

    return () => clearTimeout(debounceTimer.current);
  }, [code, theme, themeConfig, renderDiagram]);

  // Handle RTL direction based on language
  useEffect(() => {
    const direction = isRTL(i18n.language) ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", direction);
  }, [i18n.language]);

  // Sync background color with dark mode
  useEffect(() => {
    setBackgroundColor(darkMode ? "#1a1a1a" : "#ffffff");
  }, [darkMode, setBackgroundColor]);

  // Initialize theme config when custom theme is selected
  useEffect(() => {
    if (theme === "custom" && !themeConfig) {
      setThemeConfig(DEFAULT_CUSTOM_THEME);
    }
  }, [theme, themeConfig, setThemeConfig]);

  useEffect(() => {
    const trimmed = code.trim();
    const firstToken = trimmed.split(/\s+/)[0]?.toLowerCase() || "";
    const labelMap = {
      flowchart: "Flowchart Diagram",
      flowcharttd: "Flowchart Diagram",
      sequencediagram: "Sequence Diagram",
      classdiagram: "Class Diagram",
      statediagram: "State Diagram",
      "statediagram-v2": "State Diagram",
      erdiagram: "ER Diagram",
      journey: "User Journey",
      gantt: "Gantt Chart",
      pie: "Pie Chart",
      quadrantchart: "Quadrant Chart",
      requirementdiagram: "Requirement Diagram",
      gitgraph: "Git Graph",
      mindmap: "Mind Map",
      timeline: "Timeline Diagram",
      "sankey-beta": "Sankey Diagram",
      "xychart-beta": "XY Chart",
      "block-beta": "Block Diagram",
      kanban: "Kanban Board",
    };
    const diagramLabel = labelMap[firstToken] || "Mermaid Diagram";
    const title = `${diagramLabel} | Mermaid Live Preview`;
    const description = `Create and share ${diagramLabel.toLowerCase()}s using a fast React + Vite Mermaid editor with themes, samples, and shareable URLs.`;

    const updateMeta = (selector, value, attribute = "content") => {
      const element = document.querySelector(selector);
      if (element) {
        element.setAttribute(attribute, value);
      }
    };

    document.title = title;
    updateMeta('meta[name="description"]', description);
    updateMeta('meta[property="og:title"]', title);
    updateMeta('meta[name="twitter:title"]', title);
    updateMeta('meta[property="og:description"]', description);
    updateMeta('meta[name="twitter:description"]', description);

    const currentUrl = window.location.href;
    updateMeta('meta[property="og:url"]', currentUrl);
    updateMeta('link[rel="canonical"]', currentUrl, "href");
  }, [code, theme]);

  const handleSampleClick = useCallback(
    (sampleType) => {
      if (sampleType && samples[sampleType]) {
        const newCode = samples[sampleType];
        setCode(newCode);
      }
    },
    [setCode],
  );

  const handleShare = useCallback(() => {
    const url = window.location.href;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success("Link copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy link.");
      });
  }, []);

  const handleMouseDown = useCallback(
    (e) => {
      if (e.target.closest("svg")) {
        setIsDragging(true);
        setDragOffset({
          x: e.clientX - position.x,
          y: e.clientY - position.y,
        });
      }
    },
    [position.x, position.y, setIsDragging, setDragOffset],
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
        setHasManuallyAdjusted(true);
      }
    },
    [isDragging, dragOffset, setPosition, setHasManuallyAdjusted],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, [setIsDragging]);

  // Touch event handlers for mobile diagram dragging
  const handleTouchStart = useCallback(
    (e) => {
      if (e.target.closest("svg") && e.touches.length === 1) {
        setIsDragging(true);
        setDragOffset({
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y,
        });
      }
    },
    [position.x, position.y, setIsDragging, setDragOffset],
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, [setIsDragging]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragOffset, handleMouseMove, handleMouseUp]);

  const downloadSvg = useCallback(() => {
    const svgEl = previewRef.current?.querySelector("svg");
    if (!svgEl) return;

    const svgText = svgEl.outerHTML;
    const blob = new Blob([svgText], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "diagram.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const svgToRaster = useCallback(
    (type) => {
      const svgEl = previewRef.current?.querySelector("svg");
      if (!svgEl) return;

      const originalWidth =
        svgEl.width.baseVal.value || svgEl.clientWidth || 800;
      const originalHeight =
        svgEl.height.baseVal.value || svgEl.clientHeight || 600;
      const aspectRatio = originalWidth / originalHeight;

      const width = imageSize;
      const height = imageSize / aspectRatio;

      const svgClone = svgEl.cloneNode(true);
      svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      const svgText = new XMLSerializer().serializeToString(svgClone);

      // Convert SVG to base64 using TextEncoder
      const bytes = new TextEncoder().encode(svgText);
      const binString = Array.from(bytes, (byte) =>
        String.fromCodePoint(byte),
      ).join("");
      const svgDataUrl = "data:image/svg+xml;base64," + btoa(binString);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        // Add background color (for JPG always, for PNG/WebP if not transparent)
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(img, 0, 0, width, height);

        // Determine mime type and quality
        let mimeType, quality;
        switch (type) {
          case "png":
            mimeType = "image/png";
            quality = 1.0;
            break;
          case "jpg":
          case "jpeg":
            mimeType = "image/jpeg";
            quality = 0.9;
            break;
          case "webp":
            mimeType = "image/webp";
            quality = 0.9;
            break;
          default:
            mimeType = "image/png";
            quality = 1.0;
        }

        canvas.toBlob(
          (blobOut) => {
            if (!blobOut) return;
            const outUrl = URL.createObjectURL(blobOut);
            const a = document.createElement("a");
            a.href = outUrl;
            a.download = `diagram.${type}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(outUrl);
          },
          mimeType,
          quality,
        );
      };

      img.onerror = () => {
        console.error("Failed to load SVG into image");
        toast.error("Failed to convert diagram.");
      };

      img.src = svgDataUrl;
    },
    [imageSize, backgroundColor],
  );

  const copyEmbedHtml = useCallback(() => {
    navigator.clipboard
      .writeText(embedHtml)
      .then(() => toast.success("Embed HTML copied!"))
      .catch(() => toast.error("Failed to copy embed HTML."));
  }, [embedHtml]);

  const copyImage = useCallback(
    (type) => {
      const svgEl = previewRef.current?.querySelector("svg");
      if (!svgEl) {
        toast.error("No diagram to copy.");
        return;
      }

      const originalWidth =
        svgEl.width.baseVal.value || svgEl.clientWidth || 800;
      const originalHeight =
        svgEl.height.baseVal.value || svgEl.clientHeight || 600;
      const aspectRatio = originalWidth / originalHeight;

      const width = imageSize;
      const height = imageSize / aspectRatio;

      const svgClone = svgEl.cloneNode(true);
      svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      const svgText = new XMLSerializer().serializeToString(svgClone);

      if (type === "svg") {
        navigator.clipboard
          .writeText(svgText)
          .then(() => toast.success("SVG copied!"))
          .catch(() => toast.error("Failed to copy SVG."));
        return;
      }

      // Convert SVG to base64 using TextEncoder
      const bytes = new TextEncoder().encode(svgText);
      const binString = Array.from(bytes, (byte) =>
        String.fromCodePoint(byte),
      ).join("");
      const svgDataUrl = "data:image/svg+xml;base64," + btoa(binString);

      // Determine mime type and quality
      let mimeType, quality;
      switch (type) {
        case "png":
          mimeType = "image/png";
          quality = 1.0;
          break;
        case "jpg":
        case "jpeg":
          mimeType = "image/jpeg";
          quality = 0.9;
          break;
        case "webp":
          mimeType = "image/webp";
          quality = 0.9;
          break;
        default:
          mimeType = "image/png";
          quality = 1.0;
      }

      // Create a Promise that resolves to the image blob
      // This allows us to call navigator.clipboard.write immediately
      const blobPromise = new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");

            // Add background color
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error("Failed to create image blob."));
                  return;
                }
                resolve(blob);
              },
              mimeType,
              quality,
            );
          } catch (e) {
            reject(e);
          }
        };

        img.onerror = () => {
          reject(new Error("Failed to load SVG into image"));
        };

        img.src = svgDataUrl;
      });

      // Create ClipboardItem with the promise
      // This must be done synchronously within the event handler
      try {
        const clipboardItem = new ClipboardItem({ [mimeType]: blobPromise });
        const promise = navigator.clipboard.write([clipboardItem]);

        toast.promise(promise, {
          loading: "Copying...",
          success: `${type.toUpperCase()} copied to clipboard!`,
          error: (err) => `Failed to copy: ${err.message || "Unknown error"}`,
        });
      } catch (e) {
        console.error("Clipboard write failed:", e);
        toast.error("Failed to initiate copy. Browser might not support this.");
      }
    },
    [imageSize, backgroundColor],
  );

  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      const delta = e.deltaY > 0 ? -0.03 : 0.03; // Slower zoom for better control
      const newScale = Math.max(0.1, Math.min(5, scale + delta));

      if (!svgContainerRef.current) return;

      const container = svgContainerRef.current;
      const centerX = container.offsetWidth / 2;
      const centerY = container.offsetHeight / 2;
      const ratio = newScale / scale;

      setScale(newScale);
      setPosition({
        x: centerX * (1 - ratio) + position.x * ratio,
        y: centerY * (1 - ratio) + position.y * ratio,
      });
      setHasManuallyAdjusted(true);
    },
    [scale, setScale, position.x, position.y, setPosition, setHasManuallyAdjusted],
  );

  const handleTouchMove = useCallback(
    (e) => {
      // Handle single-touch dragging
      if (isDragging && e.touches.length === 1) {
        e.preventDefault();
        setPosition({
          x: e.touches[0].clientX - dragOffset.x,
          y: e.touches[0].clientY - dragOffset.y,
        });
        setHasManuallyAdjusted(true);
      }
      // Prevent pinch zoom (when there are 2 or more touches)
      else if (e.touches.length > 1) {
        e.preventDefault();
      }
    },
    [isDragging, dragOffset, setPosition, setHasManuallyAdjusted],
  );

  const zoomIn = useCallback(() => {
    const newScale = Math.min(5, scale + 0.2);
    if (!svgContainerRef.current) return;

    const container = svgContainerRef.current;
    const centerX = container.offsetWidth / 2;
    const centerY = container.offsetHeight / 2;
    const ratio = newScale / scale;

    setScale(newScale);
    setPosition({
      x: centerX * (1 - ratio) + position.x * ratio,
      y: centerY * (1 - ratio) + position.y * ratio,
    });
    setHasManuallyAdjusted(true);
  }, [scale, setScale, position.x, position.y, setPosition, setHasManuallyAdjusted]);

  const zoomOut = useCallback(() => {
    const newScale = Math.max(0.1, scale - 0.2);
    if (!svgContainerRef.current) return;

    const container = svgContainerRef.current;
    const centerX = container.offsetWidth / 2;
    const centerY = container.offsetHeight / 2;
    const ratio = newScale / scale;

    setScale(newScale);
    setPosition({
      x: centerX * (1 - ratio) + position.x * ratio,
      y: centerY * (1 - ratio) + position.y * ratio,
    });
    setHasManuallyAdjusted(true);
  }, [scale, setScale, position.x, position.y, setPosition, setHasManuallyAdjusted]);

  const resetZoom = useCallback(() => {
    // Auto-fit the diagram to panel
    const svgEl = previewRef.current?.querySelector("svg");
    if (svgEl && svgContainerRef.current) {
      const containerWidth = svgContainerRef.current.offsetWidth;
      const containerHeight = svgContainerRef.current.offsetHeight;
      const svgWidth = svgEl.width.baseVal.value;
      const svgHeight = svgEl.height.baseVal.value;

      const scaleX = containerWidth / svgWidth;
      const scaleY = containerHeight / svgHeight;
      const newScale = Math.min(scaleX, scaleY) * 0.95; // 95% padding

      const newX = (containerWidth - svgWidth * newScale) / 2;
      const newY = (containerHeight - svgHeight * newScale) / 2;

      setScale(newScale);
      setPosition({ x: newX, y: newY });
    } else {
      // Fallback to default
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
    setHasManuallyAdjusted(false);
  }, [setScale, setPosition, setHasManuallyAdjusted]);

  // Resize handlers
  const handleResizeStart = useCallback(
    (e) => {
      setIsResizing(true);
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      resizeStartX.current = clientX;
      resizeStartWidth.current = editorWidth;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [editorWidth, setIsResizing],
  );

  useEffect(() => {
    if (!isResizing) return;

    const handleResizeMove = (e) => {
      const mainElement = document.querySelector("main");
      if (!mainElement) return;

      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const mainWidth = mainElement.offsetWidth;
      const diff = clientX - resizeStartX.current;
      const diffPercent = (diff / mainWidth) * 100;
      const newWidth = resizeStartWidth.current + diffPercent;

      // Set minimum widths (30% to 70%)
      const clampedWidth = Math.max(30, Math.min(70, newWidth));
      setEditorWidth(clampedWidth);
    };

    const handleResizeEnd = () => {
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      // Save divider position to localStorage
      try {
        localStorage.setItem(STORAGE_KEYS.DIVIDER_POS, editorWidth.toString());
      } catch (e) {
        console.error("Failed to save divider position:", e);
      }
    };

    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd);
    document.addEventListener("touchmove", handleResizeMove);
    document.addEventListener("touchend", handleResizeEnd);

    return () => {
      document.removeEventListener("mousemove", handleResizeMove);
      document.removeEventListener("mouseup", handleResizeEnd);
      document.removeEventListener("touchmove", handleResizeMove);
      document.removeEventListener("touchend", handleResizeEnd);
    };
  }, [isResizing, editorWidth, setEditorWidth, setIsResizing]);

  // Close dropdown menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Check if click is outside dropdown menus
      const isClickInsideDropdown = e.target.closest(".dropdown");
      if (!isClickInsideDropdown) {
        setDownloadMenuOpen(false);
        setCopyMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setDownloadMenuOpen, setCopyMenuOpen]);

  return (
    <div className={`app ${darkMode ? "dark-mode" : ""}`}>
      <Toaster />
      <Header toggleDarkMode={toggleDarkMode} darkMode={darkMode} />

      <main>
        <Editor
          code={code}
          setCode={setCode}
          samples={samples}
          handleSampleClick={handleSampleClick}
          darkMode={darkMode}
          editorWidth={editorWidth}
          imageSize={imageSize}
          setImageSize={setImageSize}
          backgroundColor={backgroundColor}
          setBackgroundColor={setBackgroundColor}
          downloadMenuOpen={downloadMenuOpen}
          setDownloadMenuOpen={setDownloadMenuOpen}
          downloadSvg={downloadSvg}
          svgToRaster={svgToRaster}
          copyMenuOpen={copyMenuOpen}
          setCopyMenuOpen={setCopyMenuOpen}
          copyImage={copyImage}
          handleShare={handleShare}
          copyEmbedHtml={copyEmbedHtml}
          showSamples={showSamples}
          setShowSamples={setShowSamples}
        />

        <div
          className={`resize-handle ${isResizing ? "dragging" : ""}`}
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
        />

        <Preview
          editorWidth={editorWidth}
          theme={theme}
          setTheme={setTheme}
          showThemeConfig={showThemeConfig}
          themeConfig={themeConfig}
          setThemeConfig={setThemeConfig}
          darkMode={darkMode}
          isDragging={isDragging}
          handleMouseDown={handleMouseDown}
          handleTouchStart={handleTouchStart}
          handleTouchEnd={handleTouchEnd}
          handleWheel={handleWheel}
          handleTouchMove={handleTouchMove}
          svgContainerRef={svgContainerRef}
          previewRef={previewRef}
          position={position}
          scale={scale}
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          resetZoom={resetZoom}
          isLoading={isLoading}
          setShowThemeConfig={setShowThemeConfig}
          editorHeight={editorHeight}
          setEditorHeight={setEditorHeight}
          backgroundColor={backgroundColor}
        />
      </main>
      <Footer />
    </div>
  );
}

export default App;
