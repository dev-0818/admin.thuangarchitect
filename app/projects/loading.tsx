import { PageLoadingShell } from "@/components/page-loading-shell";

export default function Loading() {
  return (
    <PageLoadingShell
      currentPath="/projects"
      description="Kelola seluruh project per kategori, ubah status publish, dan simpan urutan tampilan untuk website publik."
      eyebrow="Project Management"
      title={
        <>
          Project <span className="text-primary-container">Archive</span>
        </>
      }
    >
      <section className="space-y-6">
        <div className="h-10 w-52 skeleton-block" />
        <div className="h-24 w-full skeleton-block" />
        <div className="h-24 w-full skeleton-block" />
        <div className="h-24 w-full skeleton-block" />
      </section>
      <section className="mt-12 space-y-6">
        <div className="h-10 w-52 skeleton-block" />
        <div className="h-24 w-full skeleton-block" />
        <div className="h-24 w-full skeleton-block" />
      </section>
    </PageLoadingShell>
  );
}
