import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: 0,
              border: "1px solid #0b1c30",
              boxShadow: "2px 2px 0 #0b1c30",
              background: "#ffffff",
              color: "#0b1c30",
              fontFamily: "Geist, sans-serif",
              fontSize: "0.875rem",
            },
            success: { iconTheme: { primary: "#005d42", secondary: "#ffffff" } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);