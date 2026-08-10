import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { exportData, type ExportFormat, type Row } from "@/utils/export";

interface ExportButtonProps {
  data: Row[];
  filename?: string;
  type?: ExportFormat;
  buttonText?: string;
  className?: string;
}

export function ExportButton({
  data,
  filename = "export",
  type = "csv",
  buttonText = "Export",
  className = "",
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const run = async () => {
    setIsExporting(true);
    try {
      exportData(data, filename, { format: type });
      toast.success(`Exported ${filename}.${type}`);
    } catch (error) {
      toast.error(`Export failed: ${(error as Error).message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void run()}
      disabled={isExporting}
      className={`inline-flex items-center gap-2 rounded-full border border-vault-border bg-vault-panel px-4 py-2 text-sm text-vault-muted transition hover:text-vault-foreground disabled:opacity-50 ${className}`}
    >
      {isExporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
      {isExporting ? "Exporting…" : buttonText}
    </button>
  );
}
