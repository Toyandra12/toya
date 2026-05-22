import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function money(n: number | string | null | undefined, currency = "NPR") {
  const v = typeof n === "string" ? Number(n) : n ?? 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(v);
}

export function fmtNumber(n: number | string | null | undefined) {
  const v = typeof n === "string" ? Number(n) : n ?? 0;
  return new Intl.NumberFormat("en-US").format(v);
}

export function genOrderNo() {
  const now = new Date();
  const ymd = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CN-${ymd}-${rand}`;
}
