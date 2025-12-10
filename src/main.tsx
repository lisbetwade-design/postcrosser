import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

const basename = import.meta.env.BASE_URL;

// Suppress Supabase health check endpoint logs in console
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    // Filter out Supabase health check endpoint messages
    if (
      message.includes('/rest-admin/v1/ready') ||
      message.includes('@supabase-infra/mgmt-api')
    ) {
      return; // Suppress these messages
    }
    originalError.apply(console, args);
  };
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
