import { useState } from "react";

const useMermaidCode = () => {
  const [code, setCode] = useState("");
  const [embedHtml, setEmbedHtml] = useState("");

  return {
    code,
    setCode,
    embedHtml,
    setEmbedHtml,
  };
};

export default useMermaidCode;
