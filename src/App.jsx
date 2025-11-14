import { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import pako from 'pako';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { indentationMarkers } from '@replit/codemirror-indentation-markers';
import './App.css';

// LocalStorage keys
const STORAGE_KEYS = {
  CODE: 'mermaid_code',
  THEME: 'mermaid_theme',
  THEME_CONFIG: 'mermaid_theme_config',
  DIVIDER_POS: 'mermaid_divider_position',
  DARK_MODE: 'mermaid_dark_mode'
};

// Default custom theme JSON template
const DEFAULT_CUSTOM_THEME = JSON.stringify({
  theme: 'base',
  themeVariables: {
    primaryColor: '#ff6b6b',
    primaryTextColor: '#fff',
    primaryBorderColor: '#ff5252',
    lineColor: '#4ecdc4',
    secondaryColor: '#ffe66d',
    tertiaryColor: '#a8dadc'
  }
}, null, 2);

function App() {
  const [code, setCode] = useState('');
  const [embedHtml, setEmbedHtml] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [theme, setTheme] = useState('default');
  const [themeConfig, setThemeConfig] = useState('');
  const [showThemeConfig, setShowThemeConfig] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
      return saved === 'true';
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
      [Testing]`
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
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };

  const decodeState = (encoded) => {
    try {
      // Convert from URL-safe base64 back to regular base64
      let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
      // Add padding
      while (base64.length % 4) {
        base64 += '=';
      }
      // Decode from base64 and decompress using pako
      const binString = atob(base64);
      const bytes = new Uint8Array(binString.length);
      for (let i = 0; i < binString.length; i++) {
        bytes[i] = binString.charCodeAt(i);
      }
      const decompressed = pako.inflate(bytes, { to: 'string' });
      return JSON.parse(decompressed);
    } catch (e) {
      console.error('Failed to decode state:', e);
      return null;
    }
  };

  const updateURL = () => {
    if (!code.trim()) return; // Don't update URL if no code

    const themeConfigValue = theme === 'custom' ? themeConfig : null;
    const encoded = encodeState(code, theme, themeConfigValue);
    window.history.replaceState(null, '', '#pako:' + encoded);

    // Also save to localStorage
    saveToLocalStorage();
  };

  const saveToLocalStorage = () => {
    try {
      if (code.trim()) {
        localStorage.setItem(STORAGE_KEYS.CODE, code);
      }
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, darkMode.toString());
      if (theme === 'custom' && themeConfig) {
        localStorage.setItem(STORAGE_KEYS.THEME_CONFIG, themeConfig);
      } else {
        localStorage.removeItem(STORAGE_KEYS.THEME_CONFIG);
      }
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  };

  const loadFromURL = () => {
    const hash = window.location.hash;

    if (hash.startsWith('#pako:')) {
      // Load from hash with pako compression
      const encoded = hash.substring(6); // Remove '#pako:' prefix
      const state = decodeState(encoded);
      if (state) {
        setCode(state.code || '');
        setTheme(state.theme || 'default');
        if (state.themeConfig) {
          setThemeConfig(state.themeConfig);
          setShowThemeConfig(true);
        }
        return true;
      } else {
        // Failed to decode, clear invalid hash
        window.history.replaceState(null, '', window.location.pathname);
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
      if (savedThemeConfig && savedTheme === 'custom') {
        setThemeConfig(savedThemeConfig);
        setShowThemeConfig(true);
      }

      return !!savedCode;
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
      return false;
    }
  };

  const initializeMermaid = (selectedTheme, configObj) => {
    const config = {
      startOnLoad: false,
      securityLevel: 'strict',
      theme: selectedTheme
    };

    if (configObj) {
      Object.assign(config, configObj);
    }

    mermaid.initialize(config);
  };

  const renderDiagram = async () => {
    if (!code.trim() || !previewRef.current) return;

    try {
      // Apply theme before rendering
      let themeConfigObj = null;
      if (theme === 'custom' && themeConfig) {
        try {
          themeConfigObj = JSON.parse(themeConfig);
        } catch (e) {
          console.error('Invalid theme JSON:', e);
        }
      }
      initializeMermaid(theme === 'custom' ? (themeConfigObj?.theme || 'default') : theme, themeConfigObj);

      // Clear previous content
      previewRef.current.innerHTML = `<div class="mermaid" id="diagram-target">${code}</div>`;

      // Wait for next tick to ensure DOM is updated
      await new Promise(resolve => setTimeout(resolve, 0));

      // Check if element exists before rendering
      const diagramElement = document.getElementById('diagram-target');
      if (!diagramElement) {
        console.error('Diagram target element not found');
        return;
      }

      // Render with Mermaid
      await mermaid.run({ querySelector: '#diagram-target' });

      // Update URL
      updateURL();

      // Update embed HTML
      const newEmbedHtml = `<!-- Mermaid diagram -->
<div class="mermaid">
${code}
</div>
<script type="module">
  import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
  mermaid.initialize({ startOnLoad: true, theme: "${theme !== 'custom' ? theme : 'default'}" });
<\/script>`;

      setEmbedHtml(newEmbedHtml);

      // Reset position and scale when new diagram is rendered
      setPosition({ x: 0, y: 0 });
      setScale(1);
    } catch (error) {
      console.error('Mermaid rendering error:', error);
      previewRef.current.innerHTML = `<div style="color: #e53e3e; padding: 20px;">Error rendering diagram. Check your syntax.</div>`;
    }
  };

  useEffect(() => {
    const hasData = loadFromURL();
    let timer;

    // Only render if we have data to render (from URL or localStorage)
    if (hasData) {
      // Delay initial render slightly to ensure Mermaid is fully ready
      timer = setTimeout(() => {
        renderDiagram();
      }, 100);
    }

    // Listen for hash changes (when user edits URL and presses Enter)
    const handleHashChange = () => {
      if (loadFromURL()) {
        renderDiagram();
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    if (!code.trim()) return; // Don't render if code is empty

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(renderDiagram, 500);

    return () => clearTimeout(debounceTimer.current);
  }, [code]);

  useEffect(() => {
    if (!code.trim()) return; // Don't render if code is empty

    clearTimeout(themeDebounceTimer.current);
    themeDebounceTimer.current = setTimeout(renderDiagram, 500);

    return () => clearTimeout(themeDebounceTimer.current);
  }, [theme, themeConfig]);

  useEffect(() => {
    const trimmed = code.trim();
    const firstToken = trimmed.split(/\s+/)[0]?.toLowerCase() || '';
    const labelMap = {
      flowchart: 'Flowchart Diagram',
      'flowcharttd': 'Flowchart Diagram',
      sequencediagram: 'Sequence Diagram',
      classdiagram: 'Class Diagram',
      statediagram: 'State Diagram',
      'statediagram-v2': 'State Diagram',
      erdiagram: 'ER Diagram',
      journey: 'User Journey',
      gantt: 'Gantt Chart',
      pie: 'Pie Chart',
      quadrantchart: 'Quadrant Chart',
      requirementdiagram: 'Requirement Diagram',
      gitgraph: 'Git Graph',
      mindmap: 'Mind Map',
      timeline: 'Timeline Diagram',
      'sankey-beta': 'Sankey Diagram',
      'xychart-beta': 'XY Chart',
      'block-beta': 'Block Diagram',
      kanban: 'Kanban Board'
    };
    const diagramLabel = labelMap[firstToken] || 'Mermaid Diagram';
    const title = `${diagramLabel} | Mermaid Live Preview`;
    const description = `Create and share ${diagramLabel.toLowerCase()}s using a fast React + Vite Mermaid editor with themes, samples, and shareable URLs.`;

    const updateMeta = (selector, value, attribute = 'content') => {
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
    updateMeta('link[rel="canonical"]', currentUrl, 'href');
  }, [code, theme]);

  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    setTheme(newTheme);
    setShowThemeConfig(newTheme === 'custom');
    // Set predefined custom theme JSON when switching to custom
    if (newTheme === 'custom' && !themeConfig) {
      setThemeConfig(DEFAULT_CUSTOM_THEME);
    }
  };

  const handleSampleChange = (e) => {
    const sampleType = e.target.value;
    if (sampleType && samples[sampleType]) {
      const newCode = samples[sampleType];
      setCode(newCode);
      // Update URL immediately with new code
      const themeConfigValue = theme === 'custom' ? themeConfig : null;
      const encoded = encodeState(newCode, theme, themeConfigValue);
      window.history.replaceState(null, '', '#pako:' + encoded);
      // Reset selection to placeholder
      e.target.value = '';
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    }).catch(() => {});
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('svg')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const downloadSvg = () => {
    const svgEl = previewRef.current?.querySelector('svg');
    if (!svgEl) return;

    const svgText = svgEl.outerHTML;
    const blob = new Blob([svgText], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const svgToRaster = (type) => {
    const svgEl = previewRef.current?.querySelector('svg');
    if (!svgEl) return;

    const width = svgEl.width.baseVal.value || svgEl.clientWidth || 800;
    const height = svgEl.height.baseVal.value || svgEl.clientHeight || 600;

    const svgClone = svgEl.cloneNode(true);
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const svgText = new XMLSerializer().serializeToString(svgClone);

    // Convert SVG to base64 using TextEncoder
    const bytes = new TextEncoder().encode(svgText);
    const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join('');
    const svgDataUrl = 'data:image/svg+xml;base64,' + btoa(binString);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');

      if (type === 'jpg') {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blobOut) => {
          if (!blobOut) return;
          const outUrl = URL.createObjectURL(blobOut);
          const a = document.createElement('a');
          a.href = outUrl;
          a.download = `diagram.${type}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(outUrl);
        },
        type === 'png' ? 'image/png' : 'image/jpeg',
        type === 'png' ? 1.0 : 0.9
      );
    };

    img.onerror = () => {
      console.error('Failed to load SVG into image');
    };

    img.src = svgDataUrl;
  };

  const copyEmbedHtml = () => {
    navigator.clipboard.writeText(embedHtml).catch(() => {});
  };

  const handleWheel = (e) => {
    e.preventDefault();

    const delta = e.deltaY > 0 ? -0.03 : 0.03; // Slower zoom for better control
    const newScale = Math.max(0.1, Math.min(5, scale + delta));

    // Calculate scale difference to maintain chart center
    const scaleDiff = newScale / scale;

    // Update scale and adjust position to keep chart centered during zoom
    setScale(newScale);
    setPosition({
      x: position.x * scaleDiff,
      y: position.y * scaleDiff
    });
  };

  const zoomIn = () => {
    const newScale = Math.min(5, scale + 0.2);
    const scaleDiff = newScale / scale;

    setScale(newScale);
    setPosition({
      x: position.x * scaleDiff,
      y: position.y * scaleDiff
    });
  };

  const zoomOut = () => {
    const newScale = Math.max(0.1, scale - 0.2);
    const scaleDiff = newScale / scale;

    setScale(newScale);
    setPosition({
      x: position.x * scaleDiff,
      y: position.y * scaleDiff
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
      console.error('Failed to save dark mode preference:', e);
    }
  };

  // Resize handlers
  const handleResizeStart = (e) => {
    setIsResizing(true);
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = editorWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleResizeMove = (e) => {
      const mainElement = document.querySelector('main');
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
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      // Save divider position to localStorage
      try {
        localStorage.setItem(STORAGE_KEYS.DIVIDER_POS, editorWidth.toString());
      } catch (e) {
        console.error('Failed to save divider position:', e);
      }
    };

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);

    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isResizing]);

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      <header>
        <h1>Mermaid Live Preview</h1>
        <button onClick={toggleDarkMode} className="dark-mode-toggle" title="Toggle dark mode">
          {darkMode ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
      </header>

      <main>
        <section className="editor" style={{ flexBasis: `${editorWidth}%`, flexGrow: 0, flexShrink: 0 }}>
          <div className="theme-selector">
            <div>
              <label htmlFor="sample-select">Sample:</label>
              <select id="sample-select" onChange={handleSampleChange} defaultValue="">
                <option value="">Select a diagram...</option>
                <option value="flowchart">Flowchart</option>
                <option value="sequence">Sequence Diagram</option>
                <option value="class">Class Diagram</option>
                <option value="state">State Diagram</option>
                <option value="er">Entity Relationship</option>
                <option value="journey">User Journey</option>
                <option value="gantt">Gantt</option>
                <option value="pie">Pie Chart</option>
                <option value="quadrant">Quadrant Chart</option>
                <option value="requirement">Requirement Diagram</option>
                <option value="gitgraph">GitGraph</option>
                <option value="mindmap">Mindmap</option>
                <option value="timeline">Timeline</option>
                <option value="sankey">Sankey</option>
                <option value="xy">XY Chart</option>
                <option value="block">Block Diagram</option>
                <option value="kanban">Kanban</option>
              </select>
            </div>
            <div>
              <label htmlFor="theme-select">Theme:</label>
              <select id="theme-select" value={theme} onChange={handleThemeChange}>
                <option value="default">Default</option>
                <option value="dark">Dark</option>
                <option value="forest">Forest</option>
                <option value="neutral">Neutral</option>
                <option value="custom">Custom JSON</option>
              </select>
            </div>
          </div>
          <CodeMirror
            value={code}
            height="100%"
            theme={darkMode ? oneDark : 'light'}
            extensions={[javascript(), indentationMarkers()]}
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
            style={{ flex: 1, overflow: 'auto' }}
          />
          {showThemeConfig && (
            <CodeMirror
              value={themeConfig}
              height="80px"
              theme={darkMode ? oneDark : 'light'}
              extensions={[javascript(), indentationMarkers()]}
              onChange={(value) => setThemeConfig(value)}
              placeholder='{"theme": "base", "themeVariables": {"primaryColor": "#ff0000"}}'
              basicSetup={{
                lineNumbers: false,
                foldGutter: false,
                highlightActiveLine: false,
              }}
              style={{ borderTop: '1px solid #e2e8f0' }}
            />
          )}
          <div className="controls">
            <button onClick={downloadSvg}>Download SVG</button>
            <button onClick={() => svgToRaster('png')}>Download PNG</button>
            <button onClick={() => svgToRaster('jpg')}>Download JPG</button>
            <button onClick={handleShare} title="Copy shareable link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              Share
            </button>
          </div>
        </section>

        <div
          className={`resize-handle ${isResizing ? 'dragging' : ''}`}
          onMouseDown={handleResizeStart}
        />

        <section className="preview-container" style={{ flexBasis: `${100 - editorWidth}%`, flexGrow: 0, flexShrink: 0 }}>
          <div
            className={`preview ${isDragging ? 'dragging' : ''}`}
            onMouseDown={handleMouseDown}
            onWheel={handleWheel}
            ref={svgContainerRef}
          >
            <div
              ref={previewRef}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
            />
            <div className="zoom-controls">
              <button onClick={zoomIn} title="Zoom In">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                  <line x1="11" y1="8" x2="11" y2="14"/>
                  <line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
              </button>
              <button onClick={zoomOut} title="Zoom Out">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                  <line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
              </button>
              <button onClick={resetZoom} title="Reset Zoom">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10"/>
                  <polyline points="1 20 1 14 7 14"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
              </button>
            </div>
          </div>
          <div className="embed-container">
            <div className="embed-header">
              <label htmlFor="embed-code">Embed HTML:</label>
              <button onClick={copyEmbedHtml}>Copy embed HTML</button>
            </div>
            <textarea
              id="embed-code"
              value={embedHtml}
              readOnly
            />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
