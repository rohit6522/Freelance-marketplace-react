import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { groups } from "../docs/endpoints.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../../docs");
fs.mkdirSync(outDir, { recursive: true });

const AUTH = { public: "Public", user: "Logged in", client: "Client only", freelancer: "Freelancer only" };
const docPath = (p) => p.replace(/\{\{(\w+)\}\}/g, ":$1");
const asList = (v) => (v == null ? [] : Array.isArray(v[0]) ? v : [v]);

// ---------- Markdown ----------
let md = `# GigCraft API Reference

_Generated from \`server/docs/endpoints.js\` with \`npm run docs\` in \`server/\`._

**Base URL:** \`http://localhost:5000/api\`

## Conventions

- **Auth:** a JWT is stored in an httpOnly cookie named \`token\` after \`/auth/register\` or \`/auth/login\`. Send requests with credentials (Postman keeps cookies automatically). \`Authorization: Bearer <token>\` is also accepted.
- **Success:** \`{ "success": true, ... }\`.
- **Errors:** \`{ "success": false, "message": "...", "details": [{ "field": "...", "message": "..." }] }\` (\`details\` appears for validation errors).
- **Pagination:** list endpoints take \`page\` and \`limit\` and return \`pagination: { page, limit, total, pages }\`.
- **Payments are simulated.** No real money moves; payment records have \`isSimulated: true\`.

| Status | Meaning |
|---|---|
| 200 / 201 | OK / Created |
| 400 | Validation error or invalid input |
| 401 | Not logged in, or invalid/expired session |
| 403 | Logged in but not allowed (wrong role or not the owner) |
| 404 | Not found (also used for resources you are not a participant of) |
| 409 | Conflict: duplicate, or invalid state transition |
| 413 | Uploaded file too large |
| 429 | Rate limit hit |
| 503 | Uploads not configured (Cloudinary credentials missing) |

## Order status transitions

| From | To | Who |
|---|---|---|
| pending | in_progress | freelancer (accept) |
| pending | cancelled | client or freelancer |
| in_progress | delivered | freelancer |
| in_progress | cancelled | freelancer |
| delivered | completed | client (releases escrow) |
| delivered | revision_requested | client |
| revision_requested | delivered | freelancer |
| revision_requested | cancelled | freelancer |

`;

for (const g of groups) {
  md += `## ${g.name}\n\n| Method | Endpoint | Access | Description |\n|---|---|---|---|\n`;
  for (const e of g.items) md += `| \`${e.method}\` | \`${docPath(e.path)}\` | ${AUTH[e.auth]} | ${e.summary} |\n`;
  md += "\n";
  for (const e of g.items) {
    if (!e.body && !e.query && !e.notes) continue;
    md += `**\`${e.method} ${docPath(e.path)}\`**\n\n`;
    if (e.notes) md += `${e.notes}\n\n`;
    if (e.query) md += `Query parameters:\n\n\`\`\`json\n${JSON.stringify(e.query, null, 2)}\n\`\`\`\n\n`;
    if (e.body) md += `Example body:\n\n\`\`\`json\n${JSON.stringify(e.body, null, 2).replace(/\{\{(\w+)\}\}/g, "<$1>")}\n\`\`\`\n\n`;
  }
}
fs.writeFileSync(path.join(outDir, "API.md"), md);

// ---------- Postman collection ----------
const toItem = (e) => {
  const [pathPart, queryPart] = e.path.split("?");
  const query = queryPart ? queryPart.split("&").map((kv) => { const [key, value = ""] = kv.split("="); return { key, value }; }) : [];
  Object.entries(e.query || {}).forEach(([key, value]) => query.push({ key, value: String(value), disabled: true }));
  const enabled = query.filter((q) => !q.disabled).map((q) => `${q.key}=${q.value}`).join("&");

  const request = {
    method: e.method,
    header: e.body ? [{ key: "Content-Type", value: "application/json" }] : [],
    url: {
      raw: `{{baseUrl}}${pathPart}${enabled ? `?${enabled}` : ""}`,
      host: ["{{baseUrl}}"],
      path: pathPart.split("/").filter(Boolean),
      query,
    },
    description: `${e.summary}\n\nAccess: ${AUTH[e.auth]}${e.notes ? `\n\n${e.notes}` : ""}`,
  };
  if (e.body) request.body = { mode: "raw", raw: JSON.stringify(e.body, null, 2), options: { raw: { language: "json" } } };
  if (e.upload) request.body = { mode: "formdata", formdata: [{ key: e.upload, type: "file", src: [] }] };

  const item = { name: `${e.method} ${docPath(pathPart)}`, request };
  if (e.save) {
    item.event = [{
      listen: "test",
      script: {
        type: "text/javascript",
        exec: [
          "let json = {}; try { json = pm.response.json(); } catch (e) {}",
          ...asList(e.save).map(([name, from]) =>
            `{ const v = ${JSON.stringify(from)}.split(".").reduce((o, k) => (o ? o[k] : undefined), json); if (v) pm.collectionVariables.set(${JSON.stringify(name)}, v); }`
          ),
        ],
      },
    }];
  }
  return item;
};

const variableNames = [...new Set([...JSON.stringify(groups).matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]))];
const collection = {
  info: {
    name: "GigCraft API",
    description: "Generated from server/docs/endpoints.js. Log in first; Postman stores the auth cookie. Ids are saved into collection variables automatically.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  item: groups.map((g) => ({ name: g.name, item: g.items.map(toItem) })),
  variable: [{ key: "baseUrl", value: "http://localhost:5000/api" }, ...variableNames.map((key) => ({ key, value: "" }))],
};
fs.writeFileSync(path.join(outDir, "GigCraft.postman_collection.json"), JSON.stringify(collection, null, 2));

console.log(`Wrote ${path.join(outDir, "API.md")} and GigCraft.postman_collection.json`);