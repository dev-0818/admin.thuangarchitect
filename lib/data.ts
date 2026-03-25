import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { mockProjects, mockSettings } from "@/lib/mock-data";
import {
  DashboardStats,
  Project,
  ProjectCategory,
  ProjectImage,
  SiteSettings
} from "@/lib/types";

const memoryStore = {
  projects: structuredClone(mockProjects),
  settings: structuredClone(mockSettings)
};

function sortProjects(projects: Project[]) {
  return [...projects].sort((left, right) => {
    if (left.category === right.category) {
      return left.sortOrder - right.sortOrder;
    }

    return left.category.localeCompare(right.category);
  });
}

function normalizeProject(project: Project): Project {
  return {
    ...project,
    images: [...project.images].sort((left, right) => left.sortOrder - right.sortOrder)
  };
}

export async function listProjects() {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return sortProjects(memoryStore.projects).map(normalizeProject);
  }

  const { data: projects, error } = await supabase
    .from("projects")
    .select("id,title,slug,category,description,cover_image_url,sort_order,is_published,created_at,updated_at,project_images(id,image_url,storage_path,alt_text,sort_order)")
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (projects ?? []).map((project) => ({
    id: project.id,
    title: project.title,
    slug: project.slug,
    category: project.category as ProjectCategory,
    description: project.description ?? "",
    coverImageUrl: project.cover_image_url,
    sortOrder: project.sort_order ?? 0,
    isPublished: project.is_published ?? false,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
    images: (project.project_images ?? [])
      .map((image) => ({
        id: image.id,
        imageUrl: image.image_url,
        storagePath: image.storage_path,
        altText: image.alt_text,
        sortOrder: image.sort_order ?? 0
      }))
      .sort((left, right) => left.sortOrder - right.sortOrder)
  }));
}

export async function getProjectById(id: string) {
  const projects = await listProjects();
  return projects.find((project) => project.id === id) ?? null;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const projects = await listProjects();
  const totalProjects = projects.length;
  const publishedProjects = projects.filter((project) => project.isPublished).length;
  const draftProjects = totalProjects - publishedProjects;
  const latest = [...projects].sort((left, right) => {
    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  })[0];

  return {
    totalProjects,
    publishedProjects,
    draftProjects,
    lastUpdatedAt: latest?.updatedAt ?? null,
    lastUpdatedProject: latest?.title ?? null
  };
}

export async function getSettings(): Promise<SiteSettings> {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return structuredClone(memoryStore.settings);
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select("id,site_title,tagline,bio,email,phone,instagram_url,whatsapp_url,updated_at")
    .eq("id", 1)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    siteTitle: data.site_title ?? "",
    tagline: data.tagline ?? "",
    bio: data.bio ?? "",
    email: data.email ?? "",
    phone: data.phone ?? "",
    instagramUrl: data.instagram_url ?? "",
    whatsappUrl: data.whatsapp_url ?? "",
    updatedAt: data.updated_at
  };
}

export async function getNextProjectSortOrder(category: ProjectCategory) {
  const projects = await listProjects();
  const categoryProjects = projects.filter((project) => project.category === category);

  if (categoryProjects.length === 0) {
    return 0;
  }

  return Math.max(...categoryProjects.map((project) => project.sortOrder)) + 1;
}

export async function upsertProject(input: Project) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    const next = structuredClone(input);
    const index = memoryStore.projects.findIndex((project) => project.id === input.id);

    if (index >= 0) {
      memoryStore.projects[index] = next;
    } else {
      memoryStore.projects.push(next);
    }

    return next;
  }

  const { data, error } = await supabase
    .from("projects")
    .upsert(
      {
        id: input.id,
        title: input.title,
        slug: input.slug,
        category: input.category,
        description: input.description,
        cover_image_url: input.coverImageUrl,
        sort_order: input.sortOrder,
        is_published: input.isPublished,
        updated_at: input.updatedAt
      },
      { onConflict: "id" }
    )
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const currentProjectId = data.id;

  const { data: existingImages, error: existingError } = await supabase
    .from("project_images")
    .select("id,storage_path")
    .eq("project_id", currentProjectId);

  if (existingError) {
    throw new Error(existingError.message);
  }

  const incomingIds = new Set(input.images.map((image) => image.id));
  const imagesToDelete = (existingImages ?? []).filter((image) => !incomingIds.has(image.id));

  if (imagesToDelete.length > 0) {
    await supabase
      .from("project_images")
      .delete()
      .in(
        "id",
        imagesToDelete.map((image) => image.id)
      );

    const storagePaths = imagesToDelete
      .map((image) => image.storage_path)
      .filter((path): path is string => Boolean(path));

    if (storagePaths.length > 0) {
      await supabase.storage.from("portfolio-images").remove(storagePaths);
    }
  }

  if (input.images.length > 0) {
    const { error: imageError } = await supabase.from("project_images").upsert(
      input.images.map((image) => ({
        id: image.id,
        project_id: currentProjectId,
        image_url: image.imageUrl,
        storage_path: image.storagePath,
        alt_text: image.altText,
        sort_order: image.sortOrder
      })),
      { onConflict: "id" }
    );

    if (imageError) {
      throw new Error(imageError.message);
    }
  }

  return input;
}

export async function reorderProjects(category: ProjectCategory, ids: string[]) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    const categoryProjects = memoryStore.projects
      .filter((project) => project.category === category)
      .sort((left, right) => left.sortOrder - right.sortOrder);

    ids.forEach((id, index) => {
      const project = categoryProjects.find((entry) => entry.id === id);
      if (project) {
        project.sortOrder = index;
        project.updatedAt = new Date().toISOString();
      }
    });

    return;
  }

  await Promise.all(
    ids.map((id, index) =>
      supabase.from("projects").update({ sort_order: index }).eq("id", id).eq("category", category)
    )
  );
}

export async function updateSettings(input: SiteSettings) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    memoryStore.settings = structuredClone(input);
    return input;
  }

  const { error } = await supabase.from("site_settings").upsert({
    id: 1,
    site_title: input.siteTitle,
    tagline: input.tagline,
    bio: input.bio,
    email: input.email,
    phone: input.phone,
    instagram_url: input.instagramUrl,
    whatsapp_url: input.whatsappUrl,
    updated_at: input.updatedAt
  });

  if (error) {
    throw new Error(error.message);
  }

  return input;
}

export async function setProjectPublished(id: string, isPublished: boolean) {
  const project = await getProjectById(id);

  if (!project) {
    throw new Error("Project tidak ditemukan.");
  }

  await upsertProject({
    ...project,
    isPublished,
    updatedAt: new Date().toISOString()
  });
}

export async function deleteProject(id: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    memoryStore.projects = memoryStore.projects.filter((project) => project.id !== id);
    return;
  }

  const { data: images, error: imageError } = await supabase
    .from("project_images")
    .select("storage_path")
    .eq("project_id", id);

  if (imageError) {
    throw new Error(imageError.message);
  }

  const storagePaths = (images ?? [])
    .map((image) => image.storage_path)
    .filter((path): path is string => Boolean(path));

  if (storagePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("portfolio-images")
      .remove(storagePaths);

    if (storageError) {
      throw new Error(storageError.message);
    }
  }

  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export function createEmptyProject(): Project {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    title: "",
    slug: "",
    category: "komersial",
    description: "",
    coverImageUrl: null,
    sortOrder: 0,
    isPublished: false,
    createdAt: now,
    updatedAt: now,
    images: []
  };
}

export function serializeImages(images: ProjectImage[]) {
  return JSON.stringify(images);
}

