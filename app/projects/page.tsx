import { AdminShell } from "@/components/admin-shell";
import { LoadingLinkButton } from "@/components/loading-link-button";
import { ProjectListBoard } from "@/components/project-list-board";
import { listProjects } from "@/lib/data";

type ProjectsPageProps = {
  searchParams?: Promise<{
    saved?: string;
    message?: string;
  }>;
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const params = (await searchParams) ?? {};
  const projects = await listProjects();
  const komersial = projects.filter((project) => project.category === "komersial");
  const residential = projects.filter((project) => project.category === "residential");

  return (
    <AdminShell
      actions={
        <LoadingLinkButton
          className="primary-button"
          href="/projects/new"
          icon="add"
          loadingLabel="Opening..."
        >
          Add New Project
        </LoadingLinkButton>
      }
      currentPath="/projects"
      description="Kelola seluruh project per kategori, ubah status publish, dan simpan urutan tampilan untuk website publik."
      eyebrow="Project Management"
      title={
        <>
          Project <span className="text-primary-container">Archive</span>
        </>
      }
    >
      {params.saved ? (
        <div className="mb-8 rounded-sm border-l-4 border-secondary bg-surface-container-high p-5 text-sm text-on-surface">
          {decodeURIComponent(params.message ?? "Project berhasil disimpan.")}
        </div>
      ) : null}
      <ProjectListBoard category="komersial" projects={komersial} />
      <ProjectListBoard category="residential" projects={residential} />
    </AdminShell>
  );
}
