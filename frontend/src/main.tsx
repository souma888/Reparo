import "@fontsource-variable/dm-sans";
import "@fontsource/libre-caslon-display/latin-400.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import "./workspace-extra.css";
import "./camera.css";
import "./improvements.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
