import { AdminShell } from "@/components/admin-shell";
import { LoadingLinkButton } from "@/components/loading-link-button";
import { StatusBadge } from "@/components/status-badge";
import { getDashboardStats, listProjects } from "@/lib/data";
import { formatRelativeTime, sentenceCaseCategory } from "@/lib/utils";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1600&q=80";

export default async function DashboardPage() {
  const [stats, projects] = await Promise.all([getDashboardStats(), listProjects()]);
  const recentProjects = [...projects]
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .slice(0, 4);

  return (
    <AdminShell
      actions={
        <LoadingLinkButton
          className="secondary-button"
          href="/projects/new"
          icon="add"
          loadingLabel="Opening..."
        >
          Add New Project
        </LoadingLinkButton>
      }
      currentPath="/dashboard"
      description="Overview cepat untuk seluruh project portfolio, status publish, dan sinkronisasi rebuild website publik."
      eyebrow="Architecture Portfolio Admin"
      title={
        <>
          Dashboard <span className="text-primary-container">Overview</span>
        </>
      }
    >
      <section className="mb-12 grid gap-4 xl:grid-cols-12">
        <div className="section-card xl:col-span-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-outline">
            Total Projects
          </p>
          <div className="mt-6 flex items-end gap-3">
            <span className="font-headline text-6xl font-black tracking-tight text-primary">
              {stats.totalProjects}
            </span>
            <span className="pb-2 text-sm text-secondary">Portfolio inventory</span>
          </div>
        </div>

        <div className="section-card xl:col-span-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-outline">
            Published
          </p>
          <p className="mt-6 font-headline text-5xl font-black tracking-tight text-on-surface">
            {stats.publishedProjects}
          </p>
        </div>

        <div className="section-card xl:col-span-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-outline">Drafts</p>
          <p className="mt-6 font-headline text-5xl font-black tracking-tight text-on-surface">
            {stats.draftProjects}
          </p>
        </div>

        <div className="section-card xl:col-span-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-outline">
            Last Updated
          </p>
          <p className="mt-6 text-lg font-semibold text-on-surface">
            {formatRelativeTime(stats.lastUpdatedAt)}
          </p>
          <p className="mt-2 text-sm text-outline">
            {stats.lastUpdatedProject ?? "Belum ada project"}
          </p>
        </div>
      </section>

      <section className="section-card">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-secondary">
              Recently Updated
            </p>
            <h2 className="mt-2 font-headline text-3xl font-black tracking-tight text-on-surface">
              Portfolio Activity
            </h2>
          </div>
          <LoadingLinkButton
            className="text-sm text-secondary transition hover:text-primary"
            href="/projects"
            loadingLabel="Opening Archive..."
          >
            View project archive
          </LoadingLinkButton>
        </div>

        <div className="space-y-4">
          {recentProjects.map((project) => (
            <article
              className="flex flex-col gap-5 rounded-sm bg-surface-container-low p-5 transition hover:bg-surface-bright md:flex-row md:items-center md:justify-between"
              key={project.id}
            >
              <div className="flex items-center gap-5">
                <div className="h-20 w-20 overflow-hidden rounded-sm bg-surface-container-high">
                  <img
                    alt={project.title}
                    className="h-full w-full object-cover grayscale transition duration-500 hover:grayscale-0"
                    src={project.coverImageUrl ?? project.images[0]?.imageUrl ?? FALLBACK_IMAGE}
                  />
                </div>
                <div>
                  <h3 className="font-headline text-xl font-bold tracking-tight text-primary">
                    {project.title}
                  </h3>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.28em] text-outline">
                    {sentenceCaseCategory(project.category)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 md:gap-8">
                <StatusBadge published={project.isPublished} />
                <LoadingLinkButton
                  className="secondary-button"
                  href={`/projects/${project.id}/edit`}
                  icon="edit"
                  loadingLabel="Opening..."
                >
                  Open Editor
                </LoadingLinkButton>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
