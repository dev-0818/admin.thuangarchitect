import { clsx } from "clsx";

import { ProjectCategory } from "@/lib/types";

export function cn(...values: Array<string | false | null | undefined>) {
  return clsx(values);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function sentenceCaseCategory(category: ProjectCategory) {
  return category === "komersial" ? "Komersial" : "Residential";
}

export function formatTimestamp(input: string | null) {
  if (!input) {
    return "Belum ada perubahan";
  }

  const date = new Date(input);

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function formatRelativeTime(input: string | null) {
  if (!input) {
    return "Belum ada perubahan";
  }

  const date = new Date(input).getTime();
  const diff = date - Date.now();
  const minutes = Math.round(diff / (1000 * 60));
  const rtf = new Intl.RelativeTimeFormat("id-ID", { numeric: "auto" });

  if (Math.abs(minutes) < 60) {
    return rtf.format(minutes, "minute");
  }

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) {
    return rtf.format(hours, "hour");
  }

  const days = Math.round(hours / 24);
  return rtf.format(days, "day");
}

export function buildPublicProjectUrl(category: ProjectCategory, slug: string) {
  return `/portfolio/${category}/${slug}/`;
}
