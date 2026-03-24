import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin-shell";
import { ProjectEditor } from "@/components/project-editor";
import { getProjectById } from "@/lib/data";

type EditProjectPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    saved?: string;
    build?: string;
    error?: string;
  }>;
};

export default async function EditProjectPage({
  params,
  searchParams
}: EditProjectPageProps) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const project = await getProjectById(id);

  if (!project) {
    notFound();
  }

  return (
    <AdminShell
      currentPath="/projects"
      description="Update metadata project dan gallery asset sambil menjaga urutan tampil serta cover image untuk portfolio publik."
      eyebrow="Project Management"
      title={
        <>
          Edit <span className="text-primary-container">{project.title}</span>
        </>
      }
    >
      <ProjectEditor
        errorMessage={
          resolvedSearchParams?.error === "validation"
            ? "Beberapa field masih belum valid. Pastikan semua data inti terisi."
            : resolvedSearchParams?.error === "cover"
              ? "Cover image wajib dipilih sebelum menyimpan."
              : undefined
        }
        mode="edit"
        project={project}
        statusMessage={
          resolvedSearchParams?.saved
            ? decodeURIComponent(
                resolvedSearchParams.build ?? "Perubahan project berhasil disimpan."
              )
            : undefined
        }
      />
    </AdminShell>
  );
}
