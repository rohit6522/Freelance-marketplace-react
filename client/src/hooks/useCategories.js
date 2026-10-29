import { useEffect, useState } from "react";
import { categoryService } from "../services/categoryService";

let cache = null; // categories rarely change, so fetch once per page load

export function useCategories() {
  const [categories, setCategories] = useState(cache || []);

  useEffect(() => {
    if (cache) return;
    let active = true;
    categoryService
      .list()
      .then((list) => {
        cache = list;
        if (active) setCategories(list);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return categories;
}