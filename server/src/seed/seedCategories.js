import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { ensureCategories } from "./categories.js";

await connectDB();
const cats = await ensureCategories();
console.log(`Database "${mongoose.connection.name}" now has ${cats.length} categories. Missing defaults were added; existing categories were not changed.`);
await mongoose.disconnect();
