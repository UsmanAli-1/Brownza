import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import { getRecentActivity } from "@/lib/services/activity-service";
import { formatRelativeTime } from "@/lib/utils";

const ICONS: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  "order.created": { icon: ShoppingBag, className: "bg-blue-100 text-blue-700" },
  "order.accepted": {
    icon: CheckCircle2,
    className: "bg-blue-100 text-blue-700",
  },
  "status.updated": {
    icon: ArrowRight,
    className: "bg-orange-100 text-orange-700",
  },
  "payment.verified": {
    icon: BadgeCheck,
    className: "bg-emerald-100 text-emerald-700",
  },
  "order.cancelled": { icon: XCircle, className: "bg-red-100 text-red-700" },
  "order.delivered": { icon: Truck, className: "bg-green-100 text-green-700" },
};

export async function RecentActivity() {
  const activity = await getRecentActivity(20);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <h2 className="font-heading text-lg font-semibold text-foreground">
        Recent activity
      </h2>
      {activity.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No activity yet.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {activity.map((a) => {
            const meta = ICONS[a.type] ?? {
              icon: ArrowRight,
              className: "bg-muted text-muted-foreground",
            };
            const Icon = meta.icon;
            return (
              <li key={a._id} className="flex items-start gap-3">
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full ${meta.className}`}
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug text-foreground">
                    {a.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(a.createdAt)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
