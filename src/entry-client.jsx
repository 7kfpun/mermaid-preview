import { StrictMode, Suspense } from "react";
import { hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "./i18n";
import AppRouter from "./AppRouter.jsx";

hydrateRoot(
  document.getElementById("root"),
  <StrictMode>
    <Suspense fallback={<div></div>}>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </Suspense>
  </StrictMode>
);
