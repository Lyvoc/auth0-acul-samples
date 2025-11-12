import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import App from "./App";

const rootElement = document.createElement("div");
rootElement.id = "root";
document.body.appendChild(rootElement);

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
