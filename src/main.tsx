import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

const basename = import.meta.env.BASE_URL;

// Suppress non-critical errors in console
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
    // Filter out 502 errors from external resources
    if (
      message.includes('502') ||
      message.includes('Bad Gateway')
    ) {
      // Only suppress if it's from an external resource
      if (
        message.includes('storage.googleapis.com') ||
        message.includes('tempo') ||
        message.includes('fonts.googleapis.com') ||
        message.includes('canvases.tempo.build')
      ) {
        return; // Suppress external resource 502 errors
      }
    }
    originalError.apply(console, args);
  };

  // Suppress 502 errors from external resources (images, fonts, etc.)
  window.addEventListener('error', (event) => {
    // Suppress 502 errors from external resources
    if (
      event.message?.includes('502') ||
      (event.target && (event.target as HTMLElement).tagName === 'IMG' && event.message?.includes('Failed to load'))
    ) {
      // Check if it's an external resource (not from our domain)
      const target = event.target as HTMLImageElement | HTMLLinkElement;
      if (target && target.src) {
        const url = new URL(target.src, window.location.href);
        // Only suppress if it's an external resource
        if (url.origin !== window.location.origin) {
          event.preventDefault();
          return false;
        }
      }
    }
  }, true);

  // Suppress unhandled promise rejections for 502 errors
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || String(event.reason || '');
    // Suppress 502 errors from external resources
    if (message.includes('502') || message.includes('Bad Gateway')) {
      // Check if it's from an external resource
      const stack = event.reason?.stack || '';
      if (stack.includes('storage.googleapis.com') || 
          stack.includes('tempo') ||
          stack.includes('fonts.googleapis.com')) {
        event.preventDefault();
        return false;
      }
    }
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
