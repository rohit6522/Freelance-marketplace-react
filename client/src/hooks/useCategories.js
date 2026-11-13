import { useEffect, useState } from "react";
import { categoryService } from "../services/categoryService";

const TTL_MS = 5 * 60 * 1000;
let cache = null;
let loadedAt = 0;
let inflight = null;
const listeners = new Set();

function load() {
  if (!inflight) {
    inflight = categoryService
      .list()
      .then((list) => {
        cache = list;
        loadedAt = Date.now();
        listeners.forEach((fn) => fn(list));
        return list;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

// Call after an admin changes categories so the navbar, filters and forms update straight away
export const refreshCategories = () => load().catch(() => {});

export function useCategories() {
  const [categories, setCategories] = useState(cache || []);

  useEffect(() => {
    listeners.add(setCategories);
    if (!cache || Date.now() - loadedAt > TTL_MS) load().catch(() => {});
    return () => listeners.delete(setCategories);
  }, []);

  return categories;
}