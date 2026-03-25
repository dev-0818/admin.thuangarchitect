import { AdminShell } from "@/components/admin-shell";
import { SettingsForm } from "@/components/settings-form";
import { getSettings } from "@/lib/data";
import { formatTimestamp } from "@/lib/utils";

type SettingsPageProps = {
  searchParams?: Promise<{
    saved?: string;
    build?: string;
    error?: string;
  }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const params = (await searchParams) ?? {};
  const settings = await getSettings();

  return (
    <AdminShell
      currentPath="/settings"
      description="Edit identitas studio, kontak publik, social links, dan konten ringkas yang akan ikut masuk ke hasil static build website."
      eyebrow="Site Settings"
      title={
        <>
          Core <span className="text-primary-container">Identity</span>
        </>
      }
    >
      {params.saved ? (
        <div className="mb-8 rounded-sm border-l-4 border-secondary bg-surface-container-high p-5 text-sm text-on-surface">
          {decodeURIComponent(params.build ?? "Settings saved.")}
        </div>
      ) : null}
      {params.error === "validation" ? (
        <div className="mb-8 rounded-sm border-l-4 border-error bg-surface-container-high p-5 text-sm text-error">
          Pastikan semua URL dan email valid sebelum menyimpan.
        </div>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="section-card">
          <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-secondary">
            Last Updated
          </p>
          <h2 className="mt-3 font-headline text-3xl font-black tracking-tight text-primary">
            {settings.siteTitle}
          </h2>
          <p className="mt-6 text-sm leading-7 text-on-surface-variant">{settings.bio}</p>
          <div className="mt-8 rounded-sm bg-surface-container-high p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-outline">
              Infrastructure
            </p>
            <p className="mt-3 text-sm text-on-surface-variant">
              Rebuild terakhir tercatat pada {formatTimestamp(settings.updatedAt)}.
            </p>
          </div>
        </section>

        <SettingsForm settings={settings} />
      </div>
    </AdminShell>
  );
}
