export type ProjectCategory = "komersial" | "residential";

export type ProjectImage = {
  id: string;
  imageUrl: string;
  storagePath: string;
  altText: string | null;
  sortOrder: number;
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  category: ProjectCategory;
  description: string;
  coverImageUrl: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  images: ProjectImage[];
};

export type SiteSettings = {
  id: number;
  siteTitle: string;
  tagline: string;
  bio: string;
  email: string;
  phone: string;
  instagramUrl: string;
  whatsappUrl: string;
  googleMapsUrl: string;
  updatedAt: string;
};

export type DashboardStats = {
  totalProjects: number;
  publishedProjects: number;
  draftProjects: number;
  lastUpdatedAt: string | null;
  lastUpdatedProject: string | null;
};

export type ActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export type ReorderPayload = {
  category: ProjectCategory;
  ids: string[];
};
