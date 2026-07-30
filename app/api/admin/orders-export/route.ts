import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { listCustomerExport } from "@/lib/services/order-service";
import { ORDER_STATUSES, type OrderStatus } from "@/types";

export const runtime = "nodejs";

const COLUMNS = [
  "Order Number",
  "Name",
  "Phone",
  "WhatsApp",
  "Email",
  "Address",
  "City",
  "Placed At",
] as const;

/** Wraps a value in double quotes and escapes any inner quotes, per RFC 4180. */
function csvCell(value: string | undefined): string {
  const s = value ?? "";
  return `"${s.replace(/"/g, '""')}"`;
}

/**
 * Admin-only — CSV export of customer contact details (name/phone/address/…)
 * for whichever orders match the current search/status filter on the All
 * Orders screen. Does not include payment, pricing, or item data.
 */
export async function GET(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status");
  const status =
    statusParam && ORDER_STATUSES.includes(statusParam as OrderStatus)
      ? (statusParam as OrderStatus)
      : undefined;
  const search = searchParams.get("search")?.trim() || undefined;

  const rows = await listCustomerExport({ status, search });

  const lines = [
    COLUMNS.map(csvCell).join(","),
    ...rows.map((r) =>
      [
        csvCell(r.orderNumber),
        csvCell(r.name),
        csvCell(r.phone),
        csvCell(r.whatsapp),
        csvCell(r.email),
        csvCell(r.address),
        csvCell(r.city),
        csvCell(r.createdAt),
      ].join(","),
    ),
  ];
  const csv = lines.join("\r\n");

  const filename = `brownza-customers-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
