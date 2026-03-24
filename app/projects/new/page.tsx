import { AdminShell } from "@/components/admin-shell";
import { ProjectEditor } from "@/components/project-editor";
import { createEmptyProject } from "@/lib/data";

type NewProjectPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default function NewProjectPage({ searchParams }: NewProjectPageProps) {
  return (
    <AdminShell
      currentPath="/projects"
      description="Buat project baru sesuai struktur PRD: title, slug, category, publish state, sort order, dan gallery image."
      eyebrow="Project Management"
      title={
        <>
          Create <span className="text-primary-container">Project</span>
        </>
      }
    >
      <ProjectEditor
        errorMessage={
          searchParams?.error === "validation"
            ? "Cek lagi field wajib: title, slug, category, description, cover image, dan sort order."
            : searchParams?.error === "cover"
              ? "Pilih cover image dari gallery sebelum menyimpan."
              : undefined
        }
        mode="create"
        project={createEmptyProject()}
      />
    </AdminShell>
  );
}
