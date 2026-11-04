import { Category } from "../models/index.js";

const slugify = (s) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

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

export async function ensureCategories() {
  await Category.bulkWrite(
    CATEGORY_DEFS.map(([name, icon], i) => ({
      updateOne: {
        filter: { slug: slugify(name) },
        update: { $set: { name, icon, sortOrder: i } },
        upsert: true,
      },
    }))
  );
  return Category.find().sort({ sortOrder: 1 });
}