import { PageLoadingShell } from "@/components/page-loading-shell";

export default function Loading() {
  return (
    <PageLoadingShell
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
        <div className="section-card xl:col-span-4"><div className="h-40 w-full skeleton-block" /></div>
        <div className="section-card xl:col-span-3"><div className="h-40 w-full skeleton-block" /></div>
        <div className="section-card xl:col-span-2"><div className="h-40 w-full skeleton-block" /></div>
        <div className="section-card xl:col-span-3"><div className="h-40 w-full skeleton-block" /></div>
      </section>
      <section className="section-card space-y-4">
        <div className="h-10 w-64 skeleton-block" />
        <div className="h-28 w-full skeleton-block" />
        <div className="h-28 w-full skeleton-block" />
        <div className="h-28 w-full skeleton-block" />
      </section>
    </PageLoadingShell>
  );
}
