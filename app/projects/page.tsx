import { AdminShell } from "@/components/admin-shell";
import { LoadingLinkButton } from "@/components/loading-link-button";
import { ProjectListBoard } from "@/components/project-list-board";
import { listProjects } from "@/lib/data";

export default async function ProjectsPage() {
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
      <ProjectListBoard category="komersial" projects={komersial} />
      <ProjectListBoard category="residential" projects={residential} />
    </AdminShell>
  );
}
