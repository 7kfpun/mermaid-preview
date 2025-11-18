import pako from "pako";

export const encodeState = (code, theme, themeConfigJson) => {
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

export const decodeState = (encoded) => {
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
