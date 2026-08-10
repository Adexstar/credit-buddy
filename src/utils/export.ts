export type ExportFormat = "csv" | "json" | "xlsx" | "pdf";

export interface ExportOptions {
  format: ExportFormat;
  dateRange?: string;
  includeHeaders?: boolean;
}

export type Row = Record<string, unknown>;

function cell(value: unknown) {
  if (value === null || value === undefined) return "";
  const str = typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function downloadFile(content: string | Blob, filename: string, mimeType: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function toCSV(data: Row[], includeHeaders = true) {
  if (!data.length) throw new Error("No data to export");
  const headers = Object.keys(data[0]!);
  const lines = data.map((row) => headers.map((h) => cell(row[h])).join(","));
  return (includeHeaders ? [headers.join(","), ...lines] : lines).join("\n");
}

export function exportToCSV(data: Row[], filename: string, includeHeaders = true) {
  downloadFile(toCSV(data, includeHeaders), `${filename}.csv`, "text/csv;charset=utf-8");
}

export function exportToJSON(data: Row[], filename: string) {
  if (!data.length) throw new Error("No data to export");
  downloadFile(JSON.stringify(data, null, 2), `${filename}.json`, "application/json");
}

/** Excel opens tab-separated .xls-compatible content without extra dependencies. */
export function exportToXLSX(data: Row[], filename: string) {
  if (!data.length) throw new Error("No data to export");
  const headers = Object.keys(data[0]!);
  const html = `<table><thead><tr>${headers
    .map((h) => `<th>${h}</th>`)
    .join("")}</tr></thead><tbody>${data
    .map((row) => `<tr>${headers.map((h) => `<td>${String(row[h] ?? "")}</td>`).join("")}</tr>`)
    .join("")}</tbody></table>`;
  downloadFile(html, `${filename}.xls`, "application/vnd.ms-excel");
}

export function generatePrintHTML(data: Row[], title = "Credit Bank Export") {
  const headers = Object.keys(data[0] ?? {});
  return `<!doctype html><html><head><title>${title}</title><style>
    body{font-family:ui-sans-serif,system-ui,Arial;padding:40px;color:#0f172a}
    h1{color:#0f766e;margin:0 0 4px}
    p{color:#64748b;margin:0 0 24px;font-size:13px}
    table{width:100%;border-collapse:collapse;font-size:12px}
    th,td{padding:8px 10px;text-align:left;border-bottom:1px solid #e2e8f0}
    th{background:#f1f5f9;font-weight:600;text-transform:uppercase;font-size:11px;letter-spacing:.04em}
  </style></head><body><h1>${title}</h1><p>Generated ${new Date().toLocaleString()}</p>
  <table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
  <tbody>${data
    .map((row) => `<tr>${headers.map((h) => `<td>${String(row[h] ?? "")}</td>`).join("")}</tr>`)
    .join("")}</tbody></table></body></html>`;
}

export function exportToPDF(data: Row[], title = "Credit Bank Export") {
  if (!data.length) throw new Error("No data to export");
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) throw new Error("Popup blocked — allow popups to print a PDF");
  win.document.write(generatePrintHTML(data, title));
  win.document.close();
  win.focus();
  win.print();
}

export function exportData(data: Row[], filename: string, options: ExportOptions) {
  const { format, includeHeaders = true } = options;
  switch (format) {
    case "csv":
      return exportToCSV(data, filename, includeHeaders);
    case "json":
      return exportToJSON(data, filename);
    case "xlsx":
      return exportToXLSX(data, filename);
    case "pdf":
      return exportToPDF(data, filename);
    default:
      throw new Error(`Unsupported export type: ${format as string}`);
  }
}
