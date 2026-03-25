import { PageLoadingShell } from "@/components/page-loading-shell";

export default function Loading() {
  return (
    <PageLoadingShell
      currentPath="/projects"
      description="Buat project baru sesuai struktur PRD: title, slug, category, publish state, dan gallery image."
      eyebrow="Project Management"
      title={
        <>
          Create <span className="text-primary-container">Project</span>
        </>
      }
    >
      <div className="grid gap-10 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
        <section className="section-card"><div className="h-[44rem] w-full skeleton-block" /></section>
        <section className="section-card"><div className="h-[44rem] w-full skeleton-block" /></section>
      </div>
    </PageLoadingShell>
  );
}
