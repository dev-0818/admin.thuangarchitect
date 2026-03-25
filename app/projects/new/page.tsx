import { AdminShell } from "@/components/admin-shell";
import { ProjectEditor } from "@/components/project-editor";
import { createEmptyProject } from "@/lib/data";

type NewProjectPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function NewProjectPage({ searchParams }: NewProjectPageProps) {
  const params = (await searchParams) ?? {};

  return (
    <AdminShell
      currentPath="/projects"
      description="Buat project baru sesuai struktur PRD: title, slug, category, publish state, dan gallery image."
      eyebrow="Project Management"
      title={
        <>
          Create <span className="text-primary-container">Project</span>
        </>
      }
    >
      <ProjectEditor
        errorMessage={
          params.error === "validation"
            ? decodeURIComponent(
                params.message ??
                  "Cek lagi field wajib: title, slug, category, description, dan cover image."
              )
            : params.error === "cover"
              ? "Pilih cover image dari gallery sebelum menyimpan."
              : params.error === "save"
                ? decodeURIComponent(params.message ?? "Menyimpan project ke database gagal.")
              : undefined
        }
        mode="create"
        project={createEmptyProject()}
      />
    </AdminShell>
  );
}
