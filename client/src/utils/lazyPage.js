import { lazy } from "react";

const KEY = "chunk-reload";

// React.lazy with one automatic reload when a chunk can't be fetched.
// After a new deploy, an open tab still points at old file names that no longer exist.
export function lazyPage(importer) {
  return lazy(async () => {
    try {
      const mod = await importer();
      sessionStorage.removeItem(KEY);
      return mod;
    } catch (err) {
      if (!sessionStorage.getItem(KEY)) {
        sessionStorage.setItem(KEY, "1");
        window.location.reload();
        return new Promise(() => {}); // keep showing the loader while the page reloads
      }
      sessionStorage.removeItem(KEY);
      throw err; // second failure: let the error boundary show a message
    }
  });
}