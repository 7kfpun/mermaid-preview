import { useState, useEffect, useRef, useCallback } from "react";
import mermaid from "mermaid";
import pako from "pako";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";
import { mermaid as mermaidLang } from "codemirror-lang-mermaid";
import "./App.css";

const Icon = ({ type }) => {
  const icons = {
    flowchart: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2L12 8" />
        <path d="M12 16L12 22" />
        <path d="M17 5L7 5" />
        <path d="M17 19L7 19" />
        <path d="M22 12L12 12" />
        <path d="M12 12L2 12" />
        <path d="M17 19L17 5" />
        <path d="M7 19L7 5" />
      </svg>
    ),
    sequence: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3h18v18H3z" />
        <path d="M9 9h6v6H9z" />
        <path d="M9 15v3" />
        <path d="M15 15v3" />
        <path d="M9 6V3" />
        <path d="M15 6V3" />
      </svg>
    ),
    class: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 12l9-9 9 9-9 9-9-9z" />
        <path d="M12 22V12" />
        <path d="M22 12H2" />
      </svg>
    ),
    state: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    er: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        <path d="M12 6v12" />
        <path d="M17 9l-5 5-5-5" />
      </svg>
    ),
    journey: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
        <path d="M12 12l4-4" />
        <path d="M12 12l-4 4" />
        <path d="M12 12l4 4" />
        <path d="M12 12l-4-4" />
      </svg>
    ),
    gantt: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3h18v4H3z" />
        <path d="M3 10h12v4H3z" />
        <path d="M3 17h15v4H3z" />
      </svg>
    ),
    pie: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21.21 15.89A10 10 0 118 2.83" />
        <path d="M22 12A10 10 0 0012 2v10z" />
      </svg>
    ),
    quadrant: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2v20" />
        <path d="M2 12h20" />
      </svg>
    ),
    requirement: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M9 12h6" />
        <path d="M9 16h6" />
      </svg>
    ),
    gitgraph: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2v20" />
        <path d="M12 18a6 6 0 00-6-6" />
      </svg>
    ),
    mindmap: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
        <path d="M12 12h.01" />
        <path d="M12 12l4-4" />
        <path d="M12 12l-4 4" />
      </svg>
    ),
    timeline: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3h18" />
        <path d="M3 21h18" />
        <path d="M12 3v18" />
        <path d="M8 8h8" />
        <path d="M8 16h8" />
      </svg>
    ),
    sankey: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 6h18" />
        <path d="M3 12h18" />
        <path d="M3 18h18" />
        <path d="M3 6s6 6 6 6" />
        <path d="M21 18s-6-6-6-6" />
      </svg>
    ),
    xy: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3v18h18" />
        <path d="M3 3l18 18" />
      </svg>
    ),
    block: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3h18v18H3z" />
        <path d="M9 3v18" />
        <path d="M15 3v18" />
        <path d="M3 9h18" />
        <path d="M3 15h18" />
      </svg>
    ),
    kanban: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3h6v18H3z" />
        <path d="M15 3h6v18h-6z" />
        <path d="M9 3h6v18H9z" />
      </svg>
    ),
  };
  return icons[type] || null;
};

// LocalStorage keys
const STORAGE_KEYS = {
  CODE: "mermaid_code",
  THEME: "mermaid_theme",
  THEME_CONFIG: "mermaid_theme_config",
  DIVIDER_POS: "mermaid_divider_position",
  DARK_MODE: "mermaid_dark_mode",
};

// Default custom theme JSON template
const DEFAULT_CUSTOM_THEME = JSON.stringify(
  {
    theme: "base",
    themeVariables: {
      primaryColor: "#ff6b6b",
      primaryTextColor: "#fff",
      primaryBorderColor: "#ff5252",
      lineColor: "#4ecdc4",
      secondaryColor: "#ffe66d",
      tertiaryColor: "#a8dadc",
    },
  },
  null,
  2,
);

