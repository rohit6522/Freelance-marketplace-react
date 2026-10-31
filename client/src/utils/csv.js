// Prefix risky cells so spreadsheet apps never run them as formulas (CSV injection)
const safe = (v) => {
  const s = String(v ?? "");
  return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
};

export function downloadCsv(filename, rows) {
  const csv = rows.map((r) => r.map((c) => `"${safe(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}