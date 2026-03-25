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

export function normalizeWhatsAppPhone(input: string) {
  const digits = input.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("62")) {
    return digits;
  }

  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }

  if (digits.startsWith("8")) {
    return `62${digits}`;
  }

  return digits;
}

export function buildWhatsAppUrlFromPhone(input: string) {
  const phone = normalizeWhatsAppPhone(input);

  if (!phone) {
    return "";
  }

  return `https://api.whatsapp.com/send/?phone=${phone}&text&type=phone_number&app_absent=0`;
}
