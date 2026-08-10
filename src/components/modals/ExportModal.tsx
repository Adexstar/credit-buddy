import { useState } from "react";
import { Download, FileJson, FileSpreadsheet, FileText, Printer, X } from "lucide-react";
import type { ExportFormat, ExportOptions } from "@/utils/export";

const FORMATS: Array<{ value: ExportFormat; label: string; icon: typeof FileText }> = [
  { value: "csv", label: "CSV", icon: FileText },
  { value: "xlsx", label: "Excel", icon: FileSpreadsheet },
  { value: "pdf", label: "PDF", icon: Printer },
  { value: "json", label: "JSON", icon: FileJson },
];

const RANGES = [
  { value: "today", label: "Today" },
  { value: "week", label: "Last 7 days" },
  { value: "month", label: "Last 30 days" },
  { value: "quarter", label: "Last 90 days" },
  { value: "year", label: "This year" },
  { value: "all", label: "All time" },
];

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
  rowCount?: number;
}

export function ExportModal({ isOpen, onClose, onExport, rowCount }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [dateRange, setDateRange] = useState("all");
  const [includeHeaders, setIncludeHeaders] = useState(true);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Export data"
      className="fixed inset-0 z-[110] flex items-center justify-center bg-vault-bg/80 p-4 backdrop-blur-sm animate-[vault-fade-in_0.15s_ease-out]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-vault-border bg-vault-panel p-6 shadow-2xl animate-[vault-scale-in_0.18s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-vault-foreground">Export data</h2>
            <p className="mt-1 text-sm text-vault-muted">
              {rowCount !== undefined ? `${rowCount} rows ready • ` : ""}Choose format and options
            </p>
          </div>
          <button
            type="button"
            aria-label="Close export dialog"
            onClick={onClose}
            className="rounded-md p-1 text-vault-faint transition hover:bg-vault-raised hover:text-vault-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium tracking-wide text-vault-muted uppercase">Format</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {FORMATS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormat(value)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs transition ${
                    format === value
                      ? "border-vault-teal/50 bg-vault-teal/10 text-vault-teal"
                      : "border-vault-border text-vault-muted hover:bg-vault-raised"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="export-range" className="mb-1.5 block text-xs font-medium tracking-wide text-vault-muted uppercase">
              Date range
            </label>
            <select
              id="export-range"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full rounded-xl border border-vault-border bg-vault-bg px-3 py-2 text-sm text-vault-foreground outline-none focus:border-vault-teal/60"
            >
              {RANGES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-vault-muted">
            <input
              type="checkbox"
              checked={includeHeaders}
              onChange={(e) => setIncludeHeaders(e.target.checked)}
              className="size-4 rounded border-vault-border bg-vault-bg accent-vault-teal"
            />
            Include column headers
          </label>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-vault-border px-4 py-2 text-sm text-vault-muted transition hover:text-vault-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onExport({ format, dateRange, includeHeaders });
                onClose();
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-vault-teal px-4 py-2 text-sm font-medium text-vault-bg transition hover:opacity-90"
            >
              <Download size={15} />
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
