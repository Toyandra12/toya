import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  trend,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  trend?: "up" | "down" | "flat";
  icon?: ReactNode;
}) {
  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between">
        <div className="label">{label}</div>
        {icon ? <div className="text-brand-400">{icon}</div> : null}
      </div>
      <div className="mt-2 text-2xl font-semibold text-slate-100">{value}</div>
      {hint ? (
        <div
          className={cn(
            "mt-1 text-xs",
            trend === "up" && "text-success",
            trend === "down" && "text-danger",
            !trend && "text-slate-400",
          )}
        >
          {hint}
        </div>
      ) : null}
    </div>
  );
}
