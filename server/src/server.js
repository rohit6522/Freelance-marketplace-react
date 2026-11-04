import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";

const start = async () => {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
  });
};

start().catch((err) => {
  console.error("Startup failed:", err.message);
  process.exitCode = 1; // lets the log flush before the process ends
});