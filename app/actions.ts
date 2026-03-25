"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  deleteProject,
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

function formatProjectValidationErrors(error: z.ZodError) {
  return error.issues
    .map((issue) => {
      const path = issue.path.join(".");

      switch (path) {
        case "title":
          return "Title minimal 2 karakter.";
        case "slug":
          return "Slug minimal 2 karakter dan tidak boleh kosong.";
        case "category":
          return "Category harus komersial atau residential.";
        case "description":
          return "Description minimal 8 karakter.";
        case "sortOrder":
          return "Sort order harus angka 0 atau lebih.";
        case "coverImageUrl":
          return "Cover image wajib dipilih.";
        case "images":
          return "Upload minimal satu gambar project.";
        default:
          return issue.message;
      }
    })
    .filter(Boolean)
    .join(" ");
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

async function ensureAuthorizedAdmin() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };

  if (!user?.email || (process.env.ADMIN_EMAIL && user.email !== process.env.ADMIN_EMAIL)) {
    redirect("/login");
  }

  return user;
}

export async function saveProjectAction(formData: FormData) {
  await ensureAuthorizedAdmin();
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
    redirect(
      `/projects${projectId ? `/${projectId}/edit` : "/new"}?error=validation&message=${encodeURIComponent(
        formatProjectValidationErrors(parsed.error)
      )}`
    );
  }

  if (!parsed.data.coverImageUrl) {
    redirect(`/projects${projectId ? `/${projectId}/edit` : "/new"}?error=cover`);
  }

  const now = new Date().toISOString();
  const nextProjectId = existingProject?.id || projectId || crypto.randomUUID();

  const project: Project = {
    id: nextProjectId,
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

  try {
    await upsertProject(project);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Menyimpan project ke database gagal.";
    redirect(
      `/projects${projectId ? `/${projectId}/edit` : "/new"}?error=save&message=${encodeURIComponent(message)}`
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath("/settings");
  revalidatePath(`/projects/${project.id}/edit`);

  redirect(`/projects/${project.id}/edit?saved=1&build=${encodeURIComponent("Project berhasil disimpan.")}`);
}

export async function reorderProjectsAction(payload: ReorderPayload) {
  await ensureAuthorizedAdmin();
  await reorderProjects(payload.category, payload.ids);

  revalidatePath("/dashboard");
  revalidatePath("/projects");

  return "Urutan project berhasil disimpan.";
}

export async function toggleProjectPublishAction(projectId: string, isPublished: boolean) {
  await ensureAuthorizedAdmin();
  await setProjectPublished(projectId, isPublished);

  revalidatePath("/dashboard");
  revalidatePath("/projects");

  return isPublished
    ? "Project dipublish. Klik Trigger Rebuild di dashboard untuk sinkronkan website publik."
    : "Project dijadikan draft. Klik Trigger Rebuild di dashboard untuk sinkronkan website publik.";
}

export async function deleteProjectAction(projectId: string) {
  await ensureAuthorizedAdmin();
  await deleteProject(projectId);

  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}/edit`);

  return "Project dan seluruh image berhasil dihapus.";
}

export async function saveSettingsAction(formData: FormData) {
  await ensureAuthorizedAdmin();
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

  revalidatePath("/dashboard");
  revalidatePath("/settings");

  redirect(`/settings?saved=1&build=${encodeURIComponent("Settings berhasil disimpan.")}`);
}

export async function signOutAction() {
  const supabase = await getSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/login");
}
