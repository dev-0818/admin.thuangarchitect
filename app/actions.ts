"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { triggerBuild } from "@/lib/build";
import {
  getProjectById,
  reorderProjects,
  setProjectPublished,
  updateSettings,
  upsertProject
} from "@/lib/data";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Project, ProjectImage, ReorderPayload, SiteSettings } from "@/lib/types";
import { slugify } from "@/lib/utils";

const imageSchema = z.object({
  id: z.string().min(1),
  imageUrl: z.string().min(1),
  storagePath: z.string(),
  altText: z.string().nullable(),
  sortOrder: z.number().int().nonnegative()
});

const projectSchema = z.object({
  projectId: z.string().optional(),
  title: z.string().min(2),
  slug: z.string().min(2),
  category: z.enum(["komersial", "residential"]),
  description: z.string().min(8),
  sortOrder: z.coerce.number().int().nonnegative(),
  isPublished: z.boolean(),
  coverImageUrl: z.string().nullable(),
  images: z.array(imageSchema)
});

const settingsSchema = z.object({
  siteTitle: z.string().min(2),
  tagline: z.string().min(2),
  bio: z.string().min(8),
  email: z.string().email(),
  phone: z.string().min(6),
  instagramUrl: z.string().url(),
  whatsappUrl: z.string().url(),
  googleMapsUrl: z.string().url()
});

async function safeTriggerBuild(reason: string) {
  try {
    return await triggerBuild(reason);
  } catch (error) {
    return {
      ok: false,
      skipped: true,
      message:
        error instanceof Error
          ? `Konten tersimpan, tapi trigger rebuild gagal: ${error.message}`
          : "Konten tersimpan, tapi trigger rebuild gagal."
    };
  }
}

function parseImages(raw: FormDataEntryValue | null) {
  if (!raw || typeof raw !== "string") {
    return [];
  }

  const parsed = JSON.parse(raw) as ProjectImage[];
  return parsed.map((image, index) => ({
    ...image,
    sortOrder: index,
    altText: image.altText ?? null
  }));
}

export async function saveProjectAction(formData: FormData) {
  const projectIdValue = formData.get("projectId");
  const projectId = typeof projectIdValue === "string" ? projectIdValue : "";
  const existingProject = projectId ? await getProjectById(projectId) : null;

  const images = parseImages(formData.get("imagesJson"));
  const coverImageFromForm = formData.get("coverImageUrl");
  const coverImageUrl =
    typeof coverImageFromForm === "string" && coverImageFromForm
      ? coverImageFromForm
      : images[0]?.imageUrl ?? null;

  const parsed = projectSchema.safeParse({
    projectId: projectId || undefined,
    title: formData.get("title"),
    slug: slugify(String(formData.get("slug") || formData.get("title") || "")),
    category: formData.get("category"),
    description: formData.get("description"),
    sortOrder: formData.get("sortOrder"),
    isPublished: formData.get("isPublished") === "on",
    coverImageUrl,
    images
  });

  if (!parsed.success) {
    redirect(`/projects${projectId ? `/${projectId}/edit` : "/new"}?error=validation`);
  }

  if (!parsed.data.coverImageUrl) {
    redirect(`/projects${projectId ? `/${projectId}/edit` : "/new"}?error=cover`);
  }

  const now = new Date().toISOString();

  const project: Project = {
    id: existingProject?.id || projectId || `project-${crypto.randomUUID()}`,
    title: parsed.data.title.toUpperCase(),
    slug: parsed.data.slug,
    category: parsed.data.category,
    description: parsed.data.description,
    coverImageUrl: parsed.data.coverImageUrl,
    sortOrder: parsed.data.sortOrder,
    isPublished: parsed.data.isPublished,
    createdAt: existingProject?.createdAt ?? now,
    updatedAt: now,
    images: parsed.data.images.map((image, index) => ({
      ...image,
      sortOrder: index
    }))
  };

  await upsertProject(project);

  const buildResult = await safeTriggerBuild("save-project");

  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath("/settings");
  revalidatePath(`/projects/${project.id}/edit`);

  redirect(
    `/projects/${project.id}/edit?saved=1&build=${encodeURIComponent(buildResult.message)}`
  );
}

export async function reorderProjectsAction(payload: ReorderPayload) {
  await reorderProjects(payload.category, payload.ids);
  const buildResult = await safeTriggerBuild("reorder-projects");

  revalidatePath("/dashboard");
  revalidatePath("/projects");

  return buildResult.message;
}

export async function toggleProjectPublishAction(projectId: string, isPublished: boolean) {
  await setProjectPublished(projectId, isPublished);
  const buildResult = await safeTriggerBuild("toggle-publish");

  revalidatePath("/dashboard");
  revalidatePath("/projects");

  return buildResult.message;
}

export async function saveSettingsAction(formData: FormData) {
  const parsed = settingsSchema.safeParse({
    siteTitle: formData.get("siteTitle"),
    tagline: formData.get("tagline"),
    bio: formData.get("bio"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    instagramUrl: formData.get("instagramUrl"),
    whatsappUrl: formData.get("whatsappUrl"),
    googleMapsUrl: formData.get("googleMapsUrl")
  });

  if (!parsed.success) {
    redirect("/settings?error=validation");
  }

  const settings: SiteSettings = {
    id: 1,
    ...parsed.data,
    updatedAt: new Date().toISOString()
  };

  await updateSettings(settings);
  const buildResult = await safeTriggerBuild("save-settings");

  revalidatePath("/dashboard");
  revalidatePath("/settings");

  redirect(`/settings?saved=1&build=${encodeURIComponent(buildResult.message)}`);
}

export async function signOutAction() {
  const supabase = await getSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/login");
}
