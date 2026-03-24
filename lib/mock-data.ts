import { Project, ProjectCategory, SiteSettings } from "@/lib/types";
import { slugify } from "@/lib/utils";

const imagePool = [
  "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1519642918688-7e43b19245d8?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1600&q=80"
];

type ProjectSeed = {
  title: string;
  category: ProjectCategory;
  description: string;
};

const seeds: ProjectSeed[] = [
  { title: "Brastagi", category: "komersial", description: "Commercial architecture project focused on clean structure, material precision, and spatial clarity." },
  { title: "Cakalang", category: "komersial", description: "A composed commercial environment with layered circulation and restrained architectural gestures." },
  { title: "CBD Polonia", category: "komersial", description: "Urban-scale commercial development balancing presence, efficiency, and daylight control." },
  { title: "Gudang MMTC", category: "komersial", description: "Industrial-commercial facility designed through rational spans, durable materials, and direct circulation." },
  { title: "Kalimantan Sampit", category: "komersial", description: "A project shaped by tropical response, practical zoning, and monolithic architectural character." },
  { title: "Mangkubumi Manado", category: "komersial", description: "Hospitality-adjacent commercial composition emphasizing facade rhythm and grounded massing." },
  { title: "Multatuli", category: "komersial", description: "Compact commercial program translated into a calm and contemporary spatial sequence." },
  { title: "Shemade", category: "komersial", description: "Boutique commercial project where muted palettes and structure-led design guide the experience." },
  { title: "Cemara Hijau", category: "residential", description: "Residential architecture centered on privacy, filtered light, and disciplined geometry." },
  { title: "De Cassa Villa", category: "residential", description: "Villa typology with quiet materiality, deep overhangs, and curated outward views." },
  { title: "GG Rukun", category: "residential", description: "Urban residence composed through narrow-site efficiency and refined daylight strategy." },
  { title: "Lexington", category: "residential", description: "A layered family house with controlled openness and strong sectional identity." },
  { title: "Maldives Citraland", category: "residential", description: "Residential project translating resort calm into a durable everyday domestic language." },
  { title: "Metal Raya", category: "residential", description: "A house defined by metal accents, precise detailing, and a compact monumental profile." },
  { title: "Rochester Citraland", category: "residential", description: "Contemporary residence balancing warmth, restraint, and generous interior continuity." },
  { title: "Royal Sumatra", category: "residential", description: "Large-format residence with gallery-like circulation and an extended visual sequence." },
  { title: "Sari Mas", category: "residential", description: "Refined family home with intimate courtyards and a clear hierarchy of shared spaces." },
  { title: "Setia Jadi", category: "residential", description: "Context-aware residence using disciplined massing and tactile neutral finishes." },
  { title: "Tembakau Deli", category: "residential", description: "Residential project shaped around proportion, shadow, and straightforward material honesty." }
];

function buildImages(slug: string, startIndex: number) {
  return new Array(4).fill(null).map((_, index) => {
    const imageUrl = imagePool[(startIndex + index) % imagePool.length];
    const id = `${slug}-image-${index + 1}`;
    return {
      id,
      imageUrl,
      storagePath: `projects/${slug}/${id}.webp`,
      altText: `${slug} gallery image ${index + 1}`,
      sortOrder: index
    };
  });
}

function buildProject(seed: ProjectSeed, index: number): Project {
  const slug = slugify(seed.title);
  const images = buildImages(slug, index);
  const published = index % 5 !== 0;
  const sortOrder = seed.category === "komersial" ? index : index - 8;
  const date = new Date(Date.now() - index * 1000 * 60 * 90).toISOString();

  return {
    id: `project-${slug}`,
    title: seed.title.toUpperCase(),
    slug,
    category: seed.category,
    description: seed.description,
    coverImageUrl: images[0]?.imageUrl ?? null,
    sortOrder,
    isPublished: published,
    createdAt: date,
    updatedAt: date,
    images
  };
}

export const mockProjects: Project[] = seeds.map(buildProject);

export const mockSettings: SiteSettings = {
  id: 1,
  siteTitle: "T. Huang Architects",
  tagline: "Modernizing the monolith through light and space.",
  bio: "Studio arsitektur yang berfokus pada presisi geometri, material jujur, dan pengalaman ruang yang tenang.",
  email: "contact@thuangarchitect.com",
  phone: "+62 812 3456 7890",
  instagramUrl: "https://instagram.com/thuangarchitect",
  whatsappUrl: "https://wa.me/6281234567890",
  googleMapsUrl: "https://maps.google.com",
  updatedAt: new Date().toISOString()
};
