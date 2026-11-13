import { Category } from "../models/index.js";
import { slugify } from "../utils/slugify.js";

export const CATEGORY_DEFS = [
  ["Web Development", "code"],
  ["Graphics & Design", "palette"],
  ["Writing & Translation", "edit_note"],
  ["Digital Marketing", "campaign"],
  ["Video & Animation", "movie"],
  ["Data & AI", "neurology"],
  ["Programming & Technology", "terminal"],
  ["Business", "business_center"],
];

// Adds any missing default category. Existing categories, including ones an admin renamed or reordered, are never changed.
export async function ensureCategories() {
  await Category.bulkWrite(
    CATEGORY_DEFS.map(([name, icon], i) => ({
      updateOne: {
        filter: { slug: slugify(name) },
        update: { $setOnInsert: { name, icon, sortOrder: i } },
        upsert: true,
      },
    }))
  );
  return Category.find().sort({ sortOrder: 1, name: 1 });
}