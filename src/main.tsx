import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// App-wide security: disable right-click
document.addEventListener("contextmenu", (e) => e.preventDefault());

// App-wide security: disable developer tools shortcuts
document.addEventListener("keydown", (e) => {
  // F12
  if (e.key === "F12") { e.preventDefault(); return; }
  // Ctrl+Shift+I (Inspect)
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "I") { e.preventDefault(); return; }
  // Ctrl+Shift+J (Console)
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "J") { e.preventDefault(); return; }
  // Ctrl+Shift+C (Element picker)
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "C") { e.preventDefault(); return; }
  // Ctrl+U (View source)
  if ((e.ctrlKey || e.metaKey) && e.key === "u") { e.preventDefault(); return; }
});

createRoot(document.getElementById("root")!).render(<App />);
