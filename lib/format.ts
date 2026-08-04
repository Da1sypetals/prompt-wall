import type { Prompt } from "@/lib/types";

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

export function sortPrompts(prompts: Prompt[]): Prompt[] {
  return [...prompts].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
