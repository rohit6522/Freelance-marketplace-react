import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { ensureCategories } from "./categories.js";

await connectDB();
const cats = await ensureCategories();
console.log(`Database "${mongoose.connection.name}" now has ${cats.length} categories. Nothing else was changed.`);
await mongoose.disconnect();