import { useState, useEffect } from "react";
import { STORAGE_KEYS } from "../utils/constants";

const useUIState = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isResizing, setIsResizing] = useState(false);
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [copyMenuOpen, setCopyMenuOpen] = useState(false);
  const [imageSize, setImageSize] = useState(4096);
  const [editorWidth, setEditorWidth] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DIVIDER_POS);
      return saved ? parseFloat(saved) : 50;
    } catch {
      return 50;
    }
  });

  const [hasManuallyAdjusted, setHasManuallyAdjusted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editorHeight, setEditorHeight] = useState(120);

  const [backgroundColor, setBackgroundColor] = useState("#ffffff");

  // Initialize showSamples from localStorage (collapsed by default on mobile)
  const [showSamples, setShowSamples] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHOW_SAMPLES);
      if (saved !== null) {
        return saved === "true";
      }
      // Default: collapsed on mobile (width <= 768px), open on desktop
      return window.innerWidth > 768;
    } catch {
      return window.innerWidth > 768;
    }
  });

  // Persist showSamples to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SHOW_SAMPLES, showSamples.toString());
    } catch (e) {
      console.error("Failed to save showSamples preference:", e);
    }
  }, [showSamples]);

  return {
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
  };
};

export default useUIState;
