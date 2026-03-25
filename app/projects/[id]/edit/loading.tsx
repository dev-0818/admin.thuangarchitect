import { PageLoadingShell } from "@/components/page-loading-shell";

export default function Loading() {
  return (
    <PageLoadingShell
      currentPath="/projects"
      description="Update metadata project dan gallery asset sambil menjaga urutan tampil serta cover image untuk portfolio publik."
      eyebrow="Project Management"
      title={
        <>
          Edit <span className="text-primary-container">Project</span>
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
