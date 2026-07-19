import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <Loader2 className="size-8 animate-spin text-accent" />
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  );
}
