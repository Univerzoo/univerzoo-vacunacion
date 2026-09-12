import clsx from "clsx";
import { Card } from "@/components/ui/primitives";

export function StatCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number | string;
  tone?: "neutral" | "orange" | "success" | "warning" | "danger";
}) {
  return (
    <Card className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-brand-brown-soft">
        {label}
      </span>
      <span
        className={clsx(
          "text-2xl font-bold",
          tone === "neutral" && "text-brand-brown",
          tone === "orange" && "text-brand-orange-dark",
          tone === "success" && "text-status-al-dia",
          tone === "warning" && "text-status-proxima",
          tone === "danger" && "text-status-vencida"
        )}
      >
        {value}
      </span>
    </Card>
  );
}
