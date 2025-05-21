import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../../style.css";
import App from "./App";

const rootElement = document.createElement("div");
rootElement.id = "root";
document.body.appendChild(rootElement);
document.body.style.overflow = "hidden";

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
