import { PageLoadingShell } from "@/components/page-loading-shell";

export default function Loading() {
  return (
    <PageLoadingShell
      currentPath="/settings"
      description="Edit identitas studio, kontak publik, social links, dan konten ringkas yang akan ikut masuk ke hasil static build website."
      eyebrow="Site Settings"
      title={
        <>
          Core <span className="text-primary-container">Identity</span>
        </>
      }
    >
      <div className="grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="section-card">
          <div className="h-72 w-full skeleton-block" />
        </section>
        <section className="section-card">
          <div className="h-[32rem] w-full skeleton-block" />
        </section>
      </div>
    </PageLoadingShell>
  );
}
