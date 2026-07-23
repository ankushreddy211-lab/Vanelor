import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "../lib/ThemeProvider";
import { StyleGuide } from "./App";
import "../css/globals.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <StyleGuide />
    </ThemeProvider>
  </StrictMode>
);