function App() {
  const [code, setCode] = useState("");
  const [embedHtml, setEmbedHtml] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [theme, setTheme] = useState("default");
  const [themeConfig, setThemeConfig] = useState("");
  const [showThemeConfig, setShowThemeConfig] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [copyMenuOpen, setCopyMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
      return saved === "true";
    } catch {
      return false;
    }
  });
  const [editorWidth, setEditorWidth] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DIVIDER_POS);
      return saved ? parseFloat(saved) : 50;
    } catch {
      return 50;
    }
  });

  const previewRef = useRef(null);
  const svgContainerRef = useRef(null);
  const debounceTimer = useRef(null);
  const themeDebounceTimer = useRef(null);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(50);

  // Sample diagrams
  const samples = {
    flowchart: `flowchart TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    B -->|No| D[End]
    C --> D`,
    sequence: `sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you?
    loop Healthcheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts!
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!`,
    class: `classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal <|-- Zebra
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    Animal: +mate()
    class Duck{
      +String beakColor
      +swim()
      +quack()
    }
    class Fish{
      -int sizeInFeet
      -canEat()
    }
    class Zebra{
      +bool is_wild
      +run()
    }`,
    state: `stateDiagram-v2
    [*] --> Still
    Still --> [*]
    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]`,
    er: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses
    CUSTOMER {
        string name
        string custNumber
        string sector
    }
    ORDER {
        int orderNumber
        string deliveryAddress
    }`,
    journey: `journey
    title My working day
    section Go to work
      Make tea: 5: Me
      Go upstairs: 3: Me
      Do work: 1: Me, Cat
    section Go home
      Go downstairs: 5: Me
      Sit down: 5: Me`,
    gantt: `gantt
    title A Gantt Diagram
    dateFormat YYYY-MM-DD
    section Section
        A task          :a1, 2014-01-01, 30d
        Another task    :after a1, 20d
    section Another
        Task in Another :2014-01-12, 12d
        another task    :24d`,
    pie: `pie title Pets adopted by volunteers
    "Dogs" : 386
    "Cats" : 85
    "Rats" : 15`,
    quadrant: `quadrantChart
    title Reach and engagement of campaigns
    x-axis Low Reach --> High Reach
    y-axis Low Engagement --> High Engagement
    quadrant-1 We should expand
    quadrant-2 Need to promote
    quadrant-3 Re-evaluate
    quadrant-4 May be improved
    Campaign A: [0.3, 0.6]
    Campaign B: [0.45, 0.23]
    Campaign C: [0.57, 0.69]
    Campaign D: [0.78, 0.34]
    Campaign E: [0.40, 0.34]
    Campaign F: [0.35, 0.78]`,
    requirement: `requirementDiagram
    requirement test_req {
        id: 1
        text: the test text.
        risk: high
        verifymethod: test
    }
    element test_entity {
        type: simulation
    }
    test_entity - satisfies -> test_req`,
    gitgraph: `gitGraph
    commit
    commit
    branch develop
    checkout develop
    commit
    commit
    checkout main
    merge develop
    commit`,
    mindmap: `mindmap
  root((mindmap))
    Origins
      Long history
      ::icon(fa fa-book)
      Popularisation
        British popular psychology author Tony Buzan
    Research
      On effectiveness<br/>and features
      On Automatic creation
        Uses
            Creative techniques
            Strategic planning
            Argument mapping
    Tools
      Pen and paper
      Mermaid`,
    timeline: `timeline
    title History of Social Media Platform
    2002 : LinkedIn
    2004 : Facebook
         : Google
    2005 : Youtube
    2006 : Twitter`,
    sankey: `sankey-beta
    Agricultural 'waste',Bio-conversion,124.729
    Bio-conversion,Liquid,0.597
    Bio-conversion,Losses,26.862
    Bio-conversion,Solid,280.322
    Bio-conversion,Gas,81.144`,
    xy: `xychart-beta
    title "Sales Revenue"
    x-axis [jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec]
    y-axis "Revenue (in $)" 4000 --> 11000
    bar [5000, 6000, 7500, 8200, 9500, 10500, 11000, 10200, 9200, 8500, 7000, 6000]
    line [5000, 6000, 7500, 8200, 9500, 10500, 11000, 10200, 9200, 8500, 7000, 6000]`,
    block: `block-beta
    columns 1
    db(("DB"))
    blockArrowId6<["&nbsp;&nbsp;&nbsp;"]>(down)
    block:ID
      A
      B["A wide one in the middle"]
      C
    end
    space
    D
    ID --> D
    C --> D
    style B fill:#969,stroke:#333,stroke-width:4px`,
    kanban: `kanban
    Todo
      [Create Diagram]
      [Design UI]
    In Progress
      [Implement Feature]
    Done
      [Testing]`,
  };

  // URL encoding/decoding functions using pako compression
  const encodeState = (code, theme, themeConfigJson) => {
    const state = { code, theme };
    if (themeConfigJson) {
      state.themeConfig = themeConfigJson;
    }
    const jsonString = JSON.stringify(state);
    // Compress using pako and convert to URL-safe base64
    const compressed = pako.deflate(jsonString, { level: 9 });
    const binString = String.fromCharCode.apply(null, compressed);
    const base64 = btoa(binString);
    // Make URL-safe
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };

  const decodeState = (encoded) => {
    try {
      // Convert from URL-safe base64 back to regular base64
      let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
      // Add padding
      while (base64.length % 4) {
        base64 += "=";
      }
      // Decode from base64 and decompress using pako
      const binString = atob(base64);
      const bytes = new Uint8Array(binString.length);
      for (let i = 0; i < binString.length; i++) {
        bytes[i] = binString.charCodeAt(i);
      }
      const decompressed = pako.inflate(bytes, { to: "string" });
      return JSON.parse(decompressed);
    } catch (e) {
      console.error("Failed to decode state:", e);
      return null;
    }
  };

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
  }, []);

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
      await new Promise((resolve) => setTimeout(resolve, 0));

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

      // Update embed HTML
      const newEmbedHtml = `<!-- Mermaid diagram -->
<div class="mermaid">
${code}
</div>
<script type="module">
  import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
  mermaid.initialize({ startOnLoad: true, theme: "${theme !== "custom" ? theme : "default"}" });
</script>`;

      setEmbedHtml(newEmbedHtml);

      // Auto-fit the diagram
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
    } catch (error) {
      console.error("Mermaid rendering error:", error);
      previewRef.current.innerHTML = `<div style="color: #e53e3e; padding: 20px;">Error rendering diagram. Check your syntax.</div>`;
    }
  }, [code, theme, themeConfig, updateURL]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loadFromURL()) {
        renderDiagram();
      }
    }, 100);

    const handleHashChange = () => {
      if (loadFromURL()) {
        renderDiagram();
      }
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [loadFromURL, renderDiagram]);

  useEffect(() => {
    if (!code.trim()) return; // Don't render if code is empty

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => renderDiagram(), 500);

    return () => clearTimeout(debounceTimer.current);
  }, [code, renderDiagram]);

  useEffect(() => {
    if (!code.trim()) return; // Don't render if code is empty

    clearTimeout(themeDebounceTimer.current);
    themeDebounceTimer.current = setTimeout(() => renderDiagram(), 500);

    return () => clearTimeout(themeDebounceTimer.current);
  }, [code, theme, themeConfig, renderDiagram]);

  useEffect(() => {
    const timer = setTimeout(() => {
      renderDiagram();
    }, 0);
    return () => clearTimeout(timer);
  }, [editorWidth, renderDiagram]);

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

  const handleSampleClick = (sampleType) => {
    if (sampleType && samples[sampleType]) {
      const newCode = samples[sampleType];
      setCode(newCode);
      // Update URL immediately with new code
      const themeConfigValue = theme === "custom" ? themeConfig : null;
      const encoded = encodeState(newCode, theme, themeConfigValue);
      window.history.replaceState(null, "", "#pako:" + encoded);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        alert("Link copied to clipboard!");
      })
      .catch(() => {});
  };

  const handleMouseDown = (e) => {
    if (e.target.closest("svg")) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    },
    [isDragging, dragOffset],
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragOffset, handleMouseMove]);

  const downloadSvg = () => {
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
  };

  const svgToRaster = (type) => {
    const svgEl = previewRef.current?.querySelector("svg");
    if (!svgEl) return;

    const width = svgEl.width.baseVal.value || svgEl.clientWidth || 800;
    const height = svgEl.height.baseVal.value || svgEl.clientHeight || 600;

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

      if (type === "jpg") {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0, width, height);

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
        type === "png" ? "image/png" : "image/jpeg",
        type === "png" ? 1.0 : 0.9,
      );
    };

    img.onerror = () => {
      console.error("Failed to load SVG into image");
    };

    img.src = svgDataUrl;
  };

  const copyEmbedHtml = () => {
    navigator.clipboard.writeText(embedHtml).catch(() => {});
  };

  const copyImage = (type) => {
    const svgEl = previewRef.current?.querySelector("svg");
    if (!svgEl) return;

    const width = svgEl.width.baseVal.value || svgEl.clientWidth || 800;
    const height = svgEl.height.baseVal.value || svgEl.clientHeight || 600;

    const svgClone = svgEl.cloneNode(true);
    svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const svgText = new XMLSerializer().serializeToString(svgClone);

    if (type === "svg") {
      navigator.clipboard.writeText(svgText).catch(() => {});
      return;
    }

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

      if (type === "jpg") {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
        },
        type === "png" ? "image/png" : "image/jpeg",
        type === "png" ? 1.0 : 0.9,
      );
    };

    img.onerror = () => {
      console.error("Failed to load SVG into image");
    };

    img.src = svgDataUrl;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const delta = e.deltaY > 0 ? -0.03 : 0.03; // Slower zoom for better control
    const newScale = Math.max(0.1, Math.min(5, scale + delta));

    // Calculate scale difference to maintain chart center
    const scaleDiff = newScale / scale;

    // Update scale and adjust position to keep chart centered during zoom
    setScale(newScale);
    setPosition({
      x: position.x * scaleDiff,
      y: position.y * scaleDiff,
    });
  };

  const zoomIn = () => {
    const newScale = Math.min(5, scale + 0.2);
    const scaleDiff = newScale / scale;

    setScale(newScale);
    setPosition({
      x: position.x * scaleDiff,
      y: position.y * scaleDiff,
    });
  };

  const zoomOut = () => {
    const newScale = Math.max(0.1, scale - 0.2);
    const scaleDiff = newScale / scale;

    setScale(newScale);
    setPosition({
      x: position.x * scaleDiff,
      y: position.y * scaleDiff,
    });
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    try {
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, newDarkMode.toString());
    } catch (e) {
      console.error("Failed to save dark mode preference:", e);
    }
  };

  // Resize handlers
  const handleResizeStart = (e) => {
    setIsResizing(true);
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = editorWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleResizeMove = (e) => {
      const mainElement = document.querySelector("main");
      if (!mainElement) return;

      const mainWidth = mainElement.offsetWidth;
      const diff = e.clientX - resizeStartX.current;
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

    return () => {
      document.removeEventListener("mousemove", handleResizeMove);
      document.removeEventListener("mouseup", handleResizeEnd);
    };
  }, [isResizing, editorWidth]);

  return (
    <div className={`app ${darkMode ? "dark-mode" : ""}`}>
      <header>
        <h1>Mermaid Live Preview</h1>
        <button
          onClick={toggleDarkMode}
          className="dark-mode-toggle"
          title="Toggle dark mode"
        >
          {darkMode ? (
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
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
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
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </header>

      <main>
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
                    onClick={() => handleSampleClick(type)}
                    className="sample-button"
                  >
                    <Icon type={type} />
                    <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
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
            placeholder="Enter your Mermaid code here..."
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
          {showThemeConfig && (
            <CodeMirror
              value={themeConfig}
              height="80px"
              theme={darkMode ? oneDark : "light"}
              extensions={[javascript(), indentationMarkers()]}
              onChange={(value) => setThemeConfig(value)}
              placeholder='{"theme": "base", "themeVariables": {"primaryColor": "#ff0000"}}'
              basicSetup={{
                lineNumbers: false,
                foldGutter: false,
                highlightActiveLine: false,
              }}
              style={{ borderTop: "1px solid #e2e8f0" }}
            />
          )}
          <div className="controls">
            <div className="dropdown">
              <button
                onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}
                className="dropdown-toggle"
              >
                Download
              </button>
              {downloadMenuOpen && (
                <div className="dropdown-menu">
                  <button onClick={downloadSvg}>SVG</button>
                  <button onClick={() => svgToRaster("png")}>PNG</button>
                  <button onClick={() => svgToRaster("jpg")}>JPG</button>
                </div>
              )}
            </div>
            <div className="dropdown">
              <button
                onClick={() => setCopyMenuOpen(!copyMenuOpen)}
                className="dropdown-toggle"
              >
                Copy
              </button>
              {copyMenuOpen && (
                <div className="dropdown-menu">
                  <button onClick={() => copyImage("svg")}>SVG</button>
                  <button onClick={() => copyImage("png")}>PNG</button>
                  <button onClick={() => copyImage("jpg")}>JPG</button>
                </div>
              )}
            </div>
            <button onClick={handleShare} title="Copy shareable link">
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
              Share
            </button>
          </div>
        </section>

        <div
          className={`resize-handle ${isResizing ? "dragging" : ""}`}
          onMouseDown={handleResizeStart}
        />

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
              onClick={() => setTheme("default")}
              className={theme === "default" ? "active" : ""}
            >
              Default
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={theme === "dark" ? "active" : ""}
            >
              Dark
            </button>
            <button
              onClick={() => setTheme("forest")}
              className={theme === "forest" ? "active" : ""}
            >
              Forest
            </button>
            <button
              onClick={() => setTheme("neutral")}
              className={theme === "neutral" ? "active" : ""}
            >
              Neutral
            </button>
            <button
              onClick={() => setTheme("custom")}
              className={theme === "custom" ? "active" : ""}
            >
              Custom
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
              <button onClick={zoomIn} title="Zoom In">
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
              <button onClick={zoomOut} title="Zoom Out">
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
              <button onClick={resetZoom} title="Reset Zoom">
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
          <div className="embed-container">
            <div className="embed-header">
              <button onClick={copyEmbedHtml}>Copy embed HTML</button>
            </div>
            <textarea id="embed-code" value={embedHtml} readOnly />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
