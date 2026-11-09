// Prefix risky cells so spreadsheet apps never run them as formulas (CSV injection)
const safe = (v) => {
  const s = String(v ?? "");
  return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
};

export function toCsv(rows) {
  return rows.map((r) => r.map((c) => `"${safe(c).replace(/"/g, '""')}"`).join(",")).join("\n");
}

export function downloadCsv(filename, rows) {
  const url = URL.createObjectURL(new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}