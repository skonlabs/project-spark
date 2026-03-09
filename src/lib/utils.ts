import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Extract a human-readable title from a URL slug */
export function titleFromUrl(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    const slug = u.pathname.split("/").filter(Boolean).pop() ?? u.hostname;
    return (
      slug
        .replace(/[-_]/g, " ")
        .replace(/\.\w+$/, "")
        .replace(/\b\w/g, (c) => c.toUpperCase()) || u.hostname
    );
  } catch {
    return url.split("/").filter(Boolean).pop() ?? "Untitled";
  }
}

/** Tailwind text colour class for an AI-visibility score */
export function scoreTextColor(score: number): string {
  return score >= 65 ? "text-green-400" : score >= 45 ? "text-yellow-400" : "text-red-400";
}

/** Tailwind background colour class for an AI-visibility score */
export function scoreBgColor(score: number): string {
  return score >= 65 ? "bg-green-400" : score >= 45 ? "bg-yellow-400" : "bg-red-400";
}
