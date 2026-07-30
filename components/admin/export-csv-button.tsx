import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportCsvButtonProps {
  status?: string;
  search?: string;
}

/** Downloads customer details (name/phone/address/…) for the current filter, as CSV. */
export function ExportCsvButton({ status, search }: ExportCsvButtonProps) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (search) params.set("search", search);
  const qs = params.toString();

  return (
    <Button asChild variant="secondary" size="sm">
      <a href={`/api/admin/orders-export${qs ? `?${qs}` : ""}`} download>
        <Download />
        <span className="hidden sm:inline">Export CSV</span>
      </a>
    </Button>
  );
}
