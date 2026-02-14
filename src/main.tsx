import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/globals.css";
import "./lib/theme"; // init dark/light mode

console.log('%c ◆ NOTEVA ◆ ', 'background: #c25b3f; color: #f0e6d3; font-size: 20px; font-weight: bold; padding: 8px 16px; font-family: monospace;');
console.log('%c🎮 Pixel Art Theme v1.0.0', 'color: #8b7966; font-size: 12px; font-family: monospace;');

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
