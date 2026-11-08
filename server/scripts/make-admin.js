import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import { User } from "../src/models/index.js";

const email = (process.argv[2] || "").trim().toLowerCase();
if (!email) {
  console.error("Usage: npm run make-admin -- user@example.com");
  process.exit(1);
}

await connectDB();
const user = await User.findOne({ email });
if (!user) {
  console.error(`No user with email ${email} in database "${mongoose.connection.name}". Register the account first.`);
  await mongoose.disconnect();
  process.exit(1);
}

console.log(`\nDatabase: ${mongoose.connection.name}\nUser:     ${user.firstName} ${user.lastName} <${user.email}> (current role: ${user.role})`);
if (user.role === "admin") {
  console.log("Already an admin. Nothing to do.");
  await mongoose.disconnect();
  process.exit(0);
}

const rl = readline.createInterface({ input, output });
const answer = await rl.question("\nType the email again to make this user an ADMIN: ");
rl.close();
if (answer.trim().toLowerCase() !== email) {
  console.log("Email did not match. Nothing was changed.");
} else {
  await User.updateOne({ _id: user._id }, { role: "admin" });
  console.log("Done. Log out and back in to see the admin panel.");
}
await mongoose.disconnect();