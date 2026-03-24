import Link from "next/link";

import { AdminShell } from "@/components/admin-shell";
import { ProjectListBoard } from "@/components/project-list-board";
import { listProjects } from "@/lib/data";

export default async function ProjectsPage() {
  const projects = await listProjects();
  const komersial = projects.filter((project) => project.category === "komersial");
  const residential = projects.filter((project) => project.category === "residential");

  return (
    <AdminShell
      actions={
        <Link className="primary-button" href="/projects/new">
          Add New Project
        </Link>
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
