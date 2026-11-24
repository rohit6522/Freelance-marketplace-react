import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import "./index.css";
import { FavoritesProvider } from "./contexts/FavoritesContext.jsx";
import { RealtimeProvider } from "./contexts/RealtimeContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <RealtimeProvider>
            <FavoritesProvider>
              <App />
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    borderRadius: 0,
                    border: "1px solid var(--color-outline-variant, #0b1c30)",
                    boxShadow: "2px 2px 0 var(--color-outline, #0b1c30)",
                    background: "var(--color-surface-container-lowest, #ffffff)",
                    color: "var(--color-on-surface, #0b1c30)",
                    fontFamily: "Geist, sans-serif",
                    fontSize: "0.875rem",
                  },
                  success: { iconTheme: { primary: "#005d42", secondary: "#ffffff" } },
                }}
              />
            </FavoritesProvider>
          </RealtimeProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);

// Register PWA Service Worker in supported browsers
if (typeof window !== "undefined" && "serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("PWA Service worker registration failed:", err);
    });
  });
}